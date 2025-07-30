// src/components/MainContent.jsx
import React from 'react';
import { AllTasks, FinishedTasks, OverdueTasks, SkippedTasks, ThisMonthTasks, ThisWeekTasks, TodayTasks } from './TaskComponents';

const MainContent = ({
  myTasksSelectedTab,
  teamTasksSelectedTab,
  activeSection,
  reloadTasks,
  tasks,
  loadingTasks
}) => {
  const displayTab =
    activeSection === 'My Tasks' ? myTasksSelectedTab : teamTasksSelectedTab;

  const renderContent = () => {
    if (loadingTasks) {
      return (
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500">Loading Tasks...</span>
        </div>
      );
    }
    switch (displayTab) {
      case 'All Tasks':
        return <AllTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'Today':
        return <TodayTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'This Week':
        return <ThisWeekTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'This Month':
        return <ThisMonthTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'Overdue':
        return <OverdueTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'Skipped':
        return <SkippedTasks reloadTasks={reloadTasks} tasks={tasks} />;
      case 'Finished':
        return <FinishedTasks reloadTasks={reloadTasks} tasks={tasks} />;
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
