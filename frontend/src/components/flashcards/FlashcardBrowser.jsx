import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import flashcardService from '../../services/flashcardService';
//This is FlashcardBrowser.jsx.
const FlashcardBrowser = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await flashcardService.getPublicFlashcards(filters);
      setFlashcards(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.response?.data?.message || 'Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to first page when filters change
  };

  const handleCardClick = (cardId) => {
    navigate(`/flashcard/${cardId}`);
  };

  if (loading) return <div className="text-center p-4">Loading flashcards...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Browse Flashcards</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                placeholder="Search words..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange({...filters, difficulty: e.target.value})}
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
                onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
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
              <label className="block text-sm font-medium mb-2">Per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange({...filters, limit: parseInt(e.target.value)})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results info */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {flashcards.length} of {pagination.total} flashcards
        </p>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {flashcards.map((card) => (
          <div 
            key={card._id} 
            onClick={() => handleCardClick(card._id)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-105"
          >
            {/* Card Content */}
            <div className="h-64 bg-gray-50 flex items-center justify-center relative">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-gray-700 mb-3">{card.englishWord}</div>
                <div className="text-lg text-gray-600">{card.thaiMeaning}</div>
                {card.pronunciation && (
                  <div className="text-sm text-gray-400 mt-2">/{card.pronunciation}/</div>
                )}
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
                {card.createdBy && (
                  <span className="text-gray-500 text-xs">
                    by {card.createdBy.name}
                  </span>
                )}
              </div>
              
              {card.exampleSentence && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">
                    "{card.exampleSentence}"
                  </p>
                </div>
              )}
              
              {/* Click to view indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-blue-600 font-medium text-center">
                  Click to explore →
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(pagination.pages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}

      {flashcards.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">No flashcards found</p>
          <p className="text-gray-400">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardBrowser;