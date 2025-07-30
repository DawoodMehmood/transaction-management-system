import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../../utility/getServerUrl';
import { showErrorToast } from '../../../toastConfig';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/outline';
import {
  formatDate,
  getDateADayAfter,
  formatDateADayBefore,
} from '../../../utility/getFormattedDate';
import { apiFetch } from '../../../utility/apiFetch';


const AddTaskForm = ({ closeModal, currentStageId, reload, transactionType, state, transactionId }) => {
  const [createdBy, setCreatedBy] = useState(''); // Editable createdBy field

  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isUserSelected, setIsUserSelected] = useState(false);

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
      !state ||
      !currentStageId ||
      !createdBy
    ) {
      showErrorToast('Please fill out all required fields.');
      return;
    }
    
    const formattedDate = date
        ? new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        )
          .toISOString()
          .split('T')[0]
        : null;

    const payload = {
      transaction_id: transactionId,
      task_name: taskName,
      state_id: state,
      stage_id: parseInt(currentStageId),
      created_by: createdBy,
      transaction_type: transactionType,
      task_due_date: formattedDate
    };

    console.log('Payload being sent:', payload);
    try {
      const response = await apiFetch(`${getServerUrl()}/api/transactions/addTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await reload();
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
      <h2 className="text-xl font-semibold mb-4">Add Task</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name/Description *
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
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date *
        </label>
        <div className="border rounded-lg p-2 flex items-center relative">
        <CalendarIcon
          className="w-5 h-5 cursor-pointer"
          onClick={() => setShowDatePicker(true)}
        />
        <p
          className="font-normal text-lg ms-4 cursor-pointer"
          onClick={() => setShowDatePicker(true)}
        >
          {date
            ? 
            formatDate(date)
            : 'Select a date'}
        </p>
        {showDatePicker && (
          <div className="absolute top-full left-0 z-10">
            <DatePicker
              selected={date}
              onChange={(newdate) => {
                setDate(newdate);
                setIsUserSelected(true); // Mark that the user manually selected a date
                setShowDatePicker(false);
              }}
              inline
              calendarClassName="custom-calendar"
              popperPlacement="bottom"
              onClickOutside={() => setShowDatePicker(false)}
            />
          </div>
        )}
      </div>
      </div>
      

      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Days & Date Binding *
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="number"
            value={taskDays}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '-' || value === '') {
                setTaskDays(value);
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
            <option value="">Select a date</option>
            {dateFields.map((field) => (
              <option key={field.date_id} value={field.date_id}>
                {field.date_name}
              </option>
            ))}
          </select>
        </div>
      </div> */}

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
