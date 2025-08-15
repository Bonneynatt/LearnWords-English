const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getFlashcards,
    getFlashcard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcardsByDifficulty,
    getFlashcardsByCategory,
    getMyFlashcards,
    getRandomFlashcards
} = require('../controllers/flashcardController');

// @desc    Get all flashcards
// @route   GET /api/flashcards
// @access  Public/Private
router.get('/', getFlashcards);

// @desc    Get single flashcard
// @route   GET /api/flashcards/:id
// @access  Public
router.get('/:id', getFlashcard);

// @desc    Create new flashcard
// @route   POST /api/flashcards
// @access  Private
router.post('/', protect, createFlashcard);

// @desc    Update flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
router.put('/:id', protect, updateFlashcard);

// @desc    Delete flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
router.delete('/:id', protect, deleteFlashcard);

// @desc    Get flashcards by difficulty
// @route   GET /api/flashcards/difficulty/:difficulty
// @access  Public
router.get('/difficulty/:difficulty', getFlashcardsByDifficulty);

// @desc    Get flashcards by category
// @route   GET /api/flashcards/category/:category
// @access  Public
router.get('/category/:category', getFlashcardsByCategory);

// @desc    Get my flashcards
// @route   GET /api/flashcards/my/cards
// @access  Private
router.get('/my/cards', protect, getMyFlashcards);

// @desc    Get random flashcards for study
// @route   GET /api/flashcards/study/random
// @access  Public
router.get('/study/random', getRandomFlashcards);

module.exports = router;