import { useState, useEffect } from 'react';
//This is QuizCreator.jsx
const QuizCreator = ({ initialData, onSubmit, onCancel }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    category: 'vocabulary',
    timeLimit: 30,
    questions: [],
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    points: 1
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    if (initialData) {
      setQuizData(initialData);
    }
  }, [initialData]);

  const handleQuizDataChange = (field, value) => {
    setQuizData({ ...quizData, [field]: value });
  };

  const handleOptionChange = (optionIndex, field, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    
    // If this option is being marked as correct, unmark others
    if (field === 'isCorrect' && value) {
      updatedOptions.forEach((option, index) => {
        if (index !== optionIndex) {
          option.isCorrect = false;
        }
      });
    }
    
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };

  const addQuestion = () => {
    // Validation
    if (!currentQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }

    const hasCorrectAnswer = currentQuestion.options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      alert('Please mark one option as correct');
      return;
    }

    const hasEmptyOptions = currentQuestion.options.some(option => !option.text.trim());
    if (hasEmptyOptions) {
      alert('Please fill all options');
      return;
    }

    const updatedQuestions = [...quizData.questions];
    
    if (editingIndex >= 0) {
      // Update existing question
      updatedQuestions[editingIndex] = { ...currentQuestion };
      setEditingIndex(-1);
    } else {
      // Add new question
      updatedQuestions.push({ ...currentQuestion });
    }

    setQuizData({ ...quizData, questions: updatedQuestions });
    
    // Reset form
    setCurrentQuestion({
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      points: 1
    });
  };

  const editQuestion = (index) => {
    setCurrentQuestion({ ...quizData.questions[index] });
    setEditingIndex(index);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const cancelEdit = () => {
    setCurrentQuestion({
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      points: 1
    });
    setEditingIndex(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizData.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (quizData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(quizData);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quiz Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizDataChange('title', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter quiz title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
            <input
              type="number"
              value={quizData.timeLimit}
              onChange={(e) => handleQuizDataChange('timeLimit', parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="180"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={quizData.difficulty}
              onChange={(e) => handleQuizDataChange('difficulty', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={quizData.category}
              onChange={(e) => handleQuizDataChange('category', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={quizData.description}
            onChange={(e) => handleQuizDataChange('description', e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Describe what this quiz covers..."
          />
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quizData.isPublic}
              onChange={(e) => handleQuizDataChange('isPublic', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Make this quiz public</span>
          </label>
        </div>
      </div>

      {/* Question Creator */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          {editingIndex >= 0 ? `Edit Question ${editingIndex + 1}` : 'Add New Question'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Question *</label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="2"
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Answer Options *</label>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    className="text-purple-600"
                  />
                  <span className="text-sm font-medium w-8">{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
              <input
                type="text"
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Explain the correct answer..."
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={addQuestion}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              {editingIndex >= 0 ? 'Update Question' : 'Add Question'}
            </button>
            {editingIndex >= 0 && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {quizData.questions.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Questions ({quizData.questions.length})
          </h3>
          
          <div className="space-y-4">
            {quizData.questions.map((question, index) => (
              <div key={index} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editQuestion(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuestion(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-2">{question.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-1 rounded ${
                        option.isCorrect ? 'bg-green-100 text-green-800' : 'text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option.text}
                      {option.isCorrect && ' '}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Points: {question.points}</span>
                  {question.explanation && <span>Has explanation</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || quizData.questions.length === 0}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Quiz' : 'Create Quiz')}
        </button>
      </div>
    </div>
  );
};

export default QuizCreator;