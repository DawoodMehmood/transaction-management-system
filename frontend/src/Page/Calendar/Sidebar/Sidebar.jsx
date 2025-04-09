import React, { useState, useEffect } from 'react';
import { showErrorToast } from '../../../toastConfig';
import { getServerUrl } from '../../../utility/getServerUrl';
import { apiFetch } from '../../../utility/apiFetch';

const sidebarItems = [
  {
    title: 'My Tasks',
    subItems: [
      { name: 'All Tasks', count: 0 },
      { name: 'Today', count: 0 },
      { name: 'Overdue', count: 0 },
      { name: 'Skipped', count: 0 },
      { name: 'Finished', count: 0 },
    ],
  },
];

const Sidebar = ({
  myTasksSelectedTab,
  setMyTasksSelectedTab,
  teamTasksSelectedTab,
  setTeamTasksSelectedTab,
  setActiveSection,
  tasks,
  selectedState,
  setSelectedState,
  selectedTransactionType,
  setSelectedTransactionType
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [states, setStates] = useState([]); // List of all states (fetched from backend)

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const transactionTypeOptions = [
    { value: 'listing', label: 'Listing' },
    { value: 'buyer', label: 'Buyer' },
  ];
  
  useEffect(() => {
      const fetchStates = async () => {
        try {
          const response = await apiFetch(`${getServerUrl()}/api/states`);
          const data = await response.json();
          if (response.ok) {
            setStates(data.states);
            // Set default selected state if not already selected
          // if (!selectedState && data.states.length > 0) {
          //   setSelectedState(data.states[0].state);
          // }
          } else {
            throw new Error(data.error || 'Failed to fetch states');
          }
        } catch (error) {
          showErrorToast(error.message);
        }
      };
  
      fetchStates();
    }, []);
    
      // Set default transaction type if not already set
  // useEffect(() => {
  //   if (!selectedTransactionType && transactionTypeOptions.length > 0) {
  //     setSelectedTransactionType(transactionTypeOptions[0].value);
  //   }
  // }, [selectedTransactionType, setSelectedTransactionType]);

  // Calculate counts for each task category based on "Opened" status
  const counts = {
    alltasks: tasks.filter(
      (task) => task.taskStatus === 'Open' && task.enteredDate && task.taskIsSkipped === false
    ).length,
    skipped: tasks.filter(
      (task) => task.taskStatus === 'Open' && task.enteredDate && task.taskIsSkipped === true
    ).length,
    today: tasks.filter((task) => {
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate && task.taskIsSkipped === false &&
        task.enteredDate.getDate() === now.getDate() && task.enteredDate.getMonth() === now.getMonth() && task.enteredDate.getFullYear() === now.getFullYear()
      );
    }).length,
    thisWeek: tasks.filter((task) => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(
        now.setDate(now.getDate() + (6 - now.getDay()))
      );
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate >= startOfWeek &&
        task.enteredDate <= endOfWeek && task.taskIsSkipped === false
      );
    }).length,
    thisMonth: tasks.filter((task) => {
      const now = new Date();
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate.getMonth() === now.getMonth() &&
        task.enteredDate.getFullYear() === now.getFullYear() && task.taskIsSkipped === false
      );
    }).length,
    overdue: tasks.filter((task) => {
      const now = new Date();
      const oneDayAndSixHoursAgo = new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000
      ); // 1 day and 6 hours ago
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate <= oneDayAndSixHoursAgo && task.taskIsSkipped === false
      );
    }).length,
    finished: tasks.filter((task) => task.taskStatus === 'Completed' && task.taskIsSkipped === false).length,
  };

  return (
    <>
      <button
        className={`m-2 md:hidden fixed top-30 left-4 z-30 p-2 bg-gray-700 text-white rounded-lg px-6 focus:outline-none ${
          isOpen ? 'ms-32 mt-4 top-0' : ' left-0'
        } `}
        onClick={toggleSidebar}
      >
        {isOpen ? '←' : '→'}
      </button>
        
      <div
        className={`bg-gray-700 md:min-h-[90vh] text-gray-300 p-4 z-40 transition-transform duration-300 ${
          isOpen
            ? 'translate-x-0 fixed top-0 left-0 '
            : '-translate-x-full h-0 md:h-full'
        } md:translate-x-0 md:w-100`}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            State *
          </label>
          <select
            id="states"
            className="w-full p-1 border border-gray-300 text-gray-600  rounded-md"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>

            {states.map((stateObj) => (
              <option key={stateObj.state} value={stateObj.state}>
                {stateObj.state_name}
              </option>
            ))}
          </select>
        </div>

      <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Transaction Type *
          </label>
          <select
            id="states"
            className="w-full p-1 border border-gray-300 text-gray-600 rounded-md"
            value={selectedTransactionType}
            onChange={(e) => setSelectedTransactionType(e.target.value)}
          >
            <option value="">Both</option>

            {transactionTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          </select>
        </div>
        
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="font-bold text-white uppercase">{section.title}</h3>
            <ul className="mt-2 mb-6">
              {section.subItems.map((item, idx) => {
                const isSelected =
                  section.title === 'My Tasks'
                    ? myTasksSelectedTab === item.name
                    : teamTasksSelectedTab === item.name;

                // Get the count for the current item
                const count =
                  counts[item.name.toLowerCase().replace(/ /g, '')] || 0;

                return (
                  <li
                    key={idx}
                    onClick={() => {
                      setActiveSection(section.title);
                      if (section.title === 'My Tasks') {
                        setMyTasksSelectedTab(item.name);
                      } else {
                        setTeamTasksSelectedTab(item.name);
                      }
                    }}
                    className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${
                      isSelected ? 'bg-[#E0E0E0] text-[#9094A5]' : ''
                    }`}
                  >
                    {item.name}
                    <span className="text-gray-400">{count}</span>
                  </li>
                );
              })}

              {/* Display counts for This Week and This Month directly */}
              <li
                className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${
                  myTasksSelectedTab === 'This Week'
                    ? 'bg-[#E0E0E0] text-[#9094A5]'
                    : ''
                }`}
                onClick={() => {
                  setActiveSection(section.title);
                  setMyTasksSelectedTab('This Week');
                }}
              >
                This Week
                <span className="text-gray-400">{counts.thisWeek}</span>
              </li>
              <li
                className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${
                  myTasksSelectedTab === 'This Month'
                    ? 'bg-[#E0E0E0] text-[#9094A5]'
                    : ''
                }`}
                onClick={() => {
                  setActiveSection(section.title);
                  setMyTasksSelectedTab('This Month');
                }}
              >
                This Month
                <span className="text-gray-400">{counts.thisMonth}</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
