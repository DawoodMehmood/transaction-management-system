import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../../utility/getServerUrl';
import { AnimatePresence, motion } from 'framer-motion';
import RowForm from './RowDrawer.jsx';
import {
  DocumentDuplicateIcon,
  TrashIcon,
  XIcon,
} from '@heroicons/react/outline';
import { showSuccessToast } from './../../../toastConfig.js';

const ChecklistsContent = ({ currentStep, transactionId, setTaskCounts }) => {
  console.log('Checklist content', currentStep, transactionId);
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] =
    useState(null);
  const [activeStage, setActiveStage] = useState(currentStep);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showRowDrawer, setShowRowDrawer] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState(null);
  const [taskToDuplicate, setTaskToDuplicate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch checklist data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/${transactionId}/details`
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
  const handleCheckboxChange = async (
    transactionDetailId,
    taskStatus,
    stageId,
    skipReason = null
  ) => {
    if (loadingTransactionDetailId === transactionDetailId) return;

    if (taskStatus === 'Completed' && !skipReason) {
      // Open skip modal if unchecking a completed task
      setTaskToSkip({ transactionDetailId, stageId });
      setShowSkipModal(true);
      return;
    }

    setLoadingTransactionDetailId(transactionDetailId);
    const updatedStatus = taskStatus === 'Completed' ? 'Open' : 'Completed';

    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/${transactionDetailId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            task_status: updatedStatus,
            stage_id: stageId,
            skip_reason: skipReason,
          }),
        }
      );

      if (response.ok) {
        showSuccessToast('Task status updated successfully.');
        await fetchData();
      } else {
        console.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoadingTransactionDetailId(null);
    }
  };

  const handleDuplicateSubmit = async (
    transactionDetailId,
    stageId,
    taskDueDate,
    count,
    frequency
  ) => {
    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/${transactionDetailId}/duplicate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            stage_id: stageId,
            taskDueDate,
            count,
            frequency,
          }),
        }
      );

      if (response.ok) {
        showSuccessToast('Tasks duplicated successfully.');
        await fetchData();
      } else {
        console.error('Failed to duplicate tasks');
      }
    } catch (error) {
      console.error('Error duplicating tasks:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [transactionId]);

  const handleSkipConfirm = (reason) => {
    if (taskToSkip) {
      const { transactionDetailId, stageId } = taskToSkip;
      handleCheckboxChange(transactionDetailId, 'Completed', stageId, reason);
      setTaskToSkip(null);
    }
    setShowSkipModal(false);
    setShowRowDrawer(false);
  };

  const handleDuplicateConfirm = (count, frequency) => {
    if (taskToDuplicate) {
      const { transactionDetailId, stageId, taskDueDate } = taskToDuplicate;
      handleDuplicateSubmit(
        transactionDetailId,
        stageId,
        taskDueDate,
        count,
        frequency
      );
      setTaskToDuplicate(null);
    }
    setShowDuplicateModal(false);
    setShowRowDrawer(false);
  };

  const sortTasks = (tasks) => tasks.sort((a, b) => a.task_days - b.task_days);

  // Render tasks for each stage
  const renderStageContent = (stage) => {
    const sortedTasks = sortTasks(stage.tasks);
    return (
      <div key={stage.stage_id} className={`stage-${stage.stage_id}`}>
        <form>
          <div className="form-group">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Task Name</th>
                  <th className="py-2 px-4 border-b text-nowrap">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => (
                  <tr
                    key={task.transaction_detail_id}
                    onClick={() => {
                      setSelectedTask(task); // Set the selected task
                      setShowRowDrawer(true); // Open the drawer
                    }}
                    className="cursor-pointer"
                  >
                    <td className="py-2 px-4 border-b">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.task_status === 'Completed'}
                          disabled={
                            loadingTransactionDetailId ===
                            task.transaction_detail_id
                          }
                          onClick={(e) => e.stopPropagation()} // Prevent row click when checkbox is clicked
                          onChange={() =>
                            handleCheckboxChange(
                              task.transaction_detail_id,
                              task.task_status,
                              stage.stage_id
                            )
                          }
                          className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                        />
                        {loadingTransactionDetailId ===
                          task.transaction_detail_id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-600"></div>
                        )}
                      </label>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {task.task_name}{' '}
                      {task.skip_reason && task.task_status !== 'Completed' && (
                        <div className="text-sm text-gray-500">
                          Task is skipped with reason: {task.skip_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-nowrap border-b">
                      {task.task_due_date
                        ? (() => {
                            const daysRemaining = Math.ceil(
                              (new Date(task.task_due_date).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            if (daysRemaining === 0) {
                              return 'Today';
                            } else if (daysRemaining === 1) {
                              return `${daysRemaining} day`;
                            } else if (daysRemaining > 1) {
                              return `${daysRemaining} days`;
                            } else {
                              return `${daysRemaining} day${
                                daysRemaining === -1 ? '' : 's'
                              }`;
                            }
                          })()
                        : 'N/A'}
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
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500"></div>
        <span className="ml-4 text-gray-500 font-semibold">
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
      <div className="tabs flex space-x-4 mb-4">
        {stages.slice(0, currentStep).map((stage) => (
          <button
            key={stage.stage_id}
            onClick={() => setActiveStage(stage.stage_id)}
            className={`py-2 m-3 px-4 border-b-2 ${
              activeStage == stage.stage_id
                ? 'border-b-blue-500 text-blue-600'
                : 'border-b-transparent text-gray-700'
            }`}
          >
            {stage.stage_id == 1
              ? 'Pre-Listing'
              : stage.stage_id == 2
              ? 'Active Listing'
              : stage.stage_id == 3
              ? 'Under Contract'
              : `No stage`}
          </button>
        ))}
      </div>

      {/* Render content for stages 1, 2, and 3 if activeStage is 3, else render the single active stage */}
      {stages.map((stage) => {
        const shouldRenderStage = stage.stage_id == activeStage; // Render only the active stage otherwise
        return shouldRenderStage ? renderStageContent(stage) : null;
      })}
      <RowDrawer
        showRowDrawer={showRowDrawer}
        setShowRowDrawer={setShowRowDrawer}
        task={selectedTask} // Pass the selected task
        setShowDuplicateModal={setShowDuplicateModal}
        setShowSkipModal={setShowSkipModal}
        setTaskToSkip={setTaskToSkip}
        setTaskToDuplicate={setTaskToDuplicate}
        transactionId={transactionId}
        onUpdate={fetchData}
      />
      <SkipModal
        showSkipModal={showSkipModal}
        setShowSkipModal={setShowSkipModal}
        onConfirm={handleSkipConfirm}
      />
      <DuplicateModal
        showDuplicateModal={showDuplicateModal}
        setShowDuplicateModal={setShowDuplicateModal}
        onConfirm={handleDuplicateConfirm}
      />
    </div>
  );
};

const RowDrawer = ({
  showRowDrawer,
  setShowRowDrawer,
  task,
  setShowDuplicateModal,
  setShowSkipModal,
  setTaskToSkip,
  setTaskToDuplicate,
  transactionId,
  onUpdate,
}) => {
  const handleClose = () => {
    setShowRowDrawer(false);
  };
  const handleSkipClick = () => {
    if (!task.is_skipped) {
      setTaskToSkip({
        transactionDetailId: task.transaction_detail_id,
        stageId: task.stage_id,
      });
      setShowSkipModal(true);
    }
  };
  const handleDuplicateClick = () => {
    const date = new Date(task.task_due_date);
    setTaskToDuplicate({
      transactionDetailId: task.transaction_detail_id,
      stageId: task.stage_id,
      taskDueDate: new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      ),
    });
    setShowDuplicateModal(true);
  };

  return (
    <AnimatePresence>
      {showRowDrawer && (
        <>
          {/* Overlay to detect outside clicks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-800 z-40 cursor-pointer"
            onClick={handleClose}
          ></motion.div>

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed bottom-0 right-0 h-[65vh] w-1/3 bg-white border-2 z-50 overflow-auto"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction</h2>
                <div className="flex items-center space-x-2">
                  <div
                    title={task.is_skipped ? 'Task is skipped' : 'Skip Task'}
                    onClick={handleSkipClick}
                  >
                    <TrashIcon
                      className={`w-6 h-6 text-gray-500 ${
                        task.is_skipped
                          ? 'cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    />
                  </div>
                  <div title="Duplicate Task" onClick={handleDuplicateClick}>
                    <DocumentDuplicateIcon className="w-6 h-6 text-gray-500 cursor-pointer" />
                  </div>
                  <XIcon
                    className="w-6 h-6 text-gray-500 cursor-pointer"
                    onClick={handleClose}
                  />
                </div>
              </div>
              <RowForm
                closeModal={handleClose}
                task={task}
                transactionId={transactionId}
                onUpdate={onUpdate}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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

const DuplicateModal = ({
  showDuplicateModal,
  setShowDuplicateModal,
  onConfirm,
}) => {
  const [count, setCount] = useState(1); // Default count is 1
  const [frequency, setFrequency] = useState('Every month'); // Default frequency

  const handleClose = () => {
    setShowDuplicateModal(false);
  };

  const handleSubmit = () => {
    if (count > 0 && frequency) {
      onConfirm(count, frequency); // Pass count and frequency to the parent handler
      handleClose();
    } else {
      alert('Please provide valid inputs.');
    }
  };

  return (
    <AnimatePresence>
      {showDuplicateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h3 className="text-lg font-bold mb-4">Duplicate Task</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How many times to duplicate:
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full border rounded p-2"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency:
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="Every two days">Every two days</option>
                <option value="Every week">Every week</option>
                <option value="Every month">Every month</option>
              </select>
            </div>
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
                Duplicate
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChecklistsContent;
