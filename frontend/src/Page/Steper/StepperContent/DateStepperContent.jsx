import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getServerUrl } from '../../../utility/getServerUrl';
import { showWarningToast } from '../../../toastConfig';
import {
  formatDate,
  getDateADayAfter,
} from '../../../utility/getFormattedDate';
import { XIcon } from '@heroicons/react/outline';
import { apiFetch } from '../../../utility/apiFetch';

const DateFields = ({ transactionId, createdBy, state, stageId, transactionType }) => {
  const [dateFields, setDateFields] = useState([]); // Static date fields
  const [transactionDates, setTransactionDates] = useState([]); // Transaction-specific dates
  const [selectedDates, setSelectedDates] = useState([]); // User-selected dates
  const [openPickerIndex, setOpenPickerIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch static date fields
  const fetchAllDateFields = async () => {
    try {
      const response = await apiFetch(`${getServerUrl()}/api/transactions/dates?state=${state}&transaction_type=${transactionType}`);
      if (!response.ok) throw new Error('Failed to fetch date fields.');
      const data = await response.json();
      setDateFields(data);
    } catch (error) {
      console.error('Error fetching date fields:', error);
      setErrorMessage('Failed to fetch date fields. Please try again later.');
    }
  };

  // Fetch transaction-specific dates
  const fetchTransactionDates = async () => {
    try {
      const response = await apiFetch(
        `${getServerUrl()}/api/dates/${transactionId}/${stageId}`
      );
      if (!response.ok) {
        // If response is not okay, set an empty array and avoid an error.
        console.warn('No dates found for the transaction and stage.');
        setTransactionDates([]); // Set empty array for dates
        return; // Exit early
      }

      const data = await response.json();

      const formattedDates = data.dates.map((date) => ({
        ...date,
        entered_date: date.entered_date
          ? new Date(`${date.entered_date}T00:00:00Z`) // Treat as UTC
          : null,
      }));

      setTransactionDates(formattedDates);
    } catch (error) {
      console.error('Error fetching transaction dates:', error);
      setErrorMessage('Failed to fetch transaction dates. Please try again.');
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllDateFields();
    fetchTransactionDates();
  }, [transactionId, stageId]);

  // Handle date selection
  const handleDateChange = (date, index) => {
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const updatedDates = [...selectedDates];
    updatedDates[index] = utcDate; // Store as Date object
    setSelectedDates(updatedDates);
    setOpenPickerIndex(null);
  };

  // Add or update dates for the transaction
  const handleAddDates = async () => {
    const datesToAdd = dateFields
      .map((field, index) => {
        const selectedDate = selectedDates[index];
        if (!selectedDate) return null;

        // Convert to YYYY-MM-DD format (date only, no time zone influence)
        // const formattedDate = `${selectedDate.getFullYear()}-${(
        //   selectedDate.getMonth() + 1
        // )
        //   .toString()
        //   .padStart(2, '0')}-${selectedDate
        //   .getDate()
        //   .toString()
        //   .padStart(2, '0')}`;
        console.log('selectedDate', selectedDate);

        // const formattedDate = new Date(
        //   Date.UTC(
        //     selectedDate.getFullYear(),
        //     selectedDate.getMonth(),
        //     selectedDate.getDate()
        //   )
        // )
        //   .toISOString()
        //   .split('T')[0]; // Extract only the date part (YYYY-MM-DD)
        const formattedDate = formatDate(selectedDate);
        return {
          date_id: field.date_id,
          date_name: field.date_name,
          date_value: formattedDate, // Send date only
        };
      })
      .filter((item) => item); // Remove null values

    const body = {
      created_by: createdBy,
      transaction_id: transactionId,
      state_id: state,
      stage_id: stageId,
      dates: datesToAdd,
      transaction_type: transactionType
    };

    setErrorMessage('');
    if (datesToAdd.length === 0) {
      showWarningToast('Please change at least one date before submitting.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiFetch(`${getServerUrl()}/api/dates/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // showSuccessToast('Dates added or updated successfully.');
        fetchTransactionDates(); // Refresh transaction dates
        setSelectedDates([]);
      } else {
        throw new Error('Failed to add or update dates.');
      }
    } catch (error) {
      console.error('Error adding dates:', error);
      setErrorMessage('Failed to add dates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get the displayed date for each field
  const getDisplayedDate = (index) => {
    const selectedDate = selectedDates[index];
    if (selectedDate) return formatDate(selectedDate);

    const transactionDate = transactionDates.find(
      (date) => date.date_name == dateFields[index]?.date_name
    );
    if (transactionDate?.entered_date) {
      return formatDate(transactionDate.entered_date);
    }

    return 'N/A';
  };
  
    // Get the base date from the transaction dates (if any) for a given field.
    const getBaseDate = (index) => {
      const transactionDate = transactionDates.find(
        (date) => date.date_name === dateFields[index]?.date_name
      );
      return transactionDate?.entered_date ? new Date(transactionDate.entered_date) : null;
    };
  
    // Check if the date has been modified (unsaved change)
    const hasUnsavedChange = (index) => {
      const newDate = selectedDates[index];
      const baseDate = getBaseDate(index);
  
      if (!newDate) return false; // No new date selected
      if (!baseDate) return true; // No original date, so any selection is new
  
      return formatDate(newDate) !== formatDate(baseDate);
    };
  
    // Revert the date back to its base (saved) value or clear if no base exists.
    const handleRevert = (index) => {
      const baseDate = getBaseDate(index);
      const updatedDates = [...selectedDates];
      updatedDates[index] = baseDate; // If baseDate is null, it will revert to N/A.
      setSelectedDates(updatedDates);
    };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        {stageId == 1
          ? 'Pre-Listing'
          : stageId == 2
          ? 'Active Listing'
          : stageId == 3
          ? 'Under Contract'
          : `Stage Information`}
      </h2>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex justify-center items-center">
          <div className="w-8 h-8 border-t-4 border-gray-200 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 text-red-600 font-semibold">{errorMessage}</div>
      )}

      {dateFields.map((field, index) => (
        <div className="grid grid-cols-12 gap-4 mb-4" key={field.date_id}>
          <div className="col-span-12 md:col-span-3 p-4">
            <p>{field.date_name}</p>
          </div>
          <div className="col-span-12 md:col-span-9 p-4">
            <div className="border rounded-lg p-2 flex items-center relative">
              <img
                src="/calender-svgrepo-com.svg"
                className="w-4 h-4 cursor-pointer"
                alt="Calendar Icon"
                onClick={() => setOpenPickerIndex(index)}
                style={{ touchAction: 'manipulation' }}
              />
              <p className="font-normal text-lg ms-4">
                {getDisplayedDate(index)}
              </p>
              
               {/* Render the cross only if the date has been changed and not yet saved */}
               {hasUnsavedChange(index) && (
                <button
                  onClick={() => handleRevert(index)}
                  className="cursor-pointer ml-2 text-gray-500 text-xl font-bold"
                  title="Revert to previous date"
                >
                  <XIcon className="size-4" />
                </button>
              )}
              {openPickerIndex == index && (
                <div className="absolute top-full left-0 z-10">
                  <DatePicker
                    selected={getDateADayAfter(selectedDates[index])}
                    onChange={(date) => handleDateChange(date, index)}
                    inline
                    calendarClassName="custom-calendar"
                    popperPlacement="bottom"
                    onClickOutside={() => setOpenPickerIndex(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        )
)}

      <div className="flex justify-center">
        <button
          onClick={handleAddDates}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg mt-4"
          disabled={isLoading}
        >
          {isLoading ? 'Adding Dates...' : 'Add Dates'}
        </button>
      </div>
    </div>
  );
};

export default DateFields;
