const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    category: {
        type: String,
        default: 'vocabulary',
        trim: true
    },
    questions: [{
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true
        },
        options: [{
            text: {
                type: String,
                required: [true, 'Option text is required'],
                trim: true
            },
            isCorrect: {
                type: Boolean,
                default: false
            }
        }],
        explanation: {
            type: String,
            trim: true
        },
        points: {
            type: Number,
            default: 1
        }
    }],
    timeLimit: {
        type: Number, // in minutes
        default: 30
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    totalPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
    this.totalPoints = this.questions.reduce((total, q) => total + q.points, 0);
    next();
});

// Quiz attempt schema for tracking user attempts
const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionIndex: Number,
        selectedOption: Number,
        isCorrect: Boolean,
        points: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Calculate score and percentage before saving
quizAttemptSchema.pre('save', function(next) {
    if (this.answers && this.answers.length > 0) {
        this.score = this.answers.reduce((total, answer) => {
            return total + (answer.isCorrect ? answer.points : 0);
        }, 0);
        
        // Calculate percentage based on total possible points
        if (this.populated('quiz') && this.quiz.totalPoints > 0) {
            this.percentage = Math.round((this.score / this.quiz.totalPoints) * 100);
        }
    }
    next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };