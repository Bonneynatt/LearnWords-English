import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosConfig';
import FlashcardForm from './FlashcardForm';

const FlashcardManager = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    search: ''
  });

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`/flashcards?${params.toString()}`);
      setFlashcards(response.data.data);
    } catch (error) {
      setError('Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleCreateCard = async (cardData) => {
    try {
      const response = await axiosInstance.post('/flashcards', cardData);
      setFlashcards([response.data.data, ...flashcards]);
      setShowForm(false);
    } catch (error) {
      setError('Failed to create flashcard');
    }
  };

  const handleUpdateCard = async (cardData) => {
    try {
      const response = await axiosInstance.put(`/flashcards/${editingCard._id}`, cardData);
      setFlashcards(flashcards.map(card => 
        card._id === editingCard._id ? response.data.data : card
      ));
      setEditingCard(null);
      setShowForm(false);
    } catch (error) {
      setError('Failed to update flashcard');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await axiosInstance.delete(`/flashcards/${cardId}`);
        setFlashcards(flashcards.filter(card => card._id !== cardId));
      } catch (error) {
        setError('Failed to delete flashcard');
      }
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  if (loading) return <div className="text-center p-4">Loading flashcards...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600"> My Flashcards</h1>
        <button
          onClick={() => {
            setEditingCard(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Card
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search words..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h2>
            <FlashcardForm
              initialData={editingCard}
              onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
              onCancel={() => {
                setShowForm(false);
                setEditingCard(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {flashcards.map((card) => (
          <div key={card._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Card Image/Content Area */}
            <div className="h-64 bg-gray-50 flex items-center justify-center relative group">
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-gray-700 mb-3">{card.englishWord}</div>
                <div className="text-lg text-gray-600">{card.thaiMeaning}</div>
                {card.pronunciation && (
                  <div className="text-sm text-gray-400 mt-2">/{card.pronunciation}/</div>
                )}
              </div>
              
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(card)}
                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card._id)}
                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Difficulty badge */}
              <div className="absolute top-2 left-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  card.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {card.difficulty}
                </div>
              </div>
            </div>
            
            {/* Card Details */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {card.englishWord}
                </h3>
                <span className="text-sm text-gray-500 capitalize">{card.category}</span>
              </div>
              
              <div className="text-gray-600 mb-2">{card.thaiMeaning}</div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {card.partOfSpeech}
                </span>
              </div>
              
              {card.exampleSentence && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">
                    "{card.exampleSentence}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {flashcards.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">No flashcards found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Your First Flashcard
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardManager;