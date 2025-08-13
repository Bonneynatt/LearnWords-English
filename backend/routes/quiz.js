const express = require('express');
const router = express.Router();
const { Quiz, QuizAttempt } = require('../models/Quiz');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { difficulty, category, search, limit = 20, page = 1 } = req.query;
        
        let query = { isPublic: true };
        
        // Add filters
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
        const quizzes = await Quiz.find(query)
            .populate('createdBy', 'name')
            .select('-questions.options.isCorrect') // Hide correct answers
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await Quiz.countDocuments(query);
        
        res.json({
            success: true,
            count: quizzes.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            data: quizzes
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching quizzes'
        });
    }
});

// @desc    Get single quiz
// @route   GET /api/quiz/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email')
            .select('-questions.options.isCorrect'); // Hide correct answers
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        
        res.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quiz ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while fetching quiz'
        });
    }
});

// @desc    Create new quiz
// @route   POST /api/quiz
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const quizData = {
            ...req.body,
            createdBy: req.user.id
        };
        
        const quiz = new Quiz(quizData);
        const savedQuiz = await quiz.save();
        await savedQuiz.populate('createdBy', 'name');
        
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: savedQuiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while creating quiz'
        });
    }
});

// @desc    Update quiz
// @route   PUT /api/quiz/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        
        // Check if user owns this quiz
        if (quiz.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this quiz'
            });
        }
        
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name');
        
        res.json({
            success: true,
            message: 'Quiz updated successfully',
            data: updatedQuiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating quiz'
        });
    }
});

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        
        // Check if user owns this quiz
        if (quiz.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this quiz'
            });
        }
        
        // Also delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quiz: req.params.id });
        await Quiz.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting quiz'
        });
    }
});

// @desc    Start quiz attempt
// @route   POST /api/quiz/:id/attempt
// @access  Private
router.post('/:id/attempt', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        
        // Check if user already has an incomplete attempt
        const existingAttempt = await QuizAttempt.findOne({
            quiz: req.params.id,
            user: req.user.id,
            completed: false
        });
        
        if (existingAttempt) {
            return res.json({
                success: true,
                message: 'Resuming existing attempt',
                data: existingAttempt
            });
        }
        
        // Create new attempt
        const attempt = new QuizAttempt({
            quiz: req.params.id,
            user: req.user.id,
            answers: []
        });
        
        const savedAttempt = await attempt.save();
        await savedAttempt.populate('quiz', 'title timeLimit totalPoints');
        await savedAttempt.populate('user', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Quiz attempt started',
            data: savedAttempt
        });
    } catch (error) {
        console.error('Error starting quiz attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while starting quiz attempt'
        });
    }
});

// @desc    Submit quiz answer
// @route   POST /api/quiz/attempt/:attemptId/answer
// @access  Private
router.post('/attempt/:attemptId/answer', protect, async (req, res) => {
    try {
        const { questionIndex, selectedOption } = req.body;
        
        const attempt = await QuizAttempt.findById(req.params.attemptId)
            .populate('quiz');
        
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Quiz attempt not found'
            });
        }
        
        // Check if user owns this attempt
        if (attempt.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit answer for this attempt'
            });
        }
        
        if (attempt.completed) {
            return res.status(400).json({
                success: false,
                message: 'Quiz attempt already completed'
            });
        }
        
        // Validate question index and option
        if (questionIndex >= attempt.quiz.questions.length || questionIndex < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid question index'
            });
        }
        
        const question = attempt.quiz.questions[questionIndex];
        if (selectedOption >= question.options.length || selectedOption < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option selected'
            });
        }
        
        const isCorrect = question.options[selectedOption].isCorrect;
        const points = isCorrect ? question.points : 0;
        
        // Update or add answer
        const existingAnswerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
        if (existingAnswerIndex !== -1) {
            attempt.answers[existingAnswerIndex] = {
                questionIndex,
                selectedOption,
                isCorrect,
                points
            };
        } else {
            attempt.answers.push({
                questionIndex,
                selectedOption,
                isCorrect,
                points
            });
        }
        
        await attempt.save();
        
        res.json({
            success: true,
            message: 'Answer submitted successfully',
            data: {
                isCorrect,
                points,
                explanation: question.explanation
            }
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting answer'
        });
    }
});

// @desc    Complete quiz attempt
// @route   POST /api/quiz/attempt/:attemptId/complete
// @access  Private
router.post('/attempt/:attemptId/complete', protect, async (req, res) => {
    try {
        const { timeSpent } = req.body;
        
        const attempt = await QuizAttempt.findById(req.params.attemptId)
            .populate('quiz')
            .populate('user', 'name email');
        
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Quiz attempt not found'
            });
        }
        
        // Check if user owns this attempt
        if (attempt.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to complete this attempt'
            });
        }
        
        if (attempt.completed) {
            return res.status(400).json({
                success: false,
                message: 'Quiz attempt already completed'
            });
        }
        
        // Calculate final score and percentage
        const totalPossiblePoints = attempt.quiz.totalPoints;
        const earnedPoints = attempt.answers.reduce((total, answer) => {
            return total + (answer.isCorrect ? answer.points : 0);
        }, 0);
        
        attempt.score = earnedPoints;
        attempt.percentage = Math.round((earnedPoints / totalPossiblePoints) * 100);
        attempt.timeSpent = timeSpent || 0;
        attempt.completed = true;
        attempt.completedAt = new Date();
        
        await attempt.save();
        
        res.json({
            success: true,
            message: 'Quiz completed successfully',
            data: {
                score: attempt.score,
                totalPoints: totalPossiblePoints,
                percentage: attempt.percentage,
                timeSpent: attempt.timeSpent,
                answers: attempt.answers
            }
        });
    } catch (error) {
        console.error('Error completing quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while completing quiz'
        });
    }
});

// @desc    Get user quiz attempts
// @route   GET /api/quiz/my/attempts
// @access  Private
router.get('/my/attempts', protect, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.user.id })
            .populate('quiz', 'title difficulty category totalPoints')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: attempts.length,
            data: attempts
        });
    } catch (error) {
        console.error('Error fetching user attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your quiz attempts'
        });
    }
});

// @desc    Get my quizzes
// @route   GET /api/quiz/my/quizzes
// @access  Private
router.get('/my/quizzes', protect, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your quizzes'
        });
    }
});

// @desc    Get quiz statistics
// @route   GET /api/quiz/:id/stats
// @access  Private (quiz creator only)
router.get('/:id/stats', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        
        // Check if user owns this quiz
        if (quiz.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view quiz statistics'
            });
        }
        
        const attempts = await QuizAttempt.find({ 
            quiz: req.params.id, 
            completed: true 
        }).populate('user', 'name email');
        
        const totalAttempts = attempts.length;
        const averageScore = totalAttempts > 0 
            ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts 
            : 0;
        
        const scoreDistribution = {
            'A (90-100%)': attempts.filter(a => a.percentage >= 90).length,
            'B (80-89%)': attempts.filter(a => a.percentage >= 80 && a.percentage < 90).length,
            'C (70-79%)': attempts.filter(a => a.percentage >= 70 && a.percentage < 80).length,
            'D (60-69%)': attempts.filter(a => a.percentage >= 60 && a.percentage < 70).length,
            'F (Below 60%)': attempts.filter(a => a.percentage < 60).length
        };
        
        res.json({
            success: true,
            data: {
                totalAttempts,
                averageScore: Math.round(averageScore),
                scoreDistribution,
                recentAttempts: attempts.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Error fetching quiz statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching quiz statistics'
        });
    }
});

module.exports = router;