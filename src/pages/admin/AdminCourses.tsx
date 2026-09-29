import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, FileText, CheckCircle2, Upload } from 'lucide-react';
import { lmsService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Create Course State
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [department, setDepartment] = useState<string>('Computer Science and Engineering');
  const [semester, setSemester] = useState<number>(5);
  const [credits, setCredits] = useState<number>(4);
  const [description, setDescription] = useState<string>('');
  const [syllabus, setSyllabus] = useState<string>('');

  // Upload Material State
  const [matTitle, setMatTitle] = useState<string>('');
  const [matUnit, setMatUnit] = useState<string>('Unit 1');
  const [matDesc, setMatDesc] = useState<string>('');
  const [matFile, setMatFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await lmsService.getCourses();
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName) return;

    setSubmitting(true);
    try {
      const res = await lmsService.createCourse({
        courseCode,
        courseName,
        department,
        semester,
        credits,
        description,
        syllabus,
      });

      if (res.data.success) {
        setSuccessMsg(`Course ${courseCode} created successfully!`);
        setIsModalOpen(false);
        setCourseCode('');
        setCourseName('');
        setDescription('');
        setSyllabus('');
        fetchCourses();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !matTitle) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse._id);
      formData.append('title', matTitle);
      formData.append('unit', matUnit);
      formData.append('description', matDesc);
      if (matFile) {
        formData.append('file', matFile);
      }

      const res = await lmsService.uploadStudyMaterial(formData);
      if (res.data.success) {
        setSuccessMsg(`Study material uploaded to ${selectedCourse.courseCode}!`);
        setIsUploadOpen(false);
        setMatTitle('');
        setMatDesc('');
        setMatFile(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error uploading material');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-rose-600" />
            Curriculum Course Management & LMS Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure academic courses, syllabi, assign instructors, and publish learning materials.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-md">
                  {c.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {c.credits} Credits • Sem {c.semester}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{c.courseName}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
              <p className="text-[11px] text-slate-500 font-medium">Department: {c.department}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Faculty: {c.facultyName || 'Instructor'}</span>
              <button
                onClick={() => {
                  setSelectedCourse(c);
                  setIsUploadOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Material</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Curriculum Course"
        subtitle="Add a new academic course code, credits, and syllabus structure"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS3504"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Distributed Operating Systems"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of objectives and core concepts..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Syllabus Outline</label>
            <textarea
              rows={2}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Unit 1: Foundations | Unit 2: Architectures | Unit 3: Protocols..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Publish Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Material Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload LMS Study Resource"
        subtitle={`Course: ${selectedCourse?.courseCode} - ${selectedCourse?.courseName}`}
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Material Title *</label>
            <input
              type="text"
              required
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder="e.g. Unit 2 Lecture Notes on Distributed Schedulers"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Unit</label>
            <select
              value={matUnit}
              onChange={(e) => setMatUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              <option value="Unit 1">Unit 1</option>
              <option value="Unit 2">Unit 2</option>
              <option value="Unit 3">Unit 3</option>
              <option value="Unit 4">Unit 4</option>
              <option value="Unit 5">Unit 5</option>
              <option value="Lab Manual">Lab Manual</option>
              <option value="Question Bank">Question Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              placeholder="Key notes and references..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Attachment</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setMatFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Publish Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
