import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Assessment, Question, AssessmentResult, StudentProfile, Course } from '../models/index.js';

export const getAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const assessments = await Assessment.find().sort({ deadline: 1 }).exec();
    return res.json({ success: true, assessments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving assessments' });
  }
};

export const getAssessmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const questions = await Question.find({ assessmentId: id }).exec();

    // If student is requesting the active test, hide the correct answers
    const isStudent = req.user?.role === 'student';
    const sanitizedQuestions = questions.map((q, idx) => {
      const qCopy = { ...q, index: idx };
      if (isStudent) {
        delete (qCopy as any).correctAnswerIndex;
        delete (qCopy as any).explanation;
      }
      return qCopy;
    });

    return res.json({
      success: true,
      assessment,
      questions: sanitizedQuestions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving assessment' });
  }
};

export const createAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      courseId,
      title,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      deadline,
      questions
    } = req.body;

    if (!courseId || !title || !durationMinutes) {
      return res.status(400).json({ success: false, message: 'Course, Title, and Duration are required' });
    }

    const course = await Course.findById(courseId);

    const newAssessment = await Assessment.create({
      courseId,
      courseCode: course?.courseCode || 'GEN101',
      courseName: course?.courseName || 'General Course',
      title,
      description: description || '',
      durationMinutes: Number(durationMinutes) || 15,
      totalMarks: Number(totalMarks) || (questions?.length ? questions.length * 5 : 20),
      passingMarks: Number(passingMarks) || 10,
      deadline: deadline || '2026-12-31',
      questionsCount: Array.isArray(questions) ? questions.length : 0,
      createdBy: req.user?.name || 'Faculty'
    });

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        await Question.create({
          assessmentId: newAssessment._id!,
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
          explanation: q.explanation || '',
          marks: Number(q.marks) || 5
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment: newAssessment
    });
  } catch (err: any) {
    console.error('Create assessment error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating assessment' });
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { answers, timeTakenSeconds } = req.body; // answers: { [questionId or index]: selectedOptionIndex }

    const assessment = await Assessment.findById(id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    const profile = await StudentProfile.findOne({ userId: studentId });
    const questions = await Question.find({ assessmentId: id }).exec();

    let totalMarks = 0;
    let earnedMarks = 0;
    const evaluatedAnswers: any[] = [];

    questions.forEach((q, idx) => {
      const qMarks = q.marks || 5;
      totalMarks += qMarks;

      const userChoice = answers ? answers[q._id || idx] : undefined;
      const isCorrect = userChoice !== undefined && Number(userChoice) === q.correctAnswerIndex;

      if (isCorrect) {
        earnedMarks += qMarks;
      }

      evaluatedAnswers.push({
        questionId: q._id,
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        selectedOption: userChoice !== undefined ? Number(userChoice) : -1,
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = totalMarks > 0 ? Number(((earnedMarks / totalMarks) * 100).toFixed(1)) : 0;
    const passed = earnedMarks >= (assessment.passingMarks || totalMarks * 0.4);

    const result = await AssessmentResult.create({
      assessmentId: id,
      assessmentTitle: assessment.title,
      courseName: assessment.courseName,
      studentId,
      studentName: profile?.name || req.user?.name || 'Student',
      registerNumber: profile?.registerNumber || req.user?.registerNumber || 'REG001',
      score: earnedMarks,
      totalMarks,
      percentage,
      passed,
      timeTakenSeconds: timeTakenSeconds || 0,
      answersSubmitted: evaluatedAnswers,
      submittedAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Assessment submitted and scored successfully',
      result,
      review: evaluatedAnswers
    });
  } catch (err: any) {
    console.error('Submit assessment error:', err);
    return res.status(500).json({ success: false, message: 'Server error evaluating assessment' });
  }
};

export const getMyAssessmentResults = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const results = await AssessmentResult.find({ studentId }).sort({ submittedAt: -1 }).exec();
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving assessment results' });
  }
};

export const getAssessmentResultsById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const results = await AssessmentResult.find({ assessmentId: id }).sort({ submittedAt: -1 }).exec();
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving results' });
  }
};
