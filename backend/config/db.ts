import fs from 'fs';
import path from 'path';

// Directory for local persistent database collections
const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to generate a 24-char hex MongoDB ObjectId
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

export interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  populate?: string | { path: string; select?: string };
}

// In-memory collection cache with auto-flush to disk
class CollectionStore<T extends { _id?: string; [key: string]: any }> {
  private collectionName: string;
  private filePath: string;
  private documents: Map<string, T> = new Map();
  private isLoaded: boolean = false;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.documents.clear();
          for (const item of data) {
            const id = item._id || generateObjectId();
            this.documents.set(id, { ...item, _id: id });
          }
        }
      }
    } catch (err) {
      console.error(`Error loading collection ${this.collectionName}:`, err);
    }
    this.isLoaded = true;
  }

  private persist() {
    try {
      const data = Array.from(this.documents.values());
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error persisting collection ${this.collectionName}:`, err);
    }
  }

  private matchesFilter(doc: T, filter: Record<string, any>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const key of Object.keys(filter)) {
      const targetVal = filter[key];

      if (key === '$or' && Array.isArray(targetVal)) {
        const matchesAny = targetVal.some(subFilter => this.matchesFilter(doc, subFilter));
        if (!matchesAny) return false;
        continue;
      }

      if (key === '$and' && Array.isArray(targetVal)) {
        const matchesAll = targetVal.every(subFilter => this.matchesFilter(doc, subFilter));
        if (!matchesAll) return false;
        continue;
      }

      // Nested dot notation: 'assignedClass.department'
      let docVal: any = doc;
      if (key.includes('.')) {
        const parts = key.split('.');
        for (const p of parts) {
          docVal = docVal ? docVal[p] : undefined;
        }
      } else {
        docVal = doc[key];
      }

      if (targetVal !== null && typeof targetVal === 'object') {
        if (targetVal.$in && Array.isArray(targetVal.$in)) {
          if (!targetVal.$in.includes(docVal)) return false;
        } else if (targetVal.$nin && Array.isArray(targetVal.$nin)) {
          if (targetVal.$nin.includes(docVal)) return false;
        } else if (targetVal.$ne !== undefined) {
          if (docVal === targetVal.$ne) return false;
        } else if (targetVal.$regex) {
          const reg = new RegExp(targetVal.$regex, targetVal.$options || 'i');
          if (!reg.test(String(docVal || ''))) return false;
        } else if (targetVal.$gte !== undefined && docVal < targetVal.$gte) {
          return false;
        } else if (targetVal.$lte !== undefined && docVal > targetVal.$lte) {
          return false;
        } else if (targetVal.$gt !== undefined && docVal <= targetVal.$gt) {
          return false;
        } else if (targetVal.$lt !== undefined && docVal >= targetVal.$lt) {
          return false;
        }
      } else {
        if (docVal !== targetVal) {
          // Coerce ObjectId or string match
          if (String(docVal) !== String(targetVal)) return false;
        }
      }
    }
    return true;
  }

  find(filter: Record<string, any> = {}) {
    const self = this;
    let results = Array.from(this.documents.values()).filter(doc => this.matchesFilter(doc, filter));

    const queryBuilder = {
      sort(sortObj: Record<string, 1 | -1>) {
        const [sortKey, sortDir] = Object.entries(sortObj)[0] || [];
        if (sortKey) {
          results.sort((a: any, b: any) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (valA === valB) return 0;
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            if (valA > valB) return sortDir === 1 ? 1 : -1;
            return sortDir === 1 ? -1 : 1;
          });
        }
        return queryBuilder;
      },
      skip(count: number) {
        if (count > 0) results = results.slice(count);
        return queryBuilder;
      },
      limit(count: number) {
        if (count > 0) results = results.slice(0, count);
        return queryBuilder;
      },
      populate(field: string) {
        // Can be resolved by caller if needed
        return queryBuilder;
      },
      then(resolve: (val: T[]) => void) {
        resolve(JSON.parse(JSON.stringify(results)));
      },
      async exec(): Promise<T[]> {
        return JSON.parse(JSON.stringify(results));
      }
    };

    return queryBuilder;
  }

  async findOne(filter: Record<string, any> = {}): Promise<T | null> {
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) {
        return JSON.parse(JSON.stringify(doc));
      }
    }
    return null;
  }

  async findById(id: string): Promise<T | null> {
    const doc = this.documents.get(String(id));
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  async create(data: Partial<T> | Partial<T>[]): Promise<any> {
    const now = new Date().toISOString();
    if (Array.isArray(data)) {
      const created = data.map(item => {
        const id = item._id || generateObjectId();
        const doc = {
          ...item,
          _id: id,
          createdAt: item.createdAt || now,
          updatedAt: now
        } as unknown as T;
        this.documents.set(id, doc);
        return doc;
      });
      this.persist();
      return JSON.parse(JSON.stringify(created));
    } else {
      const id = data._id || generateObjectId();
      const doc = {
        ...data,
        _id: id,
        createdAt: data.createdAt || now,
        updatedAt: now
      } as unknown as T;
      this.documents.set(id, doc);
      this.persist();
      return JSON.parse(JSON.stringify(doc));
    }
  }

  async findByIdAndUpdate(id: string, update: any, options: { new?: boolean } = { new: true }): Promise<T | null> {
    const existing = this.documents.get(String(id));
    if (!existing) return null;

    const updatedData = { ...existing };
    const now = new Date().toISOString();

    if (update.$set) {
      Object.assign(updatedData, update.$set);
    } else if (update.$push) {
      for (const [key, val] of Object.entries(update.$push)) {
        if (!Array.isArray((updatedData as any)[key])) {
          (updatedData as any)[key] = [];
        }
        (updatedData as any)[key].push(val);
      }
    } else {
      // Direct fields
      Object.assign(updatedData, update);
    }
    (updatedData as any).updatedAt = now;

    this.documents.set(String(id), updatedData);
    this.persist();
    return JSON.parse(JSON.stringify(updatedData));
  }

  async updateOne(filter: Record<string, any>, update: any): Promise<{ modifiedCount: number }> {
    const doc = await this.findOne(filter);
    if (!doc || !doc._id) return { modifiedCount: 0 };
    await this.findByIdAndUpdate(doc._id, update);
    return { modifiedCount: 1 };
  }

  async updateMany(filter: Record<string, any>, update: any): Promise<{ modifiedCount: number }> {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        await this.findByIdAndUpdate(id, update);
        count++;
      }
    }
    return { modifiedCount: count };
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const existing = this.documents.get(String(id));
    if (!existing) return null;
    this.documents.delete(String(id));
    this.persist();
    return JSON.parse(JSON.stringify(existing));
  }

  async deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    const doc = await this.findOne(filter);
    if (!doc || !doc._id) return { deletedCount: 0 };
    this.documents.delete(doc._id);
    this.persist();
    return { deletedCount: 1 };
  }

  async deleteMany(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    let count = 0;
    for (const [id, doc] of this.documents.entries()) {
      if (this.matchesFilter(doc, filter)) {
        this.documents.delete(id);
        count++;
      }
    }
    this.persist();
    return { deletedCount: count };
  }

  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    let count = 0;
    for (const doc of this.documents.values()) {
      if (this.matchesFilter(doc, filter)) count++;
    }
    return count;
  }
}

const collections: Record<string, CollectionStore<any>> = {};

export function getCollection<T extends { _id?: string }>(name: string): CollectionStore<T> {
  if (!collections[name]) {
    collections[name] = new CollectionStore<T>(name);
  }
  return collections[name];
}

export const connectDB = async () => {
  console.log(`[Database] CampusConnect persistent database initialized at ${DATA_DIR}`);
  return true;
};
