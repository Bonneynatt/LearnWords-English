import { useState, useEffect, useCallback } from 'react';
import flashcardService from '../../services/flashcardService';

const FlashcardViewer = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studyMode, setStudyMode] = useState('random'); // 'random', 'category', 'difficulty'
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    limit: 10
  });

  useEffect(() => {
    loadFlashcards();
  }, [studyMode, filters, loadFlashcards]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAnswer();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [prevCard, nextCard, toggleAnswer]);

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      switch (studyMode) {
        case 'random':
          response = await flashcardService.getRandomFlashcards(filters);
          break;
        case 'category':
          if (filters.category !== 'all') {
            response = await flashcardService.getFlashcardsByCategory(filters.category);
          } else {
            response = await flashcardService.getPublicFlashcards(filters);
          }
          break;
        case 'difficulty':
          if (filters.difficulty !== 'all') {
            response = await flashcardService.getFlashcardsByDifficulty(filters.difficulty);
          } else {
            response = await flashcardService.getPublicFlashcards(filters);
          }
          break;
        default:
          response = await flashcardService.getPublicFlashcards(filters);
      }

      if (response.data && response.data.length > 0) {
        setFlashcards(response.data);
        setCurrentIndex(0);
        setShowAnswer(false);
        setError('');
      } else {
        setFlashcards([]);
        setError('No flashcards found with the selected criteria');
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  }, [studyMode, filters]);

  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  }, [flashcards.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  }, [flashcards.length]);

  const toggleAnswer = useCallback(() => {
    setShowAnswer(!showAnswer);
  }, [showAnswer]);

  const currentCard = flashcards[currentIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error && flashcards.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={loadFlashcards}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Study Flashcards</h1>
        
        {/* Study Mode Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Study Mode</label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random Cards</option>
                <option value="category">By Category</option>
                <option value="difficulty">By Difficulty</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Cards Count</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={20}>20 Cards</option>
                <option value={50}>50 Cards</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={loadFlashcards}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Load New Set
            </button>
          </div>
        </div>
      </div>

      {flashcards.length > 0 && currentCard && (
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="text-center">
            <span className="text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="relative">
            <div 
              className="bg-white rounded-xl shadow-lg p-8 min-h-[400px] flex flex-col justify-center items-center cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={toggleAnswer}
            >
              {/* Difficulty badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentCard.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  currentCard.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentCard.difficulty}
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                  {currentCard.category}
                </span>
              </div>

              {/* Card content */}
              <div className="text-center">
                {!showAnswer ? (
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                      {currentCard.englishWord}
                    </h2>
                    {currentCard.pronunciation && (
                      <p className="text-lg text-gray-500 mb-4">
                        /{currentCard.pronunciation}/
                      </p>
                    )}
                    <p className="text-gray-600 mb-6">
                      ({currentCard.partOfSpeech})
                    </p>
                    <p className="text-blue-600 text-lg">
                      Click to reveal meaning
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                      {currentCard.englishWord}
                    </h2>
                    <h3 className="text-3xl font-semibold text-blue-600 mb-4">
                      {currentCard.thaiMeaning}
                    </h3>
                    {currentCard.pronunciation && (
                      <p className="text-lg text-gray-500 mb-4">
                        /{currentCard.pronunciation}/
                      </p>
                    )}
                    <p className="text-gray-600 mb-6">
                      ({currentCard.partOfSpeech})
                    </p>
                    {currentCard.exampleSentence && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 italic">
                          "{currentCard.exampleSentence}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevCard}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <button
              onClick={toggleAnswer}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {showAnswer ? 'Show Question' : 'Show Answer'}
            </button>
            
            <button
              onClick={nextCard}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center"
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Keyboard shortcuts: � Previous | � Next | Space Show/Hide Answer</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default FlashcardViewer;