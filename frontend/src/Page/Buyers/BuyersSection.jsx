import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../../utility/getServerUrl';
import { getFormattedPrice } from '../../utility/getFormattedPrice';
import { apiFetch } from '../../utility/apiFetch';

const ListingsSection = ({ refreshKey }) => {
  const [data, setData] = useState([
    { title: 'All Transactions', transaction_count: 0, amount: '$0' },
    { title: 'Active Buyer', transaction_count: 0, amount: '$0' },
    { title: 'Under Contract', transaction_count: 0, amount: '$0' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetching price summary from API
  useEffect(() => {
    const fetchPriceSummary = async () => {
      try {
        const response = await apiFetch(
          `${getServerUrl()}/api/transactions/price-summary?transaction_type=buyer`
        );

        const result = await response.json();
        console.log(result);

        if (response.ok) {
          // Update "All Transactions" with total price and count
          const allTransactions = {
            ...data[0],
            amount: `$${getFormattedPrice(result.total_price)}`,
            transaction_count: result.total_transaction_count,
          };

          // Update other stages with stage-wise data
          const updatedData = data.map((item, index) => {
            if (index === 0) {
              return allTransactions;
            }

            const stagePrice = result.stage_wise_prices.find(
              (stage) => stage.stage_id === index.toString()
            );

            return {
              ...item,
              amount: stagePrice
                ? `$${getFormattedPrice(stagePrice.stage_total_price)}`
                : '$0',
              transaction_count: stagePrice ? stagePrice.transaction_count : 0,
            };
          });

          // Set the updated data
          setData(updatedData);
        } else {
          console.error('Error fetching the price summary:', result.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceSummary();
  }, [refreshKey]);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between w-full flex-wrap items-center mb-4">
        <div className="flex items-center">
          <p className="font-semibold text-sm text-gray-700">Volume</p>
          <img src="/down.svg" className="w-5 ml-2 mt-2 h-5" alt="dropdown" />
        </div>
      </div>

      {/* Transaction Section - Responsive Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mt-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          data.map((item, index) => (
            <div
              key={item.title}
              className={`text-start ${
                index === 0 ? 'text-gray-700' : 'text-gray-400'
              }`} // First item highlighted in gray
            >
              <div className="flex justify-start items-center space-x-2">
                <p
                  className={`font-semibold text-sm ${
                    index === 0 ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {item.title}
                </p>
                <span className="text-sm text-gray-400">
                  ({item.transaction_count})
                </span>
              </div>
              <div className="my-2">
                <p
                  className={`font-bold text-2xl ${
                    index === 0 ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {item.amount}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListingsSection;
