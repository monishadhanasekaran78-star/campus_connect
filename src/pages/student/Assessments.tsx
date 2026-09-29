import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, CheckCircle2, XCircle, Award, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { assessmentService } from '../../services/api';

export const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Test State
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchAssessmentsData();
  }, []);

  const fetchAssessmentsData = async () => {
    try {
      const [listRes, resultsRes] = await Promise.all([
        assessmentService.getAssessments(),
        assessmentService.getMyResults().catch(() => ({ data: { results: [] } }))
      ]);

      if (listRes.data.success) {
        setAssessments(listRes.data.assessments || []);
      }
      if (resultsRes.data?.success) {
        setMyResults(resultsRes.data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleStartTest = async (assessment: any) => {
    setLoading(true);
    try {
      const res = await assessmentService.getAssessmentById(assessment._id);
      if (res.data.success) {
        setActiveAssessment(res.data.assessment);
        setQuestions(res.data.questions || []);
        setSelectedAnswers({});
        setTimeLeft((res.data.assessment.durationMinutes || 15) * 60);
        setIsTestActive(true);
        setTestResult(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);
    const timeSpent = (activeAssessment.durationMinutes || 15) * 60 - timeLeft;

    try {
      const res = await assessmentService.submitAssessment(activeAssessment._id, {
        answers: selectedAnswers,
        timeTakenSeconds: timeSpent,
      });

      if (res.data.success) {
        setTestResult(res.data.result);
        setIsTestActive(false);
        fetchAssessmentsData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Active Assessment Test View
  if (isTestActive && activeAssessment) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Test Header Bar */}
        <div className="sticky top-20 z-20 bg-white p-4 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {activeAssessment.courseCode} • Ongoing Assessment
            </span>
            <h2 className="text-base font-black text-slate-900 truncate max-w-md">
              {activeAssessment.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
                timeLeft < 180 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Scoring...' : 'Submit Test'}
            </button>
          </div>
        </div>

        {/* Question Cards */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q._id || qIndex} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  Question {qIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-400">{q.marks || 5} Marks</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-relaxed">{q.questionText}</h3>

              <div className="space-y-2 pt-2">
                {q.options?.map((opt: string, optIndex: number) => {
                  const isSelected = selectedAnswers[q._id || qIndex] === optIndex;
                  return (
                    <button
                      type="button"
                      key={optIndex}
                      onClick={() => handleSelectOption(q._id || qIndex, optIndex)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-3 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={handleSubmitTest}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20"
          >
            {submitting ? 'Submitting & Evaluating Answers...' : 'Complete & Submit Assessment'}
          </button>
        </div>
      </div>
    );
  }

  // Result Summary View
  if (testResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold text-2xl ${
              testResult.passed
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-rose-100 text-rose-600'
            }`}
          >
            {testResult.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessment Evaluation Report
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{testResult.assessmentTitle}</h2>
            <p className="text-xs text-slate-500">{testResult.courseName}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 pb-2 border-y border-slate-100">
            <div>
              <p className="text-xs text-slate-400">Score Earned</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {testResult.score} / {testResult.totalMarks}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Percentage</p>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{testResult.percentage}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p
                className={`text-2xl font-black mt-0.5 ${
                  testResult.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {testResult.passed ? 'PASSED' : 'RETRY'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setTestResult(null)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Back to Assessments Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List of Assessments
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
          <ClipboardCheck className="w-6 h-6 mr-2 text-blue-600" />
          Online Academic Assessments & Quizzes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Participate in timed multiple-choice evaluations and track automated grades and performance metrics.
        </p>
      </div>

      {/* Available Assessments List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Active Tests Scheduled
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((a) => (
            <div
              key={a._id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                    {a.courseCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {a.durationMinutes} Minutes
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-2">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>Passing: {a.passingMarks} / {a.totalMarks} Marks</span>
                </div>

                <button
                  onClick={() => handleStartTest(a)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                >
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Results Table */}
      {myResults.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden pt-4">
          <div className="px-6 py-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center">
              <Award className="w-4 h-4 mr-2 text-indigo-600" />
              Previous Assessment History & Scores
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Assessment</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Percentage</th>
                  <th className="px-4 py-3 text-center">Result</th>
                  <th className="px-6 py-3 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myResults.map((res: any) => (
                  <tr key={res._id}>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{res.assessmentTitle}</td>
                    <td className="px-6 py-3.5 text-slate-500">{res.courseName}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {res.score} / {res.totalMarks}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-600">{res.percentage}%</td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          res.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {res.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-400">
                      {new Date(res.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
