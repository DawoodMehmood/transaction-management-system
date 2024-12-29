import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

// Helper function to format dates
const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// API call to fetch tasks
export const fetchTasks = async () => {
  try {
    const response = await fetch(`${getServerUrl()}/api/dates/calendar`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.transactions.flatMap((transaction) =>
      transaction.dates.map((date) => ({
        transactionId: transaction.transaction_id,
        transactionName: transaction.transaction_name,
        stageId: date.stage_id,
        taskId: date.task.task_id,
        transactionDetailId: date.task.transaction_detail_id,
        address: `${transaction.address}, ${transaction.city}, ${transaction.state}`,
        taskName: date.task.task_name,
        enteredDate: new Date(date.entered_date),
        taskStatus: date.task.task_status,
      }))
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Function to update task status
const updateTaskStatus = async (
  transactionDetailId,
  transactionId,
  stageId,
  reloadTasks,
  setLoadingTransactionDetailId
) => {
  try {
    setLoadingTransactionDetailId(transactionDetailId); // Show loader for this task

    const requestBody = {
      transaction_id: transactionId,
      stage_id: stageId,
      task_status: 'Completed',
    };

    const response = await fetch(
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
      showSuccessToast('Task status updated successfully!');
      reloadTasks(true); // Call reloadTasks with 'true' on success
    } else {
      const errorMessage = await response.text();
      console.error('Failed to update task status:', errorMessage);
      throw new Error(`Failed to update task status: ${errorMessage}`);
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
}) => (
  <>
    <table className="w-full border border-gray-200 rounded-lg">
      <thead>
        <tr className="border-b text-nowrap">
          <th className="px-4 py-2 text-left text-gray-600">Transaction</th>
          <th className="px-4 py-2 text-left text-gray-600">Address</th>
          <th className="px-4 py-2 text-left text-gray-600">
            Task Description
          </th>
          <th className="px-4 py-2 text-left text-gray-600">Task Days</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr
            key={index}
            className="border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            <td className="px-4 py-3 flex object-center items-center">
              {showCheckbox && (
                <div className="mr-2 relative">
                  <input
                    type="checkbox"
                    onChange={() => onTaskStatusChange(task)}
                    disabled={task.taskStatus === 'Completed'}
                    checked={task.taskStatus === 'Completed'}
                    className="appearance-none w-4 h-4 border border-gray-400 rounded checked:bg-blue-600 checked:border-transparent"
                  />
                  {loadingTransactionDetailId === task.transactionDetailId && (
                    <div className="animate-spin absolute -top-0 left-5 rounded-full h-4 w-4 border-t-2 border-gray-600"></div>
                  )}
                </div>
              )}
              <span className="ms-4">{task.transactionName}</span>
            </td>
            <td className="px-4 py-3">{task.address}</td>
            <td className="px-4 py-3">{task.taskName}</td>
            <td className="px-4 py-3 text-nowrap">
              {formatDate(task.enteredDate)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

// TaskCategory Component
const TaskCategory = ({ filterTasks, showCheckbox, reloadTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] = useState(null);

  const fetchAndSetTasks = async (shouldReload = false) => {
    if (shouldReload) {
      console.log('Reloading tasks...'); // Log for reload confirmation
    }
    const data = await fetchTasks();
    setTasks(filterTasks(data));
  };

  useEffect(() => {
    fetchAndSetTasks();
  }, []);

  const handleStatusChange = (task) => {
    updateTaskStatus(
      task.transactionDetailId,
      task.transactionId,
      task.stageId,
      fetchAndSetTasks,
      setLoadingTransactionDetailId
    );
  };

  return (
    <TaskTable
      tasks={tasks}
      showCheckbox={showCheckbox}
      onTaskStatusChange={handleStatusChange}
      loadingTransactionDetailId={loadingTransactionDetailId}
    />
  );
};

// Task Components with Different Filters
export const ScheduledTasks = ({ reloadTasks }) => (
  <TaskCategory
    filterTasks={(data) =>
      data.filter((task) => task.taskStatus !== 'Completed')
    }
    showCheckbox
    reloadTasks={reloadTasks}
  />
);

export const TodayTasks = (reloadTasks) => (
  <TaskCategory
    filterTasks={(data) =>
      data.filter(
        (task) =>
          task.enteredDate.toDateString() === new Date().toDateString() &&
          task.taskStatus !== 'Completed'
      )
    }
    showCheckbox
    reloadTasks={reloadTasks}
  />
);

// Exported Components with reloadTasks behavior
export const ThisWeekTasks = (reloadTasks) => (
  <TaskCategory
    filterTasks={(data) => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

      return data.filter(
        (task) =>
          task.enteredDate >= startOfWeek &&
          task.enteredDate <= endOfWeek &&
          task.taskStatus !== 'Completed'
      );
    }}
    showCheckbox
    reloadTasks={reloadTasks}
  />
);

export const ThisMonthTasks = (reloadTasks) => (
  <TaskCategory
    filterTasks={(data) => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return data.filter(
        (task) =>
          task.enteredDate >= startOfMonth &&
          task.enteredDate <= endOfMonth &&
          task.taskStatus !== 'Completed'
      );
    }}
    showCheckbox
    reloadTasks={reloadTasks}
  />
);

export const OverdueTasks = (reloadTasks) => (
  <TaskCategory
    filterTasks={(data) =>
      data.filter(
        (task) =>
          task.enteredDate < new Date() && task.taskStatus !== 'Completed'
      )
    }
    showCheckbox
    reloadTasks={reloadTasks}
  />
);

export const FinishedTasks = (reloadTasks) => (
  <TaskCategory
    filterTasks={(data) =>
      data.filter((task) => task.taskStatus === 'Completed')
    }
    showCheckbox={false}
    reloadTasks={reloadTasks}
  />
);

export default {
  FinishedTasks,
  OverdueTasks,
  ScheduledTasks,
  ThisMonthTasks,
  ThisWeekTasks,
  TodayTasks,
  fetchTasks,
};
