import React, { useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from './../../toastConfig';
import { cleanText } from '../../utility/getCleanText';

const RowForm = ({ closeModal, task, dateFields, onUpdate }) => {
  const [taskName, setTaskName] = useState(task.task_name || '');
  const [bindDate, setBindDate] = useState(task.date_id || '');
  const [taskDays, setTaskDays] = useState(task.task_days || 0);
  const [isRepeatable, setIsRepeatable] = useState(task.is_repeatable || false);
  const [frequency, setFrequency] = useState(task.frequency || 1); // Default count is 1
  const [interval, setInterval] = useState(task.interval || 1); // Default count is 1
  const [intervalType, setIntervalType] = useState(task.interval_type || 'day'); // Default frequency

  const handleSubmit = async () => {
    const requestBody = {
      task_id: task.task_id,
      state: task.state,
      stage_id: task.stage_id,
      task_name: taskName,
      date_id: bindDate,
      task_days: taskDays,
      is_repeatable: isRepeatable,
      ...(isRepeatable && {
        frequency,
        interval,
        interval_type: intervalType,
      }),
    };

    console.log('Request Body:', requestBody);

    try {
      const response = await fetch(
        `${getServerUrl()}/api/tasks/${task.task_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await onUpdate(); // Update the task list
        closeModal(); // Close the modal
      } else {
        showErrorToast('Failed to update task.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Error updating task. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white">
      <div className="font-medium mb-2">Name</div>
      <textarea
        value={cleanText(taskName)}
        onChange={(e) => setTaskName(e.target.value)}
        className="w-full border-2 rounded p-2 focus:outline-none"
        rows="4"
        placeholder="Enter Task Discription here..."
        required
      ></textarea>
      <div className="font-medium mb-2">Task Days & Date Binding</div>
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
          {dateFields.map((field) => (
            <option key={field.date_id} value={field.date_id}>
              {field.date_name}
            </option>
          ))}
        </select>
      </div>
      <div className="font-medium mt-5 mb-2 flex space-x-2">
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
      <div className="flex justify-end mt-8 space-x-2">
        <button
          className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default RowForm;
