import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { getServerUrl } from '../../utility/getServerUrl';
import { getFormattedPrice } from '../../utility/getFormattedPrice';
import { showErrorToast, showSuccessToast } from '../../toastConfig';
import { PencilIcon, XIcon, CheckIcon } from '@heroicons/react/solid';
import { CalendarIcon } from '@heroicons/react/outline';
import { apiFetch } from '../../utility/apiFetch';

const Toolbar = ({ onSearch, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="grid grid-cols-12 gap-4 border-border-1 justify-between p-5 items-center">
      {/* Search input */}
      <div className="col-span-12 md:col-span-5">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-gray-700"
          placeholder="Search by Transaction, Address, Lead, Note"
        />
      </div>
      <div className="col-span-3 md:col-span-3"></div>
      <div className="col-span-12 md:col-span-4">
        <div className="col-span-6 sm:col-span-6 relative">
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2  focus:border-gray-700">
            <option>Expected Close/Closed Date</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const TableWithToolbar = ({ refreshKey, triggerFresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceEdits, setPriceEdits] = useState({});
  const itemsPerPage = 10;
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const fetchTransactions = async () => {
    try {
      const response = await apiFetch(`${getServerUrl()}/api/transactions?transaction_type=buyer`);
      const data = await response.json();
      // showSuccessToast(data.message);

      const mappedData = data.transactions.map((transaction) => {
        const address1 = transaction.address1 || ''; // Set empty string if null/undefined
        const address2 = transaction.address2 || ''; // Set empty string if null/undefined
        const city = transaction.city || ''; // Set empty string if null/undefined
        const state = transaction.state || ''; // Set empty string if null/undefined

        // Combine the parts into fullAddress, excluding any empty parts
        const fullAddress = `${address1} ${address2}, ${city}, ${state}`.trim();
        return {
          transaction_id: transaction.transaction_id,
          state_id: transaction.state,
          address1: transaction.address1,
          address2: transaction.address2,
          city: transaction.city,
          state: transaction.state,
          fullAddress: fullAddress, // Save full address in one variable
          created_by: transaction.created_by,
          first_name: transaction.first_name,
          last_name: transaction.last_name,
          total_tasks: transaction.total_tasks,
          completed_tasks: transaction.completed_tasks,
          task_status: transaction.task_status || 'Open',
          expectedClose: transaction.expectedClose || null,
          list_price: transaction.list_price,
          transactionOwner: transaction.transactionOwner,
          stage_id: mapStage(Number(transaction.stage_id)),
          closedDate: transaction.closedDate,
          currentStep: transaction.stage_id,
        };
      });

      setTransactions(mappedData);
      setFilteredData(mappedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  const mapStage = (stage_id) => {
    switch (stage_id) {
      case 1:
        return 'Active Buyer';
      case 2:
        return 'Under Contract';
      default:
        return '';
    }
  };

  const handleSearch = (term) => {
    const filtered = transactions.filter((row) =>
      row.state_id.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Pass fullAddress to the stepper section
  const handleRowClick = (row) => {
    navigate('/StepperSection', {
      state: {
        transactionId: row.transaction_id,
        createdBy: row.created_by,
        state: row.state,
        price: row.list_price,
        currentStep: row.currentStep,
        fullAddress: row.fullAddress, // Pass the full address here
        transactionType: 'buyer'
      },
    });
  };
  const handleDateChange = (date, index) => {
    const updatedTransactions = [...filteredData];
    updatedTransactions[index].expectedClose = date;
    setFilteredData(updatedTransactions);
  };

  // Price editing functions
  const handlePriceEditClick = (transactionId, currentPrice, e) => {
    e.stopPropagation();
    // If the price is an integer, store it without decimals, otherwise preserve the decimals.
    const formattedPrice =
      Number(currentPrice) % 1 === 0
        ? String(Number(currentPrice))
        : String(Number(currentPrice).toFixed(2));
    setPriceEdits((prev) => ({ ...prev, [transactionId]: formattedPrice }));
  };
  

  const handlePriceChange = (transactionId, value, e) => {
    e.stopPropagation();
    setPriceEdits((prev) => ({ ...prev, [transactionId]: value }));
  };

  const handlePriceCancel = (transactionId, e) => {
    if (e) e.stopPropagation();
    setPriceEdits((prev) => {
      const newEdits = { ...prev };
      delete newEdits[transactionId];
      return newEdits;
    });
  };

  const handlePriceSave = async (transactionId, e) => {
    e.stopPropagation();
    const newPrice = priceEdits[transactionId];
    const originalTransaction = filteredData.find(
      (row) => row.transaction_id === transactionId
    );
    if (!originalTransaction) return;
    // If the price hasn't changed, cancel editing
    if (Number(newPrice) === Number(originalTransaction.list_price)) {
      handlePriceCancel(transactionId);
      return;
    }
    try {
      const response = await apiFetch(
        `${getServerUrl()}/api/transactions/update-price`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, newPrice: Number(newPrice) }),
        }
      );
      if (response.ok) {
        const updatedTransactions = filteredData.map((row) => {
          if (row.transaction_id === transactionId) {
            return { ...row, list_price: Number(newPrice) };
          }
          return row;
        });
        triggerFresh()
        setFilteredData(updatedTransactions);
        handlePriceCancel(transactionId);
      } else {
        console.error('Failed to update price');
        showErrorToast('Failed to update price')
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };


  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="rounded-lg bg-white">
        <Toolbar onSearch={handleSearch} onRefresh={fetchTransactions} />
      </div>
      <div className="h-96 bg-white mb-10 shadow-md rounded-lg overflow-x-auto lg:overflow-x-hidden overflow-y-auto custom-scrollbar">
        <div className="p-5">
          <motion.table
            className="min-w-full table-auto shadow-sm rounded-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <thead>
              <tr className="bg-white text-nowrap">
                <th className="px-4 py-2 text-left text-gray-700">
                  Transaction Name
                </th>
                <th className="px-4 py-2 text-left text-gray-700">Lead</th>
                <th className="px-4 py-2 text-left text-gray-700">Task</th>
                <th className="px-4 py-2 text-left text-gray-700">Stage</th>
                {/* <th className='px-4 py-2 text-left text-gray-700'>
                  transaction
                </th> */}
                <th className="px-4 py-2 text-left text-gray-700">
                  Expected Close
                </th>
                <th className="px-4 py-2 text-left text-gray-700">Price</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((row, index) => (
                <motion.tr
                  key={index}
                  onClick={() => handleRowClick(row)} // Add row click handler
                  className="border-b text-nowrap hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 text-gray-600">
                  {row.address1}{row.address2 ? ` ${row.address2}`: ''}, {row.city}, {row.state}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {/* {row.task_status} */}
                    {row.completed_tasks}/{row.total_tasks}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{row.stage_id}</td>
                  {/* <td className='px-4 py-2 text-gray-600'>
                    {row.transaction_id}
                  </td> */}
                  <td className="px-4 py-2 text-gray-600 flex justify-start items-center">
                    {row.expectedClose ? (
                      row.expectedClose
                    ) : (
                      <span className="text-black">N/A</span>
                    )}
                    <button
                      className="ml-2 focus:outline-none"
                      onClick={() => {
                        const datePicker = document.getElementById(
                          `date-picker-${index}`
                        );
                        datePicker.click();
                      }}
                    >
                      <CalendarIcon className='size-5 text-gray-700' />
                    </button>
                    <input
                      type="date"
                      className="hidden"
                      id={`date-picker-${index}`}
                      onChange={(e) => handleDateChange(e.target.value, index)}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {priceEdits[row.transaction_id] !== undefined ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          className="border border-gray-300 rounded px-2 py-1"
                          value={priceEdits[row.transaction_id]}
                          onChange={(e) =>
                            handlePriceChange(
                              row.transaction_id,
                              e.target.value,
                              e
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                          />
                        <button
                          onClick={(e) =>
                            handlePriceCancel(row.transaction_id, e)
                          }
                          className="ml-2"
                          title="Cancel"
                        >
                          <XIcon className="size-4 text-red-600" />

                        </button>
                        <button
                          onClick={(e) =>
                            handlePriceSave(row.transaction_id, e)
                          }
                          className="ml-2"
                          title="Save"
                        >
                          <CheckIcon className='size-5 text-green-600' />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>
                          ${getFormattedPrice(row.list_price)}
                        </span>
                        <button
                          onClick={(e) =>
                            handlePriceEditClick(
                              row.transaction_id,
                              row.list_price,
                              e
                            )
                          }
                          className="ml-2"
                          title="Edit Price"
                        >
                          <PencilIcon className='size-5 text-gray-700' />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center">
        <button
          className="mx-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="mx-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableWithToolbar;
