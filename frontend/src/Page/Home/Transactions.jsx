// src/Page/Listings/Listings.jsx

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useCallback } from 'react';
import NavBar from '../../Components/NavBar.jsx';
import AddForm from './AddbuttonModal.jsx';
import DeleteForm from './DeleteButtonModal.jsx';
import BuyersSection from '../Buyers/BuyersSection.jsx';
import BuyersTable from '../Buyers/BuyersTable.jsx';
import ListingsSection from '../Listings/ListingsSection.jsx';
import ListingsTable from '../Listings/ListingsTable.jsx';
const Transactions = () => {
  const [activeTab, setActiveTab] = useState('Listing'); // Set Listing as the initial active tab
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add a piece of state that changes when we want to refresh the table
  const [refreshKey, setRefreshKey] = useState(0);

  // A function to trigger the table refresh
  const triggerRefresh = useCallback(() => {
    // Increment the refreshKey so Table re-runs its effect
    setRefreshKey((prev) => prev + 1);
  }, []);

  const tabs = ['Listing', 'Buyer', 'Referral']; // Tab items

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Listing':
        return (
          <div>
            <div className=" p-4 bg-white shadow-md rounded-lg w-[94%] mx-auto">
              <ListingsSection refreshKey={refreshKey} />
            </div>
            <div className=" pt-10 w-[94%] mx-auto overflow-x-auto overflow-y-hidden">
              <ListingsTable refreshKey={refreshKey} triggerFresh={triggerRefresh} />
            </div>
          </div>
        );
      case 'Buyer':
        return (
          <div>
            <div className=" p-4 bg-white shadow-md rounded-lg w-[94%] mx-auto">
              <BuyersSection refreshKey={refreshKey} />
            </div>
            <div className=" pt-10 w-[94%] mx-auto overflow-x-auto overflow-y-hidden">
              <BuyersTable refreshKey={refreshKey} triggerFresh={triggerRefresh} />
            </div>
          </div>
        );
      case 'Referral':
        return (
          <div className=" p-4 bg-white shadow-md rounded-lg w-[94%] mx-auto">
            <div>Nothing to show yet</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <NavBar />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-8 w-[95%] mx-auto">
        {/* Tabs Section */}
        <div className="ml-5 col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full py-2 px-4 text-center font-bold text-lg ${
                activeTab === tab
                  ? 'bg-[#F1F1F1F1] text-gray-900 shadow-lg cursor-default border-t-2 border-x-2' // Active tab style
                  : 'bg-[#dddddd] text-gray-500 shadow' // Inactive tab style
              }`}
            >
              {tab}s
            </button>
          ))}
          {/* <QuestionMarkCircleIcon className='w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer mt-3 md:mt-0 ms-3' /> */}
          <br />
        </div>

        {/* Right Side Buttons Section */}
        <div className="col-span-12 lg:col-span-4 flex justify-center lg:justify-end items-center space-x-2 mt-4 md:mt-0">
          <div className="flex items-center mb-2 space-x-2">
            <div
              className="bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-900"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </div>
            <div
              className="bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-900"
              onClick={() => setIsOpen(true)}
            >
              + Add | ▼
            </div>

            <AddModal isOpen={isOpen} setIsOpen={setIsOpen} activeTab={activeTab.toLowerCase()} />
            <DeleteModal
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              onDeleteComplete={triggerRefresh}
              activeTab={activeTab.toLowerCase()}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        {renderTabContent()}
      </div>

    </div>
  );
};
const AddModal = ({ isOpen, setIsOpen, activeTab }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="  shadow-xl cursor-default"
          >
            <AddForm closeModal={() => setIsOpen(false)} transactionType={activeTab} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const DeleteModal = ({
  showDeleteModal,
  setShowDeleteModal,
  onDeleteComplete,
  activeTab
}) => {
  const handleClose = () => {
    setShowDeleteModal(false);
    // After closing the modal, call onDeleteComplete to refresh table
    onDeleteComplete();
  };

  return (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="  shadow-xl cursor-default"
          >
            <DeleteForm closeModal={handleClose} transactionType={activeTab} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Transactions;
