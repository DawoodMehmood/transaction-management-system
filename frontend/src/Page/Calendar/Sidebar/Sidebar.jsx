import React, { useState } from 'react';

const sidebarItems = [
  {
    title: 'My Tasks',
    subItems: [
      { name: 'All Tasks', count: 0 },
      { name: 'Scheduled', count: 0 },
      { name: 'Today', count: 0 },
      { name: 'Overdue', count: 0 },
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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Calculate counts for each task category based on "Opened" status
  const counts = {
    alltasks: tasks.filter(
      (task) => task.taskStatus === 'Open' && task.enteredDate
    ).length,
    Scheduled: tasks.filter(
      (task) => task.taskStatus === 'Open' && task.category === 'Scheduled'
    ).length,
    today: tasks.filter((task) => {
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate.toISOString().slice(0, 10) ===
          sixHoursAgo.toISOString().slice(0, 10)
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
        task.enteredDate <= endOfWeek
      );
    }).length,
    thisMonth: tasks.filter((task) => {
      const now = new Date();
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate.getMonth() === now.getMonth() &&
        task.enteredDate.getFullYear() === now.getFullYear()
      );
    }).length,
    overdue: tasks.filter((task) => {
      const oneDayBeforeNow = new Date();
      oneDayBeforeNow.setDate(oneDayBeforeNow.getDate() - 1);
      return (
        task.taskStatus === 'Open' &&
        task.enteredDate &&
        task.enteredDate <= oneDayBeforeNow
      );
    }).length,
    finished: tasks.filter((task) => task.taskStatus === 'Completed').length,
  };

  return (
    <>
      <button
        className={`md:hidden fixed top-30 left-4 z-30 p-2 bg-gray-700 text-white rounded-lg px-6 focus:outline-none ${
          isOpen ? 'ms-32 mt-4 top-0' : ' left-0'
        } `}
        onClick={toggleSidebar}
      >
        {isOpen ? '←' : '→'}
      </button>

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
