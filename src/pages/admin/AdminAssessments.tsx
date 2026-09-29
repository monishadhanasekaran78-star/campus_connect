import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, Trash2, Clock, CheckCircle2, Award } from 'lucide-react';
import { assessmentService, lmsService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

export const AdminAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Assessment Form State
  const [courseId, setCourseId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passingMarks, setPassingMarks] = useState<number>(10);
  const [deadline, setDeadline] = useState<string>('2026-11-30');

  // Question Builder State
  const [questions, setQuestions] = useState<any[]>([
    {
      questionText: 'What is the main advantage of containerization over virtual machines?',
      options: [
        'Containers share the host OS kernel and have less overhead',
        'Containers require full virtualized hardware BIOS',
        'Containers cannot run microservices',
        'Containers take longer to start than traditional VMs'
      ],
      correctAnswerIndex: 0,
      explanation: 'Containers virtualize at the OS layer, sharing the host kernel and consuming significantly less memory and CPU than hardware hypervisors.',
      marks: 5
    }
  ]);

  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assRes, courseRes] = await Promise.all([
        assessmentService.getAssessments(),
        lmsService.getCourses(),
      ]);

      if (assRes.data.success) setAssessments(assRes.data.assessments || []);
      if (courseRes.data.success) {
        setCourses(courseRes.data.courses || []);
        if (courseRes.data.courses?.length > 0) {
          setCourseId(courseRes.data.courses[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        marks: 5,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || questions.length === 0) {
      alert('Please fill out all assessment fields and add at least one question.');
      return;
    }

    setSubmitting(true);
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 5), 0);

    try {
      const res = await assessmentService.createAssessment({
        courseId,
        title,
        description,
        durationMinutes,
        totalMarks,
        passingMarks,
        deadline,
        questions,
      });

      if (res.data.success) {
        setSuccessMsg(`Assessment "${title}" created with ${questions.length} questions!`);
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating assessment');
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
            <ClipboardCheck className="w-6 h-6 mr-2 text-rose-600" />
            Online Assessment & Quiz Authoring Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Construct MCQ assessments with custom timers, auto-scoring logic, and question explanations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a) => (
          <div
            key={a._id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-100">
                  {a.courseCode}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {a.durationMinutes} Minutes
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-snug">{a.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{a.description}</p>
              <p className="text-xs text-slate-500">Course: {a.courseName}</p>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                <span>Passing: {a.passingMarks} / {a.totalMarks} Marks</span>
                <span>Deadline: {a.deadline}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Created by {a.createdBy || 'Admin'}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Active Test
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Assessment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Author Online MCQ Assessment"
        subtitle="Configure test properties and add multiple-choice questions"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Course *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 Test: Cloud Services & Security"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Marks</label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Question Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assessment Questions ({questions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-700">Question {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter question statement here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
                  />
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswerIndex === optIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', optIndex)}
                        className="text-rose-600 focus:ring-rose-500"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    placeholder="Explanation for the correct answer (optional)..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 bg-white"
                  />
                </div>
              </div>
            ))}
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
              {submitting ? 'Publishing Test...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
