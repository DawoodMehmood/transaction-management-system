import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

export const ThisWeekTasks = ({ setupdatedLoading }) => {
  const [tasksByStage, setTasksByStage] = useState({});
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] = useState(null);

  useEffect(() => {
    const fetchThisWeekTasks = async () => {
      try {
        const response = await fetch(`${getServerUrl()}/api/dates/calendar`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data && data.transactions) {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek); // Start of the week (Sunday)
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (6 - dayOfWeek)); // End of the week (Saturday)

          // Filter and group tasks for the current week by stage_id
          const tasksByStage = data.transactions
            .flatMap((transaction) =>
              transaction.dates.map((date) => ({
                transactionName: transaction.transaction_name,
                transaction_id: transaction.transaction_id,
                address: transaction.address,
                stage_id: date.stage_id,
                taskName: date.task.task_name,
                task_id: date.task.task_id,
                transaction_detail_id: date.task.transaction_detail_id,
                task_status: date.task.task_status,
                enteredDate: date.entered_date
                  ? new Date(date.entered_date)
                  : null,
              }))
            )
            .filter((task) => {
              // Check if task is open and within this week
              const isThisWeek =
                task.enteredDate &&
                task.enteredDate >= startOfWeek &&
                task.enteredDate <= endOfWeek;
              return task.task_status === 'Open' && isThisWeek;
            })
            .reduce((acc, task) => {
              acc[task.stage_id] = acc[task.stage_id] || [];
              acc[task.stage_id].push(task);
              return acc;
            }, {});

          setTasksByStage(tasksByStage);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchThisWeekTasks();
  }, []);

  const updateTaskStatus = async (task) => {
    setLoadingTransactionDetailId(task.transaction_detail_id);
    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/${task.transaction_detail_id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: task.transaction_id,
            stage_id: task.stage_id,
            task_status: 'Completed',
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setupdatedLoading(true);
        showSuccessToast('Task status updated successfully!');
        setTasksByStage((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          updatedTasks[task.stage_id] = updatedTasks[task.stage_id].filter(
            (t) => t.transaction_detail_id !== task.transaction_detail_id
          );
          return updatedTasks;
        });
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showErrorToast('Error updating task status');
    } finally {
      setLoadingTransactionDetailId(null);
    }
  };

  const formatDate = (date) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';

  return (
    <div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-gray-600">Transaction</th>
              <th className="px-4 py-2 text-left text-gray-600">Address</th>
              <th className="px-4 py-2 text-left text-gray-600">
                Task Description
              </th>
              <th className="px-4 py-2 text-left text-gray-600">Task Days</th>
              <th className="px-4 py-2 text-left text-gray-600">Complete</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(tasksByStage).map((stageId) => (
              <React.Fragment key={stageId}>
                {tasksByStage[stageId].map((task) => (
                  <tr
                    key={task.transaction_detail_id}
                    className="border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-4 py-3 flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={task.task_status === 'Completed'}
                        onChange={() => updateTaskStatus(task)}
                        disabled={task.task_status === 'Completed'}
                      />
                      {loadingTransactionDetailId === task.transaction_detail_id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-600"></div>
                      )}
                      <span className="ml-2">{task.transactionName}</span>
                    </td>
                    <td className="px-4 py-3">{task.address}</td>
                    <td className="px-4 py-3">{task.taskName}</td>
                    <td className="px-4 py-3">
                      {formatDate(task.enteredDate)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={task.task_status === 'Completed'}
                        onChange={() => updateTaskStatus(task)}
                        disabled={task.task_status === 'Completed'}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="5" className="py-2"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThisWeekTasks;
