import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from '../../toastConfig';

const AddTaskForm = ({ closeModal, dateFields, currentStageId, reload }) => {
  const [stage_id, setStageId] = useState(currentStageId); // Store stage_id
  const [createdBy, setCreatedBy] = useState(''); // Editable createdBy field
  const [state, setState] = useState('IL'); // Default state set to 'IL'

  const [taskName, setTaskName] = useState('');
  const [bindDate, setBindDate] = useState('');
  const [taskDays, setTaskDays] = useState(0);
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [frequency, setFrequency] = useState(1); // Default count is 1
  const [interval, setInterval] = useState(1); // Default count is 1
  const [intervalType, setIntervalType] = useState('day'); // Default frequency

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username) {
      setCreatedBy(storedUser.username); // Set createdBy to the stored username
    } else {
      setCreatedBy('admin'); // Set createdBy to 'admin' for now
    }
  }, []);

  const handleSave = async () => {
    if (
      !taskName ||
      taskDays === undefined ||
      !bindDate ||
      !state ||
      !stage_id ||
      !createdBy
    ) {
      showErrorToast('Please fill out all required fields.');
      return;
    }

    const payload = {
      task_name: taskName,
      date_id: bindDate,
      task_days: taskDays,
      state,
      stage_id: parseInt(stage_id),
      delete_ind: false,
      created_by: createdBy,
      is_repeatable: isRepeatable,
      frequency: isRepeatable ? frequency : null,
      interval: isRepeatable ? interval : null,
      interval_type: isRepeatable ? intervalType : null,
    };

    console.log('Payload being sent:', payload);
    try {
      const response = await fetch(`${getServerUrl()}/api/tasks/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        reload();
        closeModal();
      } else {
        showErrorToast('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showErrorToast('Error adding task.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[700px]">
      <h2 className="text-xl font-semibold mb-4">Add Details</h2>

      {/* First Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <textarea
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none"
          rows="4"
          placeholder="Enter Task Discription here..."
          required
        ></textarea>
      </div>

      {/* Address 1 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Days & Date Binding *
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="number"
            value={taskDays}
            // onChange={(e) => setTaskDays(parseInt(e.target.value))}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '-' || value === '') {
                setTaskDays(value); // Allow "-" or empty value
              } else {
                setTaskDays(parseInt(value));
              }
            }}
            className="w-1/3 border-2 rounded p-2"
            onKeyDown={(e) => {
              if (
                e.key === ',' ||
                e.key === '+' ||
                e.key === '_' ||
                e.key === '/' ||
                e.key === '#' ||
                e.key === '='
              ) {
                e.preventDefault();
              }
            }}
          />
          <select
            value={bindDate}
            onChange={(e) => setBindDate(e.target.value)}
            className="w-2/3 px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a date</option> {/* Placeholder */}
            {dateFields.map((field) => (
              <option key={field.date_id} value={field.date_id}>
                {field.date_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stage *
        </label>
        <select
          value={stage_id}
          onChange={(e) => setStageId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Stage</option>
          <option value="1">Pre Listing</option>
          <option value="2">Active Listing</option>
          <option value="3">Under Contract</option>
        </select>
      </div>

      <div className="font-medium mt-5 mb-4 flex space-x-2">
        <div>Repeat Task</div>
        <div
          className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out ${
            isRepeatable ? 'bg-gray-700' : 'bg-gray-300'
          } rounded-full cursor-pointer`}
          onClick={() => setIsRepeatable(!isRepeatable)}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out transform ${
              isRepeatable ? 'translate-x-4' : 'translate-x-0'
            }`}
          ></span>
        </div>
      </div>

      {isRepeatable && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How many times to repeat:
            </label>
            <input
              type="number"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full border-2 rounded p-2"
              min="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat after interval:
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                className="w-1/3 border-2 rounded p-2"
                min="1"
              />
              <div className="w-2/3 flex">
                <button
                  onClick={() => setIntervalType('day')}
                  className={`p-2 w-full ${
                    intervalType === 'day'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  Day(s)
                </button>
                <button
                  onClick={() => setIntervalType('week')}
                  className={`p-2 border border-x-gray-500 w-full ${
                    intervalType === 'week'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  Week(s)
                </button>
                <button
                  onClick={() => setIntervalType('month')}
                  className={`p-2 w-full ${
                    intervalType === 'month'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  Month(s)
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-gray-700 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
      >
        Save
      </button>
      <button
        onClick={closeModal}
        className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default AddTaskForm;
