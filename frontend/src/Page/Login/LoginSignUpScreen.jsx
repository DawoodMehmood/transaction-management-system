// Import dependencies
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

const LoginSignUpScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '', // State key uses camelCase
  });
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Function to handle Login API call
  const handleLogin = async () => {
    const { email, password } = formData;
    try {
      const response = await fetch(`${getServerUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast('Login successful!');
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/Transactions'); // Redirect to Transactions on success
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      showErrorToast(error.message || 'Login failed. Please try again.');
    }
  };

  // Function to handle Signup API call
  const handleSignup = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match!');
      return;
    }

    try {
      const response = await fetch(`${getServerUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessToast('Signup successful!');
        navigate('/'); // Redirect to homepage on success
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      showErrorToast('Signup failed. Please try again.');
    }
  };

  // Handle form submission based on which button is clicked
  const handleSubmit = (e, action) => {
    e.preventDefault();
    if (action === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFFFFF]">
      <motion.div
        className="bg-gray-300 rounded-lg shadow-lg mx-2 md:mx-0 p-8 max-w-sm w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-700">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        <form>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border border-grey-800 rounded"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label
                className="block text-gray-700 mb-2"
                htmlFor="confirmPassword" // Updated id to match state key
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword" // Corrected the id here
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={!formData.password} // Disable unless password is filled
              />
            </div>
          )}
          {/* Conditional button rendering */}
          {isLogin ? (
            <motion.button
              type="submit"
              className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition duration-200 mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleSubmit(e, 'login')}
            >
              Login
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleSubmit(e, 'signup')}
            >
              Sign Up
            </motion.button>
          )}
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-700">
            {isLogin ? 'Don’t have an account? ' : 'Already have an account? '}
            <Link
              to="#"
              className="text-gray-700 font-semibold"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign-Up' : 'Login'}
            </Link>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignUpScreen;
