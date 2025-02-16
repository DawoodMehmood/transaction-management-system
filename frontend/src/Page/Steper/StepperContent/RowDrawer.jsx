import React, { useState } from 'react';
import { getServerUrl } from '../../../utility/getServerUrl';
import { TrashIcon } from '@heroicons/react/outline';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/outline';
import { formatDate } from '../../../utility/getFormattedDate';

const RowDrawer = ({
  closeModal,
  task,
  transactionId,
  onUpdate,
  onDelete,
  reloadTasks,
}) => {
  const [date, setDate] = useState(
    task.task_due_date ? new Date(`${task.task_due_date}T00:00:00Z`) : null
  );
  const [notes, setNotes] = useState(task.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completionReason, setCompletionReason] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loadingTransactionDetailId, setLoadingTransactionDetailId] =
    useState(null);
  const [showTaskCompletedPopup, setShowTaskCompletedPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDate = date ? date.toISOString().split('T')[0] : null;

      const response = await fetch(
        `${getServerUrl()}/api/transactions/${task.transaction_detail_id}/task`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            stage_id: task.stage_id,
            notes: notes,
            task_due_date: formattedDate,
          }),
        }
      );

      if (response.ok) {
        await onUpdate(task);
        await reloadTasks();
        closeModal();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Handle task completion with reason
  const handleCompleteTask = async () => {
    if (!completionReason.trim()) return;

    if (loadingTransactionDetailId === task.transaction_detail_id) return;

    setLoadingTransactionDetailId(task.transaction_detail_id);

    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/${
          task.transaction_detail_id
        }/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            task_status: 'Completed',
            stage_id: task.stage_id,
            completion_reason: completionReason,
            task_description: `${task.task_description}\n<span class="text-xs text-gray-500 mt-1 block">Completion Reason: ${completionReason}</span>`, // Add reason as styled text below task
          }),
        }
      );

      if (response.ok) {
        setShowCompletionModal(false);
        setShowTaskCompletedPopup(true);

        setTimeout(() => {
          setShowTaskCompletedPopup(false);
          closeModal();
          reloadTasks();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoadingTransactionDetailId(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white">
      <div className="font-medium mb-2">Notes</div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border-2 rounded p-2 focus:outline-none"
        rows="4"
        placeholder="Enter notes here..."
        required
      ></textarea>

      <div className="font-medium mb-2">Due Date</div>
      <div className="border rounded-lg p-2 flex items-center relative">
        <CalendarIcon
          className="w-5 h-5 cursor-pointer"
          onClick={() => setShowDatePicker(true)}
        />
        <p
          className="font-normal text-lg ms-4 cursor-pointer"
          onClick={() => setShowDatePicker(true)}
        >
          {date ? formatDate(date) : 'Select a date'}
        </p>
        {showDatePicker && (
          <div className="absolute top-full left-0 z-10">
            <DatePicker
              selected={date}
              onChange={(newDate) => {
                setDate(newDate);
                setShowDatePicker(false);
              }}
              inline
              calendarClassName="custom-calendar"
              popperPlacement="bottom"
              onClickOutside={() => setShowDatePicker(false)}
            />
          </div>
        )}
      </div>

      {/* Complete Task button with star icon */}
      <div className="flex items-center mt-4">
        <button
          onClick={() => setShowCompletionModal(true)}
          className="p-2 hover:bg-yellow-200 rounded-full cursor-pointer"
        >
          <TrashIcon className="w-6 h-6 text-gray-700 hover:text-yellow-500" />
        </button>
        <span className="ml-2 text-lg"></span>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
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

      {/* Completion Reason Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Reason for Skipping Task
            </h2>
            <textarea
              value={completionReason}
              onChange={(e) => setCompletionReason(e.target.value)}
              className="w-full border-2 rounded p-2 focus:outline-none"
              rows="4"
              placeholder="Enter reason for skipping..."
              required
            ></textarea>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
                onClick={() => setShowCompletionModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCompleteTask}
                disabled={!completionReason.trim()}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Completed Popup with Reason */}
      {showTaskCompletedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">
              Task is Skipped with the reason: {completionReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RowDrawer;
