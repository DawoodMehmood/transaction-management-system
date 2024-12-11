// src/components/MainContent.jsx
import React from 'react';
import AllCalenderTasks from './AllCalenderTasks.jsx';
import OverdueTask from './OverdueTasks.jsx';
import ScheduledTask from './ScheduledTasks.jsx';
import { FinishedTasks } from './TaskComponents';
import ThisMonthTask from './ThisMonthTasks.jsx';
import ThisWeekTask from './ThisWeekTasks.jsx';
import TodayTasks from './TodayTasks.jsx';
const MainContent = ({
  myTasksSelectedTab,
  teamTasksSelectedTab,
  activeSection,
  setupdatedLoading,
  reloadTasks,
}) => {
  const displayTab =
    activeSection === 'My Tasks' ? myTasksSelectedTab : teamTasksSelectedTab;

  const renderContent = () => {
    switch (displayTab) {
      case 'All Tasks':
        return <AllCalenderTasks setupdatedLoading={setupdatedLoading} />;
      case 'Scheduled':
        return <ScheduledTask />;
      case 'Today':
        return <TodayTasks setupdatedLoading={setupdatedLoading} />;
      case 'This Week':
        return <ThisWeekTask setupdatedLoading={setupdatedLoading} />;
      case 'This Month':
        return <ThisMonthTask setupdatedLoading={setupdatedLoading} />;
      case 'Overdue':
        return <OverdueTask setupdatedLoading={setupdatedLoading} />;
      case 'Finished':
        return <FinishedTasks reloadTasks={reloadTasks} />;
      default:
        return <h2>Please select a tab from the sidebar</h2>;
    }
  };

  return (
    <div className='bg-[#F3F5F9] h-full overflow-y-auto p-4 md:p-6'>
      <h2 className='text-xl font-medium mb-4'>{displayTab}</h2>
      <div>{renderContent()}</div>
    </div>
  );
};

export default MainContent;
