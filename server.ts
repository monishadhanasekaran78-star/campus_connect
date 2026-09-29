import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './backend/config/db.js';
import { seedDatabase } from './backend/utils/seed.js';

import authRoutes from './backend/routes/authRoutes.js';
import studentRoutes from './backend/routes/studentRoutes.js';
import mentorRoutes from './backend/routes/mentorRoutes.js';
import advisorRoutes from './backend/routes/advisorRoutes.js';
import odRoutes from './backend/routes/odRoutes.js';
import documentRoutes from './backend/routes/documentRoutes.js';
import meetingRoutes from './backend/routes/meetingRoutes.js';
import counsellingRoutes from './backend/routes/counsellingRoutes.js';
import academicRoutes from './backend/routes/academicRoutes.js';
import lmsRoutes from './backend/routes/lmsRoutes.js';
import assessmentRoutes from './backend/routes/assessmentRoutes.js';
import placementRoutes from './backend/routes/placementRoutes.js';
import clubRoutes from './backend/routes/clubRoutes.js';
import eventRoutes from './backend/routes/eventRoutes.js';
import announcementRoutes from './backend/routes/announcementRoutes.js';
import notificationRoutes from './backend/routes/notificationRoutes.js';
import adminRoutes from './backend/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploads
  const uploadsDir = path.resolve(__dirname, 'backend', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Initialize DB and Seed Data
  await connectDB();
  await seedDatabase();

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/mentors', mentorRoutes);
  app.use('/api/advisors', advisorRoutes);
  app.use('/api/od', odRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/meetings', meetingRoutes);
  app.use('/api/counselling', counsellingRoutes);
  app.use('/api/academics', academicRoutes);
  app.use('/api/lms', lmsRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/placements', placementRoutes);
  app.use('/api/clubs', clubRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'CampusConnect College Portal',
      timestamp: new Date().toISOString()
    });
  });

  // Mount Vite or static production frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CampusConnect Portal running on port ${PORT} (dev mode: ${!isProduction})`);
  });
}

startServer().catch(err => {
  console.error('[Server Error] Failed to start CampusConnect server:', err);
});
