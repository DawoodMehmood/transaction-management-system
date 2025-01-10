import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { getServerUrl } from '../../utility/getServerUrl';
import { getFormattedPrice } from '../../utility/getFormattedPrice';
import { showSuccessToast } from '../../toastConfig';

const Toolbar = ({ onSearch, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="grid grid-cols-12 gap-4 border-border-1 justify-between p-2 items-center">
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

const TableWithToolbar = ({ refreshKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${getServerUrl()}/api/transactions`);
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
        return 'Pre Listing';
      case 2:
        return 'Active Listing';
      case 3:
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
      },
    });
  };
  const handleDateChange = (date, index) => {
    const updatedTransactions = [...filteredData];
    updatedTransactions[index].expectedClose = date;
    setFilteredData(updatedTransactions);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className=" bg-white">
        <Toolbar onSearch={handleSearch} onRefresh={fetchTransactions} />
      </div>
      <div className="h-96 border border-1  bg-white mb-10 overflow-x-auto lg:overflow-x-hidden overflow-y-auto custom-scrollbar">
        <div className=" ">
          <motion.table
            className="min-w-full table-auto  shadow-lg rounded-lg"
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
                  whileHover={{ scale: 1.02 }}
                  className="border-b text-nowrap hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 text-gray-600">
                    {row.address1} {row.address2} {row.city} {row.state}
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500 hover:text-gray-900"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10m-10 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <input
                      type="date"
                      className="hidden"
                      id={`date-picker-${index}`}
                      onChange={(e) => handleDateChange(e.target.value, index)}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    ${getFormattedPrice(row.list_price)}
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
