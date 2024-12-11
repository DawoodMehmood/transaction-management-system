import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

export const ThisMonthTasks = ({ setupdatedLoading }) => {
  const [tasksByStage, setTasksByStage] = useState({});
  const [loadingTaskId, setLoadingTaskId] = useState(null);

  useEffect(() => {
    const fetchThisMonthTasks = async () => {
      try {
        const response = await fetch(
          'https://api.tkglisting.com/api/dates/calendar'
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data && data.transactions) {
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

          // Filter and group tasks for the current month by stage_id
          const tasksByStage = data.transactions
            .flatMap(transaction =>
              transaction.dates.map(date => ({
                transactionName: transaction.transaction_name,
                transaction_id: transaction.transaction_id,
                address: transaction.address,
                stage_id: date.stage_id,
                taskName: date.task.task_name,
                task_id: date.task.task_id,
                task_status: date.task.task_status,
                enteredDate: date.entered_date
                  ? new Date(date.entered_date)
                  : null,
              }))
            )
            .filter(task => {
              // Check if task is open and within this month
              const isThisMonth =
                task.enteredDate &&
                task.enteredDate >= startOfMonth &&
                task.enteredDate <= endOfMonth;
              return task.task_status === 'Open' && isThisMonth;
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

    fetchThisMonthTasks();
  }, []);

  const updateTaskStatus = async task => {
    setLoadingTaskId(task.task_id);
    try {
      const response = await fetch(
        `https://api.tkglisting.com/api/transactions/${task.task_id}/status`,
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
        toast.success('Task status updated successfully!');
        setTasksByStage(prevTasks => {
          const updatedTasks = { ...prevTasks };
          updatedTasks[task.stage_id] = updatedTasks[task.stage_id].filter(
            t => t.task_id !== task.task_id
          );
          return updatedTasks;
        });
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error updating task status');
    } finally {
      setLoadingTaskId(null);
    }
  };

  const formatDate = date =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';

  return (
    <div>
      <div className='overflow-x-auto bg-white'>
        <ToastContainer />
        <table className='w-full border border-gray-200 rounded-lg'>
          <thead>
            <tr className='border-b'>
              <th className='px-4 py-2 text-left text-gray-600'>Transaction</th>
              <th className='px-4 py-2 text-left text-gray-600'>Address</th>
              <th className='px-4 py-2 text-left text-gray-600'>
                Task Description
              </th>
              <th className='px-4 py-2 text-left text-gray-600'>Task Days</th>
              <th className='px-4 py-2 text-left text-gray-600'>Complete</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(tasksByStage).map(stageId => (
              <React.Fragment key={stageId}>
                {tasksByStage[stageId].map(task => (
                  <tr
                    key={task.task_id}
                    className='border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out'
                  >
                    <td className='px-4 py-3 flex items-center'>
                      <input
                        type='checkbox'
                        className='mr-2'
                        checked={task.task_status === 'Completed'}
                        onChange={() => updateTaskStatus(task)}
                        disabled={task.task_status === 'Completed'}
                      />
                      {loadingTaskId === task.task_id && (
                        <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-gray-600'></div>
                      )}
                      <span className='ml-2'>{task.transactionName}</span>
                    </td>
                    <td className='px-4 py-3'>{task.address}</td>
                    <td className='px-4 py-3'>{task.taskName}</td>
                    <td className='px-4 py-3'>
                      {formatDate(task.enteredDate)}
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='checkbox'
                        checked={task.task_status === 'Completed'}
                        onChange={() => updateTaskStatus(task)}
                        disabled={task.task_status === 'Completed'}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan='5' className='py-2'></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThisMonthTasks;
