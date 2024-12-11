// src/components/TopNav.jsx
import { useState } from 'react';

const TopNav = () => {
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);
  const [isTaskOriginOpen, setIsTaskOriginOpen] = useState(false);

  const toggleLeadDropdown = () => setIsLeadOpen(!isLeadOpen);
  const togglePipelineDropdown = () => setIsPipelineOpen(!isPipelineOpen);
  const toggleTaskOriginDropdown = () => setIsTaskOriginOpen(!isTaskOriginOpen);

  return (
    <div className='bg-[#E0E0E0]'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-4 py-3 px-5'>
        <div className='col-span-12 md:col-span-3'>
          <div className='grid grid-cols-1 bg-gray-700 p-2 rounded-lg'>
            {/* <button className='col-span-1 font-semibold shadow-lg bg-white rounded-lg text-[#9094A5] p-2'>
              Calendar
            </button> */}
            <div className='text-center'>
              <button className=' font-semibold bg-transparent text-white py-2 '>
                Task
              </button>
            </div>
            {/* <button className='col-span-1 font-semibold py-2 px-4 text-white'>
              Showing
            </button> */}
          </div>
        </div>
        {/* <div className='col-span-12 md:col-span-2 md:col-start-11'>
          <div className='bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer text-center'>
            + Add | ▼
          </div>
        </div> */}
      </div>

      {/* <div className='flex flex-col md:flex-row ms-5 mt-5 border px-5 py-3 bg-white space-y-4 md:space-y-0 md:space-x-4'>
        <div className='relative inline-block w-full md:w-auto'>
          <button
            className='bg-transparent border-r p-2 rounded w-full md:w-auto'
            onClick={toggleLeadDropdown}
          >
            Task Type
          </button>
          {isLeadOpen && (
            <ul className='absolute left-0 mt-2 w-full md:w-auto bg-white border rounded shadow-lg z-10'>
              <li className='flex items-center p-2'>
                <input type='checkbox' className='me-4' /> All
              </li>
              <li className='flex items-center p-2'>
                <input type='checkbox' className='me-4' /> New Leads
              </li>
            </ul>
          )}
        </div>

        <div className='relative inline-block w-full md:w-auto'>
          <button
            className='bg-transparent border-r p-2 rounded w-full md:w-auto'
            onClick={togglePipelineDropdown}
          >
            Select Pipeline
          </button>
          {isPipelineOpen && (
            <ul className='absolute left-0 mt-2 w-full md:w-auto bg-white border rounded shadow-lg z-10'>
              <li className='flex items-center p-2'>Pipeline 1</li>
            </ul>
          )}
        </div>

        <div className='relative inline-block w-full md:w-auto'>
          <button
            className='bg-transparent p-2 rounded w-full md:w-auto'
            onClick={toggleTaskOriginDropdown}
          >
            Select Task Origin
          </button>
          {isTaskOriginOpen && (
            <ul className='absolute left-0 mt-2 w-full md:w-auto bg-white border rounded shadow-lg z-10'>
              <li className='flex items-center p-2'>Added Manually</li>
            </ul>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default TopNav;
