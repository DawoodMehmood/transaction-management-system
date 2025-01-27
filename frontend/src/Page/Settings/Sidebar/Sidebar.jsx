import React, { useState } from 'react';

const sidebarItems = [
  {
    title: 'Checklist Settings',
    subItems: [
      { name: 'Pre Listing', count: 0 },
      { name: 'Active Listing', count: 0 },
      { name: 'Under Contract', count: 0 },
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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Calculate counts for each task category based on "Opened" status
  const counts = {
    prelisting: tasks.filter((task) => task.stage_id === 1).length,
    activelisting: tasks.filter((task) => task.stage_id === 2).length,
    undercontract: tasks.filter((task) => task.stage_id === 3).length,
  };

  return (
    <>
      <div
        className={`bg-gray-700 text-gray-300 p-4 z-40 transition-transform duration-300 ${
          isOpen
            ? 'translate-x-0 fixed top-0 left-0 '
            : '-translate-x-full h-0 md:h-full'
        } md:translate-x-0 md:w-100`}
      >
        {sidebarItems.map((section, sectionIndex) => (
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
                    className={`cursor-pointer flex justify-between items-center mt-1 px-2 py-1 rounded ${
                      isSelected ? 'bg-[#E0E0E0] text-[#9094A5]' : ''
                    }`}
                  >
                    {item.name}
                    <span className="text-gray-400">{count}</span>
                  </li>
                );
              })}
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
