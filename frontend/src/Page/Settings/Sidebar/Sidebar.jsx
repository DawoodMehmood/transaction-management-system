import React, { useState, useEffect } from 'react';
import { showErrorToast } from '../../../toastConfig';
import { getServerUrl } from '../../../utility/getServerUrl';
import { apiFetch } from '../../../utility/apiFetch';


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
  setSelectedTransactionType,
  selectedStageId,
  setSelectedStageId,
  availableStages
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

  return (
    <>
      <div
        className={`bg-gray-700 md:min-h-[90vh] text-gray-300 p-4 z-40 transition-transform duration-300 ${isOpen
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
            <option value="">Select Type</option>

            {transactionTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          </select>
        </div>
        <div className="mb-4">
          <h3 className="font-bold text-white uppercase">Checklist Settings</h3>
          <ul className="mt-2">
            {availableStages.map((stage) => {
              const count = tasks.filter(task => task.stage_id === stage.stage_id).length;
              return (
              <li
                key={stage.stage_id}
                onClick={() => {
                  setActiveSection('Checklist Settings');
                  setSelectedStageId(stage.stage_id);
                }}
                className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${
                  selectedStageId === stage.stage_id
                    ? 'bg-[#E0E0E0] text-[#9094A5]'
                    : ''
                }`}
              >
                {stage.stage_name}
                <span className="text-gray-400">{count}</span>
              </li>
            )})}
            {availableStages.length === 0 && (
              <li className="mt-1 text-gray-400 text-sm">Empty Stages For Now</li>
            )}
          </ul>
        </div>
        
        {/* {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="font-bold text-white uppercase">{section.title}</h3>
            <ul className="mt-2 mb-6">
              {section.subItems.map((item, idx) => {
                const isSelected =
                  section.title === 'Checklist Settings'
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
                      if (section.title === 'Checklist Settings') {
                        setMyTasksSelectedTab(item.name);
                      } else {
                        setTeamTasksSelectedTab(item.name);
                      }
                    }}
                    className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${isSelected ? 'bg-[#E0E0E0] text-[#9094A5]' : ''
                      }`}
                  >
                    {item.name}
                    <span className="text-gray-400">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))} */}
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
