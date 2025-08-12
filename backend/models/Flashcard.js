const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    englishWord: {
        type: String,
        required: [true, 'English word is required'],
        trim: true
    },
    thaiMeaning: {
        type: String,
        required: [true, 'Thai meaning is required'],
        trim: true
    },
    pronunciation: {
        type: String,
        trim: true
    },
    partOfSpeech: {
        type: String,
        enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun'],
        default: 'noun'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    category: {
        type: String,
        default: 'general',
        trim: true
    },
    exampleSentence: {
        type: String,
        trim: true
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
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for searching
flashcardSchema.index({ englishWord: 'text', thaiMeaning: 'text', category: 'text' });

// Static method to get flashcards by difficulty
flashcardSchema.statics.getByDifficulty = function(difficulty) {
    return this.find({ difficulty, isPublic: true });
};

// Static method to get flashcards by category
flashcardSchema.statics.getByCategory = function(category) {
    return this.find({ category, isPublic: true });
};

module.exports = mongoose.model('Flashcard', flashcardSchema);