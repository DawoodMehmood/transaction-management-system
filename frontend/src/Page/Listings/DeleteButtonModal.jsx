import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

const DeleteTransactionForm = ({ closeModal }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch(`${getServerUrl()}/api/transactions`);
        const data = await response.json();

        const mappedData = data.transactions.map((transaction) => {
          const address1 = transaction.address1 || ''; // Set empty string if null/undefined
          const address2 = transaction.address2 || ''; // Set empty string if null/undefined
          const city = transaction.city || ''; // Set empty string if null/undefined
          const state = transaction.state || ''; // Set empty string if null/undefined

          // Combine the parts into fullAddress, excluding any empty parts
          const fullAddress =
            `${address1} ${address2}, ${city}, ${state}`.trim();
          return {
            transaction_id: transaction.transaction_id,
            fullAddress: fullAddress, // Save full address in one variable
            first_name: transaction.first_name,
            last_name: transaction.last_name,
          };
        });

        setTransactions(mappedData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        showErrorToast('Error fetching transactions.');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchTransactions();
  }, []);

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(transactionId)) {
        return prev.filter((id) => id !== transactionId); // Remove if already selected
      } else {
        return [...prev, transactionId]; // Add if not already selected
      }
    });
  };

  const handleDelete = async () => {
    if (selectedTransactions.length === 0) {
      showErrorToast('No transactions selected for deletion.');
      return;
    }

    try {
      const response = await fetch(
        `${getServerUrl()}/api/transactions/bulk-delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transaction_ids: selectedTransactions }), // Send IDs
        }
      );

      if (response.ok) {
        showSuccessToast('Transactions deleted successfully.');
        // Update UI: Remove deleted transactions from state
        setTransactions((prev) =>
          prev.filter(
            (transaction) =>
              !selectedTransactions.includes(transaction.transaction_id)
          )
        );
        setSelectedTransactions([]); // Clear selected transactions
        closeModal(); // Close the modal
      } else {
        showErrorToast('Failed to delete transactions.');
      }
    } catch (error) {
      console.error('Error deleting transactions:', error);
      showErrorToast('Error deleting transactions. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[700px]">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Delete Transactions
      </h2>

      <div className="h-[50vh] border border-1  bg-white mb-10 overflow-x-auto lg:overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-600 font-semibold text-lg">
              Loading transactions...
            </span>
          </div>
        ) : (
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-white text-nowrap">
                <th></th>
                <th className="px-4 py-2 text-left text-gray-700">
                  Transaction Name
                </th>
                <th className="px-4 py-2 text-left text-gray-700">Lead</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row, index) => (
                <tr
                  key={index}
                  className="border-b text-nowrap hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-2 px-4 border-b">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(
                          row.transaction_id
                        )}
                        onChange={() =>
                          handleCheckboxChange(row.transaction_id)
                        }
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </label>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{row.fullAddress}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {row.first_name} {row.last_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={selectedTransactions.length === 0}
        className="w-full bg-gray-700 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
      >
        Delete
      </button>
      <button
        onClick={closeModal}
        className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default DeleteTransactionForm;
