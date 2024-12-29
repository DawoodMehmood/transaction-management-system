import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getServerUrl } from '../../../utility/getServerUrl';
import { showSuccessToast } from '../../../toastConfig';

const DateFields = ({ transactionId, createdBy, state, stageId }) => {
  console.log('Date content', transactionId, createdBy, state, stageId);
  const [dateFields, setDateFields] = useState([]); // Static date fields
  const [transactionDates, setTransactionDates] = useState([]); // Transaction-specific dates
  const [selectedDates, setSelectedDates] = useState([]); // User-selected dates
  const [openPickerIndex, setOpenPickerIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch static date fields
  const fetchAllDateFields = async () => {
    try {
      const response = await fetch(`${getServerUrl()}/api/transactions/dates`);
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
      const response = await fetch(
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
        entered_date: date.entered_date ? new Date(date.entered_date) : null,
        date_value: date.date_value ? new Date(date.date_value) : null,
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
    const updatedDates = [...selectedDates];
    updatedDates[index] = date;
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
        const formattedDate = `${selectedDate.getFullYear()}-${(
          selectedDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${selectedDate
          .getDate()
          .toString()
          .padStart(2, '0')}`;

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
    };

    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${getServerUrl()}/api/dates/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showSuccessToast('Dates added or updated successfully.');
        fetchTransactionDates(); // Refresh transaction dates
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
    if (selectedDate) return selectedDate.toLocaleDateString();

    const transactionDate = transactionDates.find(
      (date) => date.date_name == dateFields[index]?.date_name
    );
    if (transactionDate) {
      return (
        transactionDate.entered_date?.toLocaleDateString() ||
        transactionDate.date_value?.toLocaleDateString() ||
        'N/A'
      );
    }

    return 'N/A';
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
              {openPickerIndex == index && (
                <div className="absolute top-full left-0 z-10">
                  <DatePicker
                    selected={selectedDates[index]}
                    onChange={(date) => handleDateChange(date, index)}
                    inline
                    calendarClassName="custom-calendar"
                    popperPlacement="bottom"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

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
