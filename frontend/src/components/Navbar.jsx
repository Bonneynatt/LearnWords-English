import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition">
            LearnWords English
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/flashcards" 
                  className={`hover:text-gray-200 transition flex items-center ${
                    location.pathname === '/flashcards' ? 'text-yellow-300 font-semibold' : ''
                  }`}
                >
                  Flashcards
                </Link>
                <Link 
                  to="/quiz" 
                  className={`hover:text-gray-200 transition flex items-center ${
                    location.pathname === '/quiz' ? 'text-yellow-300 font-semibold' : ''
                  }`}
                >
                  Quiz
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm">Welcome, {user.name}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-gray-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
