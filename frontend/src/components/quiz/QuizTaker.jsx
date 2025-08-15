import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';

const QuizTaker = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuizAndStartAttempt = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await axiosInstance.get(`/quiz/${quizId}`);
      const quizData = quizResponse.data.data;
      setQuiz(quizData);
      
      // Start quiz attempt
      const attemptResponse = await axiosInstance.post(`/quiz/${quizId}/attempt`);
      const attemptData = attemptResponse.data.data;
      setAttempt(attemptData);
      
      // Set timer
      setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
      
      // Initialize selected answers
      const initialAnswers = {};
      quizData.questions.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setSelectedAnswers(initialAnswers);
      
    } catch (error) {
      setError('Failed to load quiz or start attempt');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
              const handleTimeUp = () => {
                alert('Time is up! Submitting your quiz automatically.');
                submitQuiz();
              };
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, quizCompleted, submitQuiz]);

  

  const handleAnswerSelect = async (questionIndex, optionIndex) => {
    const newAnswers = { ...selectedAnswers, [questionIndex]: optionIndex };
    setSelectedAnswers(newAnswers);
    
    // Submit answer to backend immediately
    try {
      await axiosInstance.post(`/quiz/attempt/${attempt._id}/answer`, {
        questionIndex,
        selectedOption: optionIndex
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

  

  const handleSubmitClick = () => {
    setShowConfirm(true);
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      
      const timeSpent = (quiz.timeLimit * 60) - timeRemaining;
      const response = await axiosInstance.post(`/quiz/attempt/${attempt._id}/complete`, {
        timeSpent
      });
      
      setResults(response.data.data);
      setQuizCompleted(true);
      setShowConfirm(false);
      
    } catch (error) {
      setError('Failed to submit quiz');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const totalTime = quiz?.timeLimit * 60 || 0;
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAnsweredCount = () => {
    return Object.values(selectedAnswers).filter(answer => answer !== null).length;
  };

  if (loading) return <div className="text-center p-8">Loading quiz...</div>;
  
  if (error) return (
    <div className="text-center p-8">
      <div className="text-red-600 text-lg">{error}</div>
      <button
        onClick={() => navigate('/quiz')}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Back to Quizzes
      </button>
    </div>
  );

  if (quizCompleted && results) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Quiz Completed!</h1>
            <h2 className="text-xl text-gray-700">{quiz.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{results.score}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{results.percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Time Used</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg mb-4">
              You scored {results.score} out of {results.totalPoints} points
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/quiz')}
                className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt) return <div className="text-center p-8">Loading...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">{quiz.title}</h1>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">
              {getAnsweredCount()}/{quiz.questions.length} answered
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionJump(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${
                index === currentQuestionIndex
                  ? 'bg-purple-600 text-white'
                  : selectedAnswers[index] !== null
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-xl font-semibold mb-4">
          Question {currentQuestionIndex + 1}
        </h2>
        
        <div className="text-lg mb-6 leading-relaxed">
          {currentQuestion.question}
        </div>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
              className={`w-full text-left p-4 border rounded-lg transition-all ${
                selectedAnswers[currentQuestionIndex] === optionIndex
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                  selectedAnswers[currentQuestionIndex] === optionIndex
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === optionIndex && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  {option.text}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-4">
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitClick}
              className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 font-semibold"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-4">
              You have answered {getAnsweredCount()} out of {quiz.questions.length} questions.
              Are you sure you want to submit your quiz?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Time remaining: {formatTime(timeRemaining)}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;