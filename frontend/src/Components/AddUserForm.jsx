import { useEffect, useState } from 'react';
import { getServerUrl } from '../utility/getServerUrl';
import { apiFetch } from '../utility/apiFetch';
import { motion } from 'framer-motion';
import { showErrorToast } from '../toastConfig';
import Select from 'react-select';

const AddUserForm = ({refetchUsers, onClose, initialData }) => {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        username: initialData?.username || '',
        email: initialData?.email || '',
        password: '',
        confirmPassword: '',
        states: initialData?.states || [] // Array of state codes
        });
    const [availableStates, setAvailableStates] = useState([]); // Options for react-select
    const [selectedStates, setSelectedStates] = useState(
        [] // We'll update this after fetching availableStates
    );
    

  // Fetch states from backend
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await apiFetch(`${getServerUrl()}/api/states`);
        const data = await response.json();
        if (response.ok) {
          // Transform fetched states into { value, label } objects
          const options = data.states.map((stateObj) => ({
            value: stateObj.state,
            label: stateObj.state_name
          }));
          setAvailableStates(options);
        } else {
          throw new Error(data.error || 'Failed to fetch states');
        }
      } catch (error) {
        showErrorToast(error.message);
      }
    };

    fetchStates();
  }, []);
  
  useEffect(() => {
    if (isEdit && availableStates.length > 0) {
      const preselected = formData.states.map((stateSymbol) => {
        return availableStates.find(option => option.value === stateSymbol) || { value: stateSymbol, label: stateSymbol };
      });
      setSelectedStates(preselected);
    }
  }, [isEdit, availableStates, formData.states]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (selectedOptions) => {
    setSelectedStates(selectedOptions);
    const states = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData((prev) => ({ ...prev, states }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, states } = formData;
    if (!isEdit && password !== confirmPassword) {
        showErrorToast('Passwords do not match!');
        return;
      }
    // Build payload – for editing, include the user_id; omit confirmPassword.
    let payload;
    if (isEdit) {
        payload = {
        user_id: initialData.user_id,
        username,
        email,
        states
        };
        // If a new password is entered, include it.
        if (password.trim() !== '') {
        payload.password = password;
        }
    } else {
        payload = {
        username,
        email,
        password,
        confirmPassword,
        states
        };
    }
    try {
        const endpoint = isEdit
          ? `${getServerUrl()}/api/auth/user` // PUT endpoint for editing
          : `${getServerUrl()}/api/auth/signup`; // POST endpoint for signup
        const method = isEdit ? 'PUT' : 'POST';
  
        const response = await apiFetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          refetchUsers();
          onClose();
        } else {
          throw new Error(data.message || (isEdit ? 'Update failed' : 'Signup failed'));
        }
      } catch (error) {
        showErrorToast(error.message || 'Operation failed. Please try again.');
      }
    };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[500px]">
      <motion.div
        className="bg-gray-300 rounded-lg shadow-lg p-8 w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-700">
            {isEdit ? 'Edit User' : 'Add User'}
        </h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
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
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required={isEdit ? false: true}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={isEdit ? false: true}
              disabled={!formData.password}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="states" className="block text-gray-700 mb-2">
              Allowed States
            </label>
            <Select
                isMulti
                options={availableStates}
                value={selectedStates}
                onChange={handleSelectChange}
                placeholder="Select states..."
                closeMenuOnSelect={true}
                required
                />
          </div>
          <motion.button
            type="submit"
            className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-900 transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEdit ? 'Update' : 'Add'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddUserForm;
