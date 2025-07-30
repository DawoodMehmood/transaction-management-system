import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from '../../toastConfig';
import { cleanText } from '../../utility/getCleanText';
import { formatDate } from '../../utility/getFormattedDate';
import { TrashIcon } from '@heroicons/react/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '../../utility/apiFetch';
import { capitalize } from '../../utility/getCapitalizeWord';

// Function to update task status
const updateTaskStatus = async (
  transactionDetailId,
  transactionId,
  stageId,
  reloadTasks,
  setLoadingTransactionDetailId,
  skipReason = null
) => {
  try {
    const compositeKey = transactionId + transactionDetailId;
    setLoadingTransactionDetailId(compositeKey);

    const requestBody = {
      transaction_id: transactionId,
      stage_id: stageId,
      task_status: skipReason ? 'Open' : 'Completed',
      skip_reason: skipReason,
    };

    const response = await apiFetch(
      `${getServerUrl()}/api/transactions/${transactionDetailId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      reloadTasks(); // Call reloadTasks with 'true' on success
    } else {
      const errorMessage = await response.text();
      console.error('Failed to update task status:', errorMessage);
      showErrorToast('Failed to update task status');
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    showErrorToast('Error updating task status');
  } finally {
    setLoadingTransactionDetailId(null); // Hide loader after update
  }
};

// TaskTable Component
const TaskTable = ({
  tasks,
  showCheckbox = true,
  onTaskStatusChange,
  loadingTransactionDetailId,
  handleSkipClick
}) => (
  <>
    <table className="w-full border border-gray-200 rounded-lg">
      <thead>
        <tr className="border-b text-nowrap">
          <th className="px-4 py-2 text-left text-gray-600">Task Date</th>
          <th className="px-4 py-2 text-left text-gray-600">Address</th>
          <th className="px-4 py-2 text-left text-gray-600">
            Task Description
          </th>
          <th className="px-4 py-2 text-left text-gray-600">Lead</th>
          <th className="px-4 py-2 text-left text-gray-600">Type</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr
            key={index}
            className="border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            <td className={`px-4 py-3 ${task.taskIsSkipped ? '' : 'flex'}`}>
              {showCheckbox && (
                <div className='flex items-center'>
                  <div className="mr-2 relative flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => onTaskStatusChange(task)}
                      disabled={
                        loadingTransactionDetailId ===
                        task.transactionId + task.transactionDetailId ||
                        task.task_status === 'Completed'
                      }
                      checked={task.taskStatus === 'Completed'}
                      className="appearance-none w-4 h-4 border border-gray-400 rounded checked:bg-blue-600 checked:border-transparent"
                    />
                    {loadingTransactionDetailId ===
                      task.transactionId + task.transactionDetailId && (
                        <div className="animate-spin absolute -top-0 left-5 rounded-full h-4 w-4 border-t-2 border-gray-600"></div>
                      )}
                  </div>
                  <div
                    title={task.taskIsSkipped ? 'Task is skipped' : 'Skip Task'}
                    onClick={() => handleSkipClick(task)}
                  >
                    <TrashIcon
                      className={`w-5 h-5 text-gray-500 ${task.taskIsSkipped
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer'
                        }`}
                    />
                  </div>
                </div>
              )}
              <span className="ms-2">{formatDate(task.enteredDate)}</span>
            </td>
            <td className="px-4 py-3">{task.address}</td>
            <td className="px-4 py-3">{cleanText(task.taskName)}{' '}
              {task.taskIsSkipped && task.taskStatus === 'Open' && (
                <div className="text-sm text-gray-500">
                  Skipping reason: {task.taskSkipReason}
                </div>
              )}
            </td>
            <td className="px-4 py-3 text-nowrap">{task.transactionName}</td>
            <td className="px-4 py-3 text-nowrap">{capitalize(task.transactionType)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const TaskCategory = ({ tasks, tasksFilter, showCheckbox, reloadTasks }) => {
  const filteredTasks = tasks ? tasksFilter(tasks) : [];
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] =
    useState(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState(null);

  const handleStatusChange = (task) => {
    updateTaskStatus(
      task.transactionDetailId,
      task.transactionId,
      task.stageId,
      reloadTasks,
      setLoadingTransactionDetailId,
      task.taskSkipReason
    );
  };

  const handleSkipClick = (task) => {
    if (!task.taskIsSkipped) {
      setTaskToSkip({
        transactionDetailId: task.transactionDetailId,
        transactionId: task.transactionId,
        stageId: task.stageId,
      });
      setShowSkipModal(true);
    }
  };

  const handleSkipConfirm = (reason) => {
    if (taskToSkip) {
      const { transactionDetailId, transactionId, stageId } = taskToSkip;
      updateTaskStatus(transactionDetailId, transactionId, stageId, reloadTasks, setLoadingTransactionDetailId, reason);
      setTaskToSkip(null);
    }
    setShowSkipModal(false);
  };

  return (
    <>
      <TaskTable
        tasks={filteredTasks}
        showCheckbox={showCheckbox}
        onTaskStatusChange={handleStatusChange}
        loadingTransactionDetailId={loadingTransactionDetailId}
        handleSkipClick={handleSkipClick}
      />
      <SkipModal
        showSkipModal={showSkipModal}
        setShowSkipModal={setShowSkipModal}
        onConfirm={handleSkipConfirm}
      />
    </>
  );
};


export const TodayTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) => {
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return data.filter(
        (task) =>
          task.enteredDate &&
          task.enteredDate.getDate() === now.getDate() && task.enteredDate.getMonth() === now.getMonth() && task.enteredDate.getFullYear() === now.getFullYear() &&
          task.taskStatus === 'Open' && task.taskIsSkipped === false
      )
    }
    }
    showCheckbox={true}
    reloadTasks={reloadTasks}
  />
);

// Exported Components with reloadTasks behavior
export const ThisWeekTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek); // Start of the week (Sunday)
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - dayOfWeek)); // End of the week (Saturday)

      return data.filter(
        (task) =>
          task.enteredDate >= startOfWeek &&
          task.enteredDate <= endOfWeek &&
          task.taskStatus !== 'Completed' && task.taskIsSkipped === false
      );
    }}
    showCheckbox={true}
    reloadTasks={reloadTasks}
  />
);

export const ThisMonthTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) => {
      const today = new Date();
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ); // First day of the month
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ); // Last day of the month

      return data.filter(
        (task) =>
          task.enteredDate &&
          task.enteredDate >= startOfMonth &&
          task.enteredDate <= endOfMonth &&
          task.taskStatus === 'Open' && task.taskIsSkipped === false
      );
    }}
    showCheckbox={true}
    reloadTasks={reloadTasks}
  />
);

export const OverdueTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) => {
      const now = new Date();
      const oneDayAndSixHoursAgo = new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000
      ); // 1 day and 6 hours ago
      return data.filter(
        (task) =>
          task.enteredDate &&
          task.enteredDate <= oneDayAndSixHoursAgo &&
          task.taskStatus === 'Open' && task.taskIsSkipped === false
      )
    }
    }
    showCheckbox={true}
    reloadTasks={reloadTasks}
  />
);

export const FinishedTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) =>
      data.filter((task) => task.taskStatus === 'Completed' && task.taskIsSkipped === false)
    }
    showCheckbox={false}
    reloadTasks={reloadTasks}
  />
);

export const AllTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) =>
      data.filter((task) => task.enteredDate && task.taskStatus === 'Open' && task.taskIsSkipped === false)
    }
    showCheckbox={true}
    reloadTasks={reloadTasks}
  />
);

export const SkippedTasks = ({ tasks, reloadTasks }) => (
  <TaskCategory
    tasks={tasks}
    tasksFilter={(data) =>
      data.filter((task) => task.enteredDate && task.taskStatus === 'Open' && task.taskIsSkipped === true)
    }
    showCheckbox={false}
    reloadTasks={reloadTasks}
  />
);
const SkipModal = ({ showSkipModal, setShowSkipModal, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    setShowSkipModal(false);
  };

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason);
      handleClose();
    } else {
      alert('Please provide a reason for skipping.');
    }
  };

  return (
    <AnimatePresence>
      {showSkipModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h3 className="text-lg font-bold mb-4">Reason for Skipping</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-2 rounded p-2 focus:outline-none"
              rows="3"
              placeholder="Enter your reason here..."
              required
            ></textarea>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Skip
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  FinishedTasks,
  OverdueTasks,
  ThisMonthTasks,
  ThisWeekTasks,
  TodayTasks
};
