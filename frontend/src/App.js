import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import FlashcardManager from './components/flashcards/FlashcardManager';
import QuizManager from './components/quiz/QuizManager';
import QuizTaker from './components/quiz/QuizTaker';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/flashcards" element={<FlashcardManager />} />
        <Route path="/quiz" element={<QuizManager />} />
        <Route path="/quiz/:quizId/take" element={<QuizTaker />} />
      </Routes>
    </Router>
  );
}

export default App;

