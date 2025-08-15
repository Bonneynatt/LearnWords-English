const Flashcard = require('../models/Flashcard');

// @desc    Get all flashcards
// @route   GET /api/flashcards
// @access  Public/Private
const getFlashcards = async (req, res) => {
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
                { englishWord: { $regex: search, $options: 'i' } },
                { thaiMeaning: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
        const flashcards = await Flashcard.find(query)
            .populate('createdBy', 'name')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await Flashcard.countDocuments(query);
        
        res.json({
            success: true,
            count: flashcards.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            data: flashcards
        });
    } catch (error) {
        console.error('Error fetching flashcards:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching flashcards'
        });
    }
};

// @desc    Get single flashcard
// @route   GET /api/flashcards/:id
// @access  Public
const getFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found'
            });
        }
        
        res.json({
            success: true,
            data: flashcard
        });
    } catch (error) {
        console.error('Error fetching flashcard:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid flashcard ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while fetching flashcard'
        });
    }
};

// @desc    Create new flashcard
// @route   POST /api/flashcards
// @access  Private
const createFlashcard = async (req, res) => {
    try {
        const flashcardData = {
            ...req.body,
            createdBy: req.user.id
        };
        
        const flashcard = new Flashcard(flashcardData);
        const savedFlashcard = await flashcard.save();
        await savedFlashcard.populate('createdBy', 'name');
        
        res.status(201).json({
            success: true,
            message: 'Flashcard created successfully',
            data: savedFlashcard
        });
    } catch (error) {
        console.error('Error creating flashcard:', error);
        
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
            message: 'Server error while creating flashcard'
        });
    }
};

// @desc    Update flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
const updateFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found'
            });
        }
        
        // Check if user owns this flashcard
        if (flashcard.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this flashcard'
            });
        }
        
        const updatedFlashcard = await Flashcard.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name');
        
        res.json({
            success: true,
            message: 'Flashcard updated successfully',
            data: updatedFlashcard
        });
    } catch (error) {
        console.error('Error updating flashcard:', error);
        
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
            message: 'Server error while updating flashcard'
        });
    }
};

// @desc    Delete flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: 'Flashcard not found'
            });
        }
        
        // Check if user owns this flashcard
        if (flashcard.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this flashcard'
            });
        }
        
        await Flashcard.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Flashcard deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting flashcard'
        });
    }
};

// @desc    Get flashcards by difficulty
// @route   GET /api/flashcards/difficulty/:difficulty
// @access  Public
const getFlashcardsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const validDifficulties = ['beginner', 'intermediate', 'advanced'];
        
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid difficulty level'
            });
        }
        
        const flashcards = await Flashcard.getByDifficulty(difficulty)
            .populate('createdBy', 'name');
        
        res.json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error('Error fetching flashcards by difficulty:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching flashcards'
        });
    }
};

// @desc    Get flashcards by category
// @route   GET /api/flashcards/category/:category
// @access  Public
const getFlashcardsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        const flashcards = await Flashcard.getByCategory(category)
            .populate('createdBy', 'name');
        
        res.json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error('Error fetching flashcards by category:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching flashcards'
        });
    }
};

// @desc    Get my flashcards
// @route   GET /api/flashcards/my/cards
// @access  Private
const getMyFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error('Error fetching user flashcards:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your flashcards'
        });
    }
};

// @desc    Get random flashcards for study
// @route   GET /api/flashcards/study/random
// @access  Public
const getRandomFlashcards = async (req, res) => {
    try {
        const { limit = 10, difficulty, category } = req.query;
        
        let matchStage = { isPublic: true };
        if (difficulty && difficulty !== 'all') {
            matchStage.difficulty = difficulty;
        }
        if (category && category !== 'all') {
            matchStage.category = category;
        }
        
        const flashcards = await Flashcard.aggregate([
            { $match: matchStage },
            { $sample: { size: parseInt(limit) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                    pipeline: [{ $project: { name: 1 } }]
                }
            },
            {
                $unwind: '$createdBy'
            }
        ]);
        
        res.json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        console.error('Error fetching random flashcards:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching random flashcards'
        });
    }
};

module.exports = {
    getFlashcards,
    getFlashcard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcardsByDifficulty,
    getFlashcardsByCategory,
    getMyFlashcards,
    getRandomFlashcards
};