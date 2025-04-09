import React, { useState } from 'react';
import { cleanText } from '../../utility/getCleanText';
import { AnimatePresence, motion } from 'framer-motion';
import RowForm from './RowDrawer.jsx';
import { TrashIcon, XIcon } from '@heroicons/react/outline';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from './../../toastConfig';
import { apiFetch } from '../../utility/apiFetch';

export const Tasks = ({ tasks, dateFields, reload }) => {
  const [showRowDrawer, setShowRowDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      handleDelete(taskToDelete);
      setTaskToDelete(null);
    }
    setShowDeleteModal(false);
    setShowRowDrawer(false);
  };

  const handleDelete = async (taskToDelete) => {
    try {
      const response = await apiFetch(
        `${getServerUrl()}/api/tasks/${taskToDelete.task_id}?state=${taskToDelete.state}&transaction_type=${taskToDelete.transaction_type}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: taskToDelete.task_id,
            state: taskToDelete.state,
            stageId: taskToDelete.stage_id,
            transaction_type: taskToDelete.transaction_type
          }),
        }
      );

      if (response.ok) {
        reload();
      } else {
        showErrorToast('Failed to delete task.');
      }
    } catch (error) {
      console.error('Error deleting transactions:', error);
      showErrorToast('Error deleting task.');
    }
  };

  const sortedTasks = Object.values(
    tasks.reduce((acc, task) => {
      if (!acc[task.date_id]) acc[task.date_id] = [];
      acc[task.date_id].push(task);
      return acc;
    }, {})
  ).flatMap((group) => group.sort((a, b) => a.task_days - b.task_days));

  return (
    <div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-gray-600">Task Days</th>
              <th className="px-4 py-2 text-left text-gray-600">
                Date Binding
              </th>
              <th className="px-4 py-2 text-left text-gray-600">Task Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Repeatable</th>
              <th className="px-4 py-2 text-left text-gray-600">
                Repeat Times
              </th>
              <th className="px-4 py-2 text-left text-gray-600">
                Repeat After
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <tr
                key={task.task_id + task.stage_id}
                className="border-b text-nowrap hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                onClick={() => {
                  setSelectedTask(task); // Set the selected task
                  setShowRowDrawer(true); // Open the drawer
                }}
              >
                <td className="px-4 py-3 text-center">{task.task_days}</td>
                <td className="px-4 py-3">{task.date_name}</td>
                <td className="px-4 py-3 whitespace-normal break-words">
                  {cleanText(task.task_name)}
                </td>
                <td className="px-4 py-3">
                  {task.is_repeatable ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-3">{task.frequency ?? 'N/A'}</td>
                <td className="px-4 py-3">
                  {task.interval && task.interval_type
                    ? `${task.interval} ${task.interval_type}(s)`
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RowDrawer
        showRowDrawer={showRowDrawer}
        setShowRowDrawer={setShowRowDrawer}
        setTaskToDelete={setTaskToDelete}
        setShowDeleteModal={setShowDeleteModal}
        task={selectedTask} // Pass the selected task
        dateFields={dateFields}
        onUpdate={reload}
      />
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

const RowDrawer = ({
  showRowDrawer,
  setShowRowDrawer,
  setTaskToDelete,
  setShowDeleteModal,
  task,
  dateFields,
  onUpdate,
}) => {
  const handleClose = () => {
    setShowRowDrawer(false);
  };

  const handleDeleteClick = () => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
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
                <h2 className="text-xl font-bold">Task</h2>
                <div className="flex items-center space-x-2">
                  <div title={'Delete Task'} onClick={handleDeleteClick}>
                    <TrashIcon
                      className={`w-6 h-6 text-gray-500 cursor-pointer`}
                    />
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
                dateFields={dateFields}
                onUpdate={onUpdate}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DeleteModal = ({ showDeleteModal, setShowDeleteModal, onConfirm }) => {
  const handleClose = () => {
    setShowDeleteModal(false);
  };

  const handleSubmit = () => {
    onConfirm();
    handleClose();
  };

  return (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h3 className="text-lg font-bold mb-4">Delete Task</h3>
            <div>Are you sure you want to delete the task?</div>
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
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tasks;
