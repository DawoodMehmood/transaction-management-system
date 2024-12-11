import React, { useEffect, useState } from 'react';

const ChecklistsContent = ({ currentStep, transactionId, setTaskCounts }) => {
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [activeStage, setActiveStage] = useState(currentStep + 1);

  // Fetch checklist data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.tkglisting.com/api/transactions/${transactionId}/details`
      );
      const data = await response.json();
      setStages(data.stages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching checklist data:', error);
      setIsLoading(false);
    }
  };

  // Handle task status change
  const handleCheckboxChange = async (taskId, taskStatus, stageId) => {
    if (loadingTaskId === taskId) return;

    setLoadingTaskId(taskId);
    const updatedStatus = taskStatus === 'Completed' ? 'Open' : 'Completed';

    try {
      const response = await fetch(
        `https://api.tkglisting.com/api/transactions/${taskId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            task_status: updatedStatus,
            stage_id: stageId,
          }),
        }
      );

      if (response.ok) {
        await fetchData();
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [transactionId]);

  const sortTasks = tasks => tasks.sort((a, b) => a.task_days - b.task_days);

  // Render tasks for each stage
  const renderStageContent = stage => {
    const sortedTasks = sortTasks(stage.tasks);
    return (
      <div key={stage.stage_id} className={`stage-${stage.stage_id}`}>
        <form>
          <div className='form-group'>
            <table className='min-w-full bg-white'>
              <thead>
                <tr>
                  <th className='py-2 px-4 border-b'>Status</th>
                  <th className='py-2 px-4 border-b'>Task Name</th>
                  <th className='py-2 px-4 border-b text-nowrap'>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map(task => (
                  <tr key={task.task_id}>
                    <td className='py-2 px-4 border-b'>
                      <label className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={task.task_status === 'Completed'}
                          disabled={loadingTaskId === task.task_id}
                          onChange={() =>
                            handleCheckboxChange(
                              task.task_id,
                              task.task_status,
                              stage.stage_id
                            )
                          }
                          className='form-checkbox h-5 w-5 text-blue-600'
                        />
                        {loadingTaskId === task.task_id && (
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-gray-600'></div>
                        )}
                      </label>
                    </td>
                    <td className='py-2 px-4 border-b'>{task.task_name}</td>
                    <td className='py-2 px-2 text-nowrap border-b'>
                      {task.task_days} day
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-48'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500'></div>
        <span className='ml-4 text-gray-500 font-semibold'>
          Loading checklist...
        </span>
      </div>
    );
  }

  if (!stages?.length) {
    return <div>No checklist data available.</div>;
  }

  return (
    <div>
      {/* Render tabs */}
      <div className='tabs flex space-x-4 mb-4'>
        {stages.slice(0, currentStep + 1).map((stage, index) => (
          <button
            key={stage.stage_id}
            onClick={() => setActiveStage(stage.stage_id)}
            className={`py-2 m-3 px-4 border-b-2 ${
              activeStage === stage.stage_id
                ? 'border-b-blue-500 text-blue-600'
                : 'border-b-transparent text-gray-700'
            }`}
          >
            {stage.stage_id === 1
              ? 'Pre-Listing'
              : stage.stage_id === 2
              ? 'Active Listing'
              : stage.stage_id === 3
              ? 'Under Contract'
              : `No stage`}
          </button>
        ))}
      </div>

      {/* Render content for stages 1, 2, and 3 if activeStage is 3, else render the single active stage */}
      {stages.map(stage => {
        const shouldRenderStage =
          activeStage === 3
            ? stage.stage_id === 3 // Render stages 1, 2, and 3 when "Under Contract" is active
            : stage.stage_id === activeStage; // Render only the active stage otherwise

        return shouldRenderStage ? renderStageContent(stage) : null;
      })}
    </div>
  );
};

export default ChecklistsContent;
