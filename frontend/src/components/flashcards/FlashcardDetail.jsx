import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcardService';

const FlashcardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flashcard, setFlashcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        setLoading(true);
        const response = await flashcardService.getFlashcard(id);
        setFlashcard(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching flashcard:', error);
        setError('Failed to load flashcard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlashcard();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcard...</p>
        </div>
      </div>
    );
  }

  if (error || !flashcard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4">
            {error || 'Flashcard not found'}
          </div>
          <button
            onClick={() => navigate('/flashcards')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </button>
          
          <div className="text-sm text-gray-500">
            {flashcard.createdBy && `Created by ${flashcard.createdBy.name}`}
          </div>
        </div>

        {/* Main flashcard display */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card header with metadata */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{flashcard.englishWord}</h1>
                {flashcard.pronunciation && (
                  <p className="text-blue-100 text-lg">
                    /{flashcard.pronunciation}/
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  flashcard.difficulty === 'beginner' ? 'bg-green-500 text-white' :
                  flashcard.difficulty === 'intermediate' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {flashcard.difficulty}
                </span>
                <div className="mt-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm capitalize">
                    {flashcard.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-blue-100">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {flashcard.partOfSpeech}
              </span>
            </div>
          </div>

          {/* Card content */}
          <div className="p-8">
            {/* Interactive card flip */}
            <div className="mb-8">
              <div 
                className="bg-gray-50 rounded-lg p-8 min-h-[300px] flex flex-col justify-center items-center cursor-pointer transition-all duration-200 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {!showAnswer ? (
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                      {flashcard.englishWord}
                    </h2>
                    {flashcard.pronunciation && (
                      <p className="text-lg text-gray-500 mb-4">
                        /{flashcard.pronunciation}/
                      </p>
                    )}
                    <p className="text-gray-600 mb-6">
                      ({flashcard.partOfSpeech})
                    </p>
                    <p className="text-blue-600 text-lg font-medium">
                      Click to reveal meaning
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                      {flashcard.englishWord}
                    </h2>
                    <h3 className="text-3xl font-semibold text-blue-600 mb-4">
                      {flashcard.thaiMeaning}
                    </h3>
                    {flashcard.pronunciation && (
                      <p className="text-lg text-gray-500 mb-4">
                        /{flashcard.pronunciation}/
                      </p>
                    )}
                    <p className="text-gray-600 mb-6">
                      ({flashcard.partOfSpeech})
                    </p>
                    <p className="text-blue-600 text-lg font-medium">
                      Click to hide meaning
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAnswer ? 'Hide Meaning' : 'Show Meaning'}
                </button>
              </div>
            </div>

            {/* Example sentence */}
            {flashcard.exampleSentence && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Usage</h3>
                <p className="text-gray-700 italic text-lg leading-relaxed">
                  "{flashcard.exampleSentence}"
                </p>
              </div>
            )}

            {/* Additional information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Word Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Part of Speech:</span> {flashcard.partOfSpeech}</div>
                  <div><span className="font-medium">Difficulty:</span> {flashcard.difficulty}</div>
                  <div><span className="font-medium">Category:</span> {flashcard.category}</div>
                  {flashcard.pronunciation && (
                    <div><span className="font-medium">Pronunciation:</span> /{flashcard.pronunciation}/</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Study Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    {showAnswer ? 'Practice Mode' : 'Study Mode'}
                  </button>
                  <button
                    onClick={() => navigate('/flashcards?tab=study')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Start Study Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to related cards could go here */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/flashcards')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Browse More Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetail;