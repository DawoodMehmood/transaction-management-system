import React, { useState } from 'react';
import { getServerUrl } from '../../../utility/getServerUrl';
import { showErrorToast } from '../../../toastConfig';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/outline';
import {
  formatDate,
  getDateADayAfter,
  formatDateADayBefore,
} from '../../../utility/getFormattedDate';

const RowForm = ({ closeModal, task, transactionId, onUpdate }) => {
  const [date, setDate] = useState(
    task.task_due_date ? new Date(`${task.task_due_date}T00:00:00Z`) : null
  );
  const [notes, setNotes] = useState(task.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);

  const handleSubmit = async () => {
    try {
      const formattedDate = date
        ? new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
          )
            .toISOString()
            .split('T')[0]
        : null;

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
        // showSuccessToast('Task updated successfully.');
        await onUpdate(); // Update the task list
        closeModal(); // Close the modal
      } else {
        showErrorToast('Failed to update task.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Error updating task. Please try again.');
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
          {date
            ? isUserSelected
              ? formatDateADayBefore(date)
              : formatDate(date)
            : 'Select a date'}
        </p>
        {showDatePicker && (
          <div className="absolute top-full left-0 z-10">
            <DatePicker
              selected={isUserSelected ? date : getDateADayAfter(date)}
              onChange={(newdate) => {
                setDate(newdate);
                setIsUserSelected(true); // Mark that the user manually selected a date
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
    </div>
  );
};

export default RowForm;
