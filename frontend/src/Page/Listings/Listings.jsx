// src/Page/Listings/Listings.jsx

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import NavBar from '../../Components/NavBar';
import Modal from './AddbuttonModal.jsx';
import ListingsSection from './ListingsSection.jsx';
import Table from './Table.jsx';
const Listings = () => {
  const [activeTab, setActiveTab] = useState('Listing'); // Set Listing as the initial active tab

  const tabs = ['Listing']; // Tab items

  const renderTabContent = () => {
    switch (activeTab) {
      // case 'All':
      //   return (
      //     <div>
      //       {' '}
      //       <div>
      //         <ListingsSection />
      //       </div>
      //     </div>
      //   );
      // case 'Purchase':
      //   return (
      //     <div>
      //       <div>
      //         <ListingsSection />
      //       </div>
      //     </div>
      //   );
      case 'Listing':
        return (
          <div>
            <ListingsSection />
          </div>
        );
      // case 'Lease':
      //   return (
      //     <div>
      //       <div>
      //         <ListingsSection />
      //       </div>
      //     </div>
      //   );
      // case 'Referals':
      //   return (
      //     <div>
      //       <div>
      //         <ListingsSection />
      //       </div>
      //     </div>
      //   );
      // case 'Other':
      //   return (
      //     <div>
      //       <div>
      //         <ListingsSection />
      //       </div>
      //     </div>
      //   );
      default:
        return null;
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <NavBar />

      <div className='grid grid-cols-1 md:grid-cols-12 gap-4 mt-8 w-[95%] mx-auto'>
        {/* Tabs Section */}
        <div className='col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full rounded-lg overflow-x-auto'>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full py-2 px-4 text-center font-bold text-lg ${
                activeTab === tab
                  ? 'bg-[#F1F1F1F1] text-gray-900 shadow-lg' // Active tab style
                  : 'bg-[#dddddd] text-gray-600 shadow' // Inactive tab style
              }`}
            >
              {tab}
            </button>
          ))}
          {/* <QuestionMarkCircleIcon className='w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer mt-3 md:mt-0 ms-3' /> */}
          <br />
        </div>

        {/* Right Side Buttons Section */}
        <div className='col-span-12 lg:col-span-4 flex justify-center lg:justify-end items-center space-x-2 mt-4 md:mt-0'>
          <div className='flex items-center mb-2 space-x-2'>
            <div
              className='bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-900'
              onClick={() => setIsOpen(true)}
            >
              + Add | ▼
            </div>

            <SpringModal isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* <div className='flex flex-col space-y-1'>
              <img src='/burger.svg' className='h-10 w-10' alt='Menu icon' />
            </div>
            <div className='bg-transparent text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#9094A5]'>
              <img src='/layout.svg' className='h-10 w-10' alt='Layout icon' />
            </div> */}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className=' p-4 bg-white shadow-md rounded-lg w-[94%] mx-auto'>
        {renderTabContent()}
      </div>

      <div className=' pt-10 w-[94%] mx-auto overflow-x-auto overflow-y-hidden'>
        <Table />
      </div>
    </div>
  );
};
const SpringModal = ({ isOpen, setIsOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className='bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer'
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={e => e.stopPropagation()}
            className='  shadow-xl cursor-default'
          >
            <Modal closeModal={() => setIsOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Listings;
