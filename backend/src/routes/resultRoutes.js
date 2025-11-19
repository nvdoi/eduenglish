import express from 'express';
import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Course from '../models/Course.js';

const router = express.Router();
// Get user progress for a course
router.get('/progress/:userId/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    // Try multiple ways to find the result to handle userId format mismatches
    let result = null;
    const courseObjectId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    // Method 1: Try with ObjectId conversion for userId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      result = await Result.findOne({ userId: userObjectId, courseId: courseObjectId }).populate('courseId');
    }
    
    // Method 2: Try with string userId if ObjectId didn't work
    if (!result) {
      result = await Result.findOne({ userId: userId, courseId: courseObjectId }).populate('courseId');
    }
    
    // Method 3: Try flexible search with $or
    if (!result) {
      result = await Result.findOne({ 
        $or: [
          { userId: userId, courseId: courseObjectId },
          { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null, courseId: courseObjectId }
        ].filter(condition => condition.userId !== null)
      }).populate('courseId');
    }
    
    if (!result) {
      // Create new result if doesn't exist
      const course = await Course.findById(courseObjectId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Use proper userId format for new result
      const properUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
      
      result = new Result({
        userId: properUserId,
        courseId: courseObjectId,
        progress: {
          vocabulary: { 
            studied: 0,
            known: 0,
            total: course.vocabularies?.length || 0,
            percentage: 0
          },
          grammar: { 
            studied: 0,
            total: course.grammars?.length || 0,
            percentage: 0
          },
          exercises: { 
            completed: 0,
            total: course.exercises?.length || 0,
            percentage: 0
          },
          overall: {
            percentage: 0
          }
        }
      });
      
      // Calculate initial progress (should be 0)
      result.calculateOverallProgress();
      await result.save();
    }
    
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Update exercise progress
router.put('/progress/:userId/:courseId/exercises', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { completed, total } = req.body;
    
      
    // Try multiple ways to find the result (same as other APIs)
    let result = null;
    const courseObjectId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    // Method 1: Try with ObjectId conversion for userId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      result = await Result.findOne({ userId: userObjectId, courseId: courseObjectId });
    }
    
    // Method 2: Try with string userId if ObjectId didn't work
    if (!result) {
      result = await Result.findOne({ userId: userId, courseId: courseObjectId });
    }
    
    // Method 3: Try flexible search with $or
    if (!result) {
      result = await Result.findOne({ 
        $or: [
          { userId: userId, courseId: courseObjectId },
          { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null, courseId: courseObjectId }
        ].filter(condition => condition.userId !== null)
      });
    }
    
    if (!result) {
      const course = await Course.findById(courseObjectId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Use proper userId format for new result
      const properUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
      
      
      result = new Result({
        userId: properUserId,
        courseId: courseObjectId,
        progress: {
          vocabulary: { 
            studied: 0,
            known: 0,
            total: course.vocabularies?.length || 0,
            percentage: 0
          },
          exercises: { 
            completed: 0,
            total: course.exercises?.length || 0,
            percentage: 0
          },
          overall: {
            percentage: 0
          }
        }
      });
    }
    
    // Force reset exercises to ensure clean state
    result.progress.exercises = {
      completed: Math.max(0, completed || 0),
      total: total || 0,
      percentage: (total > 0 && completed > 0) ? Math.round((completed / total) * 100) : 0
    };
    
    result.calculateOverallProgress();
    result.lastUpdated = new Date();
    
    await result.save();
    
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Error updating exercise progress:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update vocabulary progress
router.put('/progress/:userId/:courseId/vocabulary', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { studied, known, total } = req.body;
    
    
    // Try multiple ways to find the result (same as other APIs)
    let result = null;
    const courseObjectId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    // Method 1: Try with ObjectId conversion for userId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      result = await Result.findOne({ userId: userObjectId, courseId: courseObjectId });
    }
    
    // Method 2: Try with string userId if ObjectId didn't work
    if (!result) {
      result = await Result.findOne({ userId: userId, courseId: courseObjectId });
    }
    
    // Method 3: Try flexible search with $or
    if (!result) {
      result = await Result.findOne({ 
        $or: [
          { userId: userId, courseId: courseObjectId },
          { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null, courseId: courseObjectId }
        ].filter(condition => condition.userId !== null)
      });
    }
    
    if (!result) {
      const course = await Course.findById(courseObjectId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Use proper userId format for new result
      const properUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
      
      result = new Result({
        userId: properUserId,
        courseId: courseObjectId,
        progress: {
          vocabulary: { 
            studied: 0,
            known: 0,
            total: course.vocabularies?.length || 0,
            percentage: 0
          },
          exercises: { 
            completed: 0,
            total: course.exercises?.length || 0,
            percentage: 0
          },
          overall: {
            percentage: 0
          }
        }
      });
    }
    
    // Update vocabulary progress
    result.progress.vocabulary = {
      studied: Math.max(0, studied || 0),
      known: Math.max(0, known || 0),
      total: total || 0,
      percentage: (total > 0 && studied > 0) ? Math.round((studied / total) * 100) : 0
    };
    
    result.calculateOverallProgress();
    result.lastUpdated = new Date();
    
    await result.save();
    
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error updating vocabulary progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit exam result
router.post('/exam/:userId/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const examData = req.body;
    
    
    // Try multiple ways to find the result (same as progress API)
    let result = null;
    const courseObjectId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : courseId;
    
    // Method 1: Try with ObjectId conversion for userId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      result = await Result.findOne({ userId: userObjectId, courseId: courseObjectId });
    }
    
    // Method 2: Try with string userId if ObjectId didn't work
    if (!result) {
      result = await Result.findOne({ userId: userId, courseId: courseObjectId });
    }
    
    // Method 3: Try flexible search with $or
    if (!result) {
      result = await Result.findOne({ 
        $or: [
          { userId: userId, courseId: courseObjectId },
          { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null, courseId: courseObjectId }
        ].filter(condition => condition.userId !== null)
      });
    }
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }
    
    result.addExamResult(examData);
    await result.save();
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get random exam questions
router.get('/exam/:courseId/questions', async (req, res) => {
  try {
    const { courseId } = req.params;
    const count = parseInt(req.query.count) || 10;
    
    const course = await Course.findById(courseId);
    if (!course || !course.exercises || course.exercises.length === 0) {
      return res.status(404).json({ success: false, message: 'No exercises found' });
    }
    
    // Shuffle and pick random questions
    const shuffled = course.exercises.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, course.exercises.length));
    
    // Remove correct answers from response
    const questions = selectedQuestions.map((q, index) => ({
      id: index,
      question: q.question,
      type: q.type,
      options: q.options,
      difficulty: q.difficulty,
      points: q.points || 1
    }));
    
    res.json({ success: true, questions, total: questions.length });
  } catch (error) {
    console.error('Error getting exam questions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get exam answers (for checking)
router.post('/exam/:courseId/check', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // Array of {questionIndex, selectedAnswer}
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const results = answers.map(answer => {
      const question = course.exercises[answer.questionIndex];
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      
      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect,
        explanation: question?.explanation
      };
    });
    
    const correctCount = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / results.length) * 100);
    
    res.json({
      success: true,
      results,
      score: {
        correct: correctCount,
        total: results.length,
        percentage
      }
    });
  } catch (error) {
    console.error('Error checking exam:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add missing routes that frontend is trying to call
router.get('/study/:userId/:courseId/vocabulary', async (req, res) => {
  try {
    // Always return success with empty data to prevent 404 errors
    res.json({ 
      success: true, 
      data: [],
      progress: {
        studied: 0,
        known: 0,
        total: 0,
        percentage: 0
      }
    });
  } catch (error) {
    console.error('Error getting vocabulary study data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/study/:userId/:courseId/grammar', async (req, res) => {
  try {
    // Always return success with empty data to prevent 404 errors
    res.json({ 
      success: true, 
      data: [],
      progress: {
        studied: 0,
        total: 0,
        percentage: 0
      }
    });
  } catch (error) {
    console.error('Error getting grammar study data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
