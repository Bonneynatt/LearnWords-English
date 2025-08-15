import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizManager from './components/quiz/QuizManager';
import QuizTaker from './components/quiz/QuizTaker';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/quiz" element={<QuizManager />} />
        <Route path="/quiz/:quizId/take" element={<QuizTaker />} />
      </Routes>
    </Router>
  );
}

export default App;

