import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

//This is a Signup.jsx

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    university: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber
    };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        const requirements = [];
        if (!passwordValidation.minLength) requirements.push('at least 8 characters');
        if (!passwordValidation.hasUppercase) requirements.push('one uppercase letter');
        if (!passwordValidation.hasLowercase) requirements.push('one lowercase letter');
        if (!passwordValidation.hasNumber) requirements.push('one number');
        errors.password = `Password must contain ${requirements.join(', ')}`;
      }
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    
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
          className={`w-full mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.name ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.name && (
          <p className="text-red-500 text-sm mb-3">{validationErrors.name}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.email ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mb-3">{validationErrors.email}</p>
        )}
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={`w-full mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.password ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.password && (
          <p className="text-red-500 text-sm mb-3">{validationErrors.password}</p>
        )}
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className={`w-full mb-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-sm mb-3">{validationErrors.confirmPassword}</p>
        )}
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

export default Signup;
