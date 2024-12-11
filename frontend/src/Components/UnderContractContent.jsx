import React from 'react';

export const UnderContractContent = () => {
  const tasks = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun',
  ];

  return (
    <div className='overflow-x-auto w-full'>
      <table className='w-full border border-gray-200 '>
        <thead>
          <tr className=' border-b'>
            <th className='px-4 py-2 text-left text-gray-600'>Task</th>
            <th className='px-4 py-2 text-left text-gray-600'>Assignee</th>
            <th className='px-4 py-2 text-left text-gray-600'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr
              key={index}
              className='border-b hover:bg-gray-50 transition duration-150 ease-in-out'
            >
              {/* Task column */}
              <td className='px-4 py-3 flex items-center'>
                <input type='checkbox' className='mr-2' />
                <span className='first text-nowrap'>{task}</span>
              </td>
              {/* Assignee column */}
              <td className='px-4 py-3'>
                <div className='flex items-center'>
                  <span className='bg-[#E0E0E0] text-white px-2 py-1 rounded-full text-sm font-bold mr-2'>
                    KK
                  </span>
                  <p className='text-gray-800 text-nowrap'>Kari Kohler</p>
                </div>
              </td>
              {/* Action column */}
              <td className='px-4 py-3 text-right flex justify-start items-center'>
                <p className='font-normal text-red-400 me-4 text-nowrap'>
                  12 Sep
                </p>

                <img
                  src='/right-arrow-backup-2-svgrepo-com.svg'
                  className='w-5 h-5 inline-block'
                  alt='arrow'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnderContractContent;
