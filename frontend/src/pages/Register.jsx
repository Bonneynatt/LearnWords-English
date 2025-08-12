import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    university: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      navigate('/flashcards');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600">
          LearnWords English - Sign Up
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          required
          minLength="6"
        />
        <input
          type="text"
          placeholder="University (Optional)"
          value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Address (Optional)"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
