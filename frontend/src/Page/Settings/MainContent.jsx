// src/components/MainContent.jsx
import React, { useState, useEffect } from 'react';
import Tasks from './Tasks';
import AddForm from './AddbuttonModal.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const MainContent = ({
  myTasksSelectedTab,
  teamTasksSelectedTab,
  activeSection,
  reloadTasks,
  tasks,
  dateFields,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(1);

  const displayTab =
    activeSection === 'Checklist Settings'
      ? myTasksSelectedTab
      : teamTasksSelectedTab;

  // Map over tasks and add the date_name field based on date_id
  const tasksWithDates = tasks.map((task) => {
    const dateField = dateFields.find(
      (field) => field.date_id === task.date_id
    );
    return {
      ...task,
      date_name: dateField ? dateField.date_name : 'Unknown', // Fallback to "Unknown" if no match is found
    };
  });

  useEffect(() => {
    switch (displayTab) {
      case 'Pre Listing':
        setCurrentStageId(1);
        break;
      case 'Active Listing':
        setCurrentStageId(2);
        break;
      case 'Under Contract':
        setCurrentStageId(3);
        break;
      default:
        setCurrentStageId(null);
        break;
    }
  }, [displayTab]);

  // Filter tasks by stage_id
  const filteredTasks = {
    prelisting: tasksWithDates.filter((task) => task.stage_id === 1),
    activelisting: tasksWithDates.filter((task) => task.stage_id === 2),
    undercontract: tasksWithDates.filter((task) => task.stage_id === 3),
  };

  const renderContent = () => {
    switch (displayTab) {
      case 'Pre Listing':
        return (
          <Tasks
            tasks={filteredTasks.prelisting}
            dateFields={dateFields}
            reload={reloadTasks}
          />
        );
      case 'Active Listing':
        return (
          <Tasks
            tasks={filteredTasks.activelisting}
            dateFields={dateFields}
            reload={reloadTasks}
          />
        );
      case 'Under Contract':
        return (
          <Tasks
            tasks={filteredTasks.undercontract}
            dateFields={dateFields}
            reload={reloadTasks}
          />
        );
      default:
        return <h2>Please select a tab from the sidebar</h2>;
    }
  };

  return (
    <div className="bg-[#F3F5F9] h-full overflow-y-auto p-4 md:p-6">
      <div className="flex w-full justify-between mb-2">
        <h2 className="text-xl font-medium mb-4">{displayTab}</h2>
        <div
          className="bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-900"
          onClick={() => setIsOpen(true)}
        >
          + Add
        </div>
        <AddModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          dateFields={dateFields}
          currentStageId={currentStageId}
          reload={reloadTasks}
        />
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

const AddModal = ({
  isOpen,
  setIsOpen,
  dateFields,
  currentStageId,
  reload,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="  shadow-xl cursor-default"
          >
            <AddForm
              closeModal={() => setIsOpen(false)}
              dateFields={dateFields}
              currentStageId={currentStageId}
              reload={reload}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainContent;
