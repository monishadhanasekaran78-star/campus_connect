import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, UserCheck, Layers, ChevronRight } from 'lucide-react';
import { lmsService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const LMS: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);

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

  const handleOpenCourse = async (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    setMaterialsLoading(true);
    try {
      const res = await lmsService.getCourseDetail(course._id);
      if (res.data.success) {
        setCourseMaterials(res.data.materials || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
          Learning Management System (LMS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Access course materials, lecture notes, lab manuals, and syllabus modules published by course instructors.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  {course.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {course.credits} Credits • Sem {course.semester}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{course.courseName}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{course.description}</p>

              <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Instructor: {course.facultyName || 'Faculty'}</span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Department of {course.department}</span>
              <button
                onClick={() => handleOpenCourse(course)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                <span>Study Materials</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse?.courseName || 'Course Detail'}
        subtitle={`${selectedCourse?.courseCode} • Faculty: ${selectedCourse?.facultyName || 'Instructor'}`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Syllabus Box */}
          {selectedCourse?.syllabus && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Curriculum Syllabus Outline
              </h4>
              <p className="text-xs text-slate-600">{selectedCourse.syllabus}</p>
            </div>
          )}

          {/* Materials List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Published Course Notes & Study Resources
            </h4>

            {materialsLoading ? (
              <div className="text-center py-6 text-slate-400 text-xs">Loading course files...</div>
            ) : courseMaterials.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {courseMaterials.map((mat) => (
                  <div key={mat._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                          {mat.unit}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{mat.title}</h5>
                      </div>
                      <p className="text-[11px] text-slate-500">{mat.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Uploaded by {mat.uploadedBy} on {mat.uploadedAt}
                      </p>
                    </div>

                    <a
                      href={mat.fileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold rounded-lg text-xs transition-colors shrink-0 ml-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed rounded-xl">
                No study materials uploaded for this course yet.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
