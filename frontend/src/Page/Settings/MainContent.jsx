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
  selectedStageId,
  availableStages,
  selectedState,
  selectedTransactionType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedStage = availableStages.find(stage => stage.stage_id === selectedStageId);
  
  const tasksWithDates = tasks.map((task) => {
    const dateField = dateFields.find(
      (field) => field.date_id === task.date_id
    );
    return {
      ...task,
      date_name: dateField ? dateField.date_name : 'Unknown', // Fallback to "Unknown" if no match is found
    };
  });

   // Filter tasks by the selected stage id
   const filteredTasks = tasksWithDates.filter(task => task.stage_id === selectedStageId);

  const renderContent = () => {
    if (filteredTasks.length === 0) {
      return <h2>No tasks found for this stage.</h2>;
    }
    return <Tasks tasks={filteredTasks} dateFields={dateFields} reload={reloadTasks} />;
  };

  return (
    <div className="bg-[#F3F5F9] h-full overflow-y-auto p-4 md:p-6">
      <div className="flex w-full justify-between mb-2">
        <h2 className="text-xl font-medium mb-4">{selectedStage?.stage_name || 'No Stage Selected'}</h2>
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
          currentStageId={selectedStageId}
          reload={reloadTasks}
          availableStages={availableStages}
          selectedState={selectedState}
          selectedTransactionType={selectedTransactionType}
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
  availableStages,
  selectedState,
  selectedTransactionType,
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
              availableStages={availableStages}
              selectedState={selectedState}
              selectedTransactionType={selectedTransactionType}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainContent;
