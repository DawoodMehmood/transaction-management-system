import React, { useEffect, useState } from 'react';

export const SideSection = ({
  setSelectedOption,
  selectedOption,
  currentStep,
  fullAddress,
}) => {
  const [checklistCounts, setChecklistCounts] = useState({
    total_tasks: 0,
    completed_tasks: 0,
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [tasks, setTasks] = useState([]); // State to store tasks

  const menuItems = [
    { name: 'Dates', hasBadge: false },
    { name: 'Property', hasBadge: false },
    { name: 'Checklists', hasBadge: false, count: '0/0' },
  ];

  // Fetch tasks from localStorage and update state
  const fetchTasksFromLocalStorage = () => {
    const storedTasks = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('task_')) {
        const task = JSON.parse(localStorage.getItem(key));
        storedTasks.push(task);
      }
    }
    setTasks(storedTasks);
  };

  // API call function to send task_id, transaction_id, and task_status in the body
  const updateTaskStatus = async task => {
    const { task_id, task_status, transaction_id } = task;

    try {
      setLoading(true); // Start loader

      const response = await fetch(
        `https://api.tkglisting.com/api/transactions/${task_id}/status`,
        {
          method: 'PUT', // Assuming PUT for status update
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: task_id,
            transaction_id: transaction_id,
            task_status: task_status,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);

        // Update the checklist counts with the latest data
        setChecklistCounts({
          total_tasks: data.total_tasks,
          completed_tasks: data.completed_tasks,
        });
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoading(false); // End loader
    }
  };

  // Handle task click to trigger API call and status update
  const handleTaskClick = task => {
    updateTaskStatus(task); // Update task status via API
  };

  // Fetch tasks initially
  useEffect(() => {
    fetchTasksFromLocalStorage(); // Fetch tasks from local storage on component mount
  }, []);

  // Example: Updating local storage when a task status is changed
  const updateLocalStorageTask = (task_id, newStatus) => {
    const taskKey = `task_${task_id}`;
    const task = JSON.parse(localStorage.getItem(taskKey));
    if (task) {
      task.task_status = newStatus; // Update the status
      localStorage.setItem(taskKey, JSON.stringify(task)); // Update local storage
      fetchTasksFromLocalStorage(); // Re-fetch tasks to reflect changes
    }
  };

  // Update the selectedOption based on the currentStep value
  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      setSelectedOption('Dates');
    }
  }, [currentStep, setSelectedOption]);

  return (
    <div className='w-full md:w-80 h-auto md:h-[120vh] bg-white p-4 shadow-lg mt-1'>
      {/* Header and Address Sections */}
      <div className='flex items-center justify-between mb-4'>
        <span className='bg-gray-200 text-[#9094A5] px-2 py-1 text-xs rounded-md'>
          Listing
        </span>
        <div className='text-gray-400 cursor-pointer'>⋮</div>
      </div>
      <div className='text-lg font-bold text-gray-800 mb-2 leading-tight'>
        {fullAddress}{' '}
      </div>

      {/* Transaction Information Section */}
      <div className='mt-4 border-t pt-3'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-base font-bold text-gray-800'>
            Transaction Information
          </span>
          <span className='material-icons text-gray-500 cursor-pointer'>
            <img src='/setting.svg' className='w-4 h-4' alt='Settings' />
          </span>
        </div>

        {/* Navigation Links */}
        <ul className='space-y-2'>
          {menuItems.map(item => (
            <li
              key={item.name}
              className={`px-2 py-1 rounded-md cursor-pointer flex justify-between items-center ${
                selectedOption === item.name
                  ? '!bg-[#E0E0E0] text-[#9094A5] font-medium'
                  : 'hover:bg-gray-100 text-gray-400'
              }`}
              onClick={() => setSelectedOption(item.name)}
            >
              {item.name}
              {item.hasBadge && (
                <span className='text-sm text-[#9094A5] bg-white border border-[#9094A5] px-2 py-0.5 rounded-full'>
                  {checklistCounts.completed_tasks}/
                  {checklistCounts.total_tasks}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Loader */}
      {loading && (
        <div className='fixed inset-0 bg-gray-200 bg-opacity-60 flex justify-center items-center'>
          <div className='w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin'></div>
        </div>
      )}
    </div>
  );
};

export default SideSection;
