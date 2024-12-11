import React, { useState } from 'react';

// The imported AssigneeSelector component from the previous design
const AssigneeSelector = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const leadAssignee = {
    name: 'Squashed',
    role: 'Agent',
    image:
      'https://images.unsplash.com/photo-1440589473619-3cde28941638?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    selected: true,
  };

  const agents = [
    {
      name: 'Gargantuan',
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      selected: false,
    },
    {
      name: 'Sutton',
      image:
        'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      selected: false,
    },
    {
      name: 'Jumpy',
      image:
        'https://plus.unsplash.com/premium_photo-1682096343183-33dc522090ca?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      selected: false,
    },
  ];

  // Filtering the agents list based on the search term
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='w-full sm:w-full md:w-64 bg-white p-4 rounded-lg shadow-lg'>
      {/* Search Box */}
      <input
        type='text'
        placeholder='Search'
        className='w-full p-2 mb-4 border border-gray-300 rounded text-xs sm:text-sm md:text-base'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {/* Lead Assignee Section */}
      <div className='mb-4'>
        <h3 className='text-gray-600 font-semibold text-xs sm:text-sm mb-1'>
          Lead Assignee
        </h3>
        <div className='flex items-center justify-between p-2 rounded hover:bg-gray-100'>
          <div className='flex items-center'>
            <img
              src={leadAssignee.image}
              alt={leadAssignee.name}
              className='w-6 h-6 md:w-8 md:h-8 rounded-full object-cover'
            />

            <span className='text-[#9094A5] ml-2 text-xs sm:text-sm md:ml-4 font-medium'>
              {leadAssignee.name}
            </span>
            <span className='ml-1 md:ml-2 text-xs bg-gray-100 text-[#9094A5] px-1 py-0.5 rounded-full'>
              {leadAssignee.role}
            </span>
          </div>
          {leadAssignee.selected && (
            <svg
              className='w-4 h-4 md:w-5 md:h-5 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 13l4 4L19 7'
              ></path>
            </svg>
          )}
        </div>
      </div>

      {/* Agents Section */}
      <div>
        <h3 className='text-gray-600 font-semibold text-xs sm:text-sm mb-1'>
          Agents
        </h3>
        {filteredAgents.map((agent, index) => (
          <div
            key={index}
            className='flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer'
          >
            <img
              src={agent.image}
              alt={agent.name}
              className='w-6 h-6 md:w-8 md:h-8 rounded-full mr-2'
            />
            <span className='text-gray-800 text-xs sm:text-sm'>
              {agent.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssigneeSelector;
