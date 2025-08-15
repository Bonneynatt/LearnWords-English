import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import QuizCreator from './QuizCreator';

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [showCreator, setShowCreator] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    search: ''
  });
  const navigate = useNavigate();

  const fetchAvailableQuizzes = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    if (filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await axiosInstance.get(`/quiz?${params.toString()}`);
    setQuizzes(response.data.data);
  }, [filters]);

  const fetchMyQuizzes = useCallback(async () => {
    const response = await axiosInstance.get('/quiz/my/quizzes');
    setMyQuizzes(response.data.data);
  }, []);

  const fetchMyAttempts = useCallback(async () => {
    const response = await axiosInstance.get('/quiz/my/attempts');
    setMyAttempts(response.data.data);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'available') {
        await fetchAvailableQuizzes();
      } else if (activeTab === 'my-quizzes') {
        await fetchMyQuizzes();
      } else if (activeTab === 'my-attempts') {
        await fetchMyAttempts();
      }
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
    fetchData();
  }, [activeTab, fetchAvailableQuizzes, fetchMyQuizzes, fetchMyAttempts]);

  const handleCreateQuiz = async (quizData) => {
    try {
      const response = await axiosInstance.post('/quiz', quizData);
      setMyQuizzes([response.data.data, ...myQuizzes]);
      setShowCreator(false);
      setActiveTab('my-quizzes');
    } catch (error) {
      setError('Failed to create quiz');
    }
  };

  const handleUpdateQuiz = async (quizData) => {
    try {
      const response = await axiosInstance.put(`/quiz/${editingQuiz._id}`, quizData);
      setMyQuizzes(myQuizzes.map(quiz => 
        quiz._id === editingQuiz._id ? response.data.data : quiz
      ));
      setEditingQuiz(null);
      setShowCreator(false);
    } catch (error) {
      setError('Failed to update quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axiosInstance.delete(`/quiz/${quizId}`);
        setMyQuizzes(myQuizzes.filter(quiz => quiz._id !== quizId));
      } catch (error) {
        setError('Failed to delete quiz');
      }
    }
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/take`);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowCreator(true);
  };

  const handleViewStats = (quizId) => {
    navigate(`/quiz/${quizId}/stats`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) return <div className="text-center p-8">Loading quizzes...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600">Quiz Center</h1>
        <button
          onClick={() => {
            setEditingQuiz(null);
            setShowCreator(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          + Create Quiz
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-l ${
            activeTab === 'available' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available Quizzes
        </button>
        <button
          onClick={() => setActiveTab('my-quizzes')}
          className={`px-4 py-2 ${
            activeTab === 'my-quizzes' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Quizzes
        </button>
        <button
          onClick={() => setActiveTab('my-attempts')}
          className={`px-4 py-2 rounded-r ${
            activeTab === 'my-attempts' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Attempts
        </button>
      </div>

      {/* Filters for Available Quizzes */}
      {activeTab === 'available' && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search quizzes..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <QuizCreator
              initialData={editingQuiz}
              onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
              onCancel={() => {
                setShowCreator(false);
                setEditingQuiz(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Available Quizzes */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-4 rounded shadow hover:shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </div>
                <span className="text-xs text-gray-500">{quiz.category}</span>
              </div>
              
              <h3 className="text-lg font-bold text-purple-600 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>{quiz.questions?.length || 0} questions</span>
                <span>{quiz.timeLimit} min</span>
                <span>{quiz.totalPoints} pts</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  by {quiz.createdBy?.name}
                </span>
                <button
                  onClick={() => handleTakeQuiz(quiz._id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                >
                  Take Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Quizzes */}
      {activeTab === 'my-quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myQuizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-4 rounded shadow hover:shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuiz(quiz)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewStats(quiz._id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-purple-600 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{quiz.questions?.length || 0} questions</span>
                <span>{quiz.timeLimit} min</span>
                <span>{quiz.totalPoints} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Attempts */}
      {activeTab === 'my-attempts' && (
        <div className="space-y-4">
          {myAttempts.map((attempt) => (
            <div key={attempt._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-purple-600 mb-1">
                    {attempt.quiz?.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(attempt.quiz?.difficulty)}`}>
                      {attempt.quiz?.difficulty}
                    </span>
                    <span>{attempt.quiz?.category}</span>
                    <span>{attempt.answers?.length} answered</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                    {attempt.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {attempt.score}/{attempt.quiz?.totalPoints} pts
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {attempt.timeSpent && (
                <div className="mt-2 text-sm text-gray-500">
                Time: {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'available' && quizzes.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">No quizzes available</p>
        </div>
      )}

      {activeTab === 'my-quizzes' && myQuizzes.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">You haven't created any quizzes yet</p>
          <button
            onClick={() => setShowCreator(true)}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Create Your First Quiz
          </button>
        </div>
      )}

      {activeTab === 'my-attempts' && myAttempts.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">You haven't taken any quizzes yet</p>
          <button
            onClick={() => setActiveTab('available')}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Browse Available Quizzes
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizManager;