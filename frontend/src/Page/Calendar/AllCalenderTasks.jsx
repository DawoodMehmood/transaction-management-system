import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

export const AllCalenderTasks = ({ setupdatedLoading }) => {
  const [tasksByStage, setTasksByStage] = useState({});
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${getServerUrl()}/api/dates/calendar`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data && data.transactions) {
          // Group tasks by stage_id
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

    fetchTasks();
  }, []);

  const updateTaskStatus = async (task) => {
    const compositeKey = task.transaction_id + task.transaction_detail_id;
    setLoadingTransactionDetailId(compositeKey);
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
      console.log(response);

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setupdatedLoading(true);
        showSuccessToast('Task status updated successfully!');
        setTasksByStage((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          updatedTasks[task.stage_id] = updatedTasks[task.stage_id].filter(
            (t) =>
              t.transaction_id + t.transaction_detail_id !== compositeKey
          );
          return updatedTasks;
        });
      } else {
        console.error('Error updating task status');
        showErrorToast('Error updating task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showErrorToast('Error updating task status');
    } finally {
      setLoadingTransactionDetailId(null);
    }
  };

  const formatDate = (date) => {
    return date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';
  };

  return (
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
          </tr>
        </thead>
        <tbody>
          {Object.keys(tasksByStage).map((stageId) => (
            <React.Fragment key={stageId}>
              {tasksByStage[stageId].map(
                (task) =>
                  task.task_status !== 'Completed' && (
                    <tr
                      key={task.transaction_id + task.transaction_detail_id }
                      className="border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-4 py-3 flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={task.task_status === 'Completed'}
                          onChange={() => updateTaskStatus(task)}
                          disabled={
                            loadingTransactionDetailId === task.transaction_id + task.transaction_detail_id ||
                            task.task_status === 'Completed'
                          }
                        />
                        {loadingTransactionDetailId === task.transaction_id + task.transaction_detail_id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-600"></div>
                        )}
                        <span className="ml-2">{task.transactionName}</span>
                      </td>
                      <td className="px-4 py-3">{task.address}</td>
                      <td className="px-4 py-3">{task.taskName}</td>
                      <td className="px-4 py-3">
                        {formatDate(task.enteredDate)}
                      </td>
                    </tr>
                  )
              )}
              {/* Render a space between stages */}
              <tr>
                <td colSpan="4" className="py-2"></td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllCalenderTasks;
