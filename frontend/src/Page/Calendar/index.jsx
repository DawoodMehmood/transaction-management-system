import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar';
import MainContent from './MainContent.jsx';
import Sidebar from './Sidebar/Sidebar.jsx';
import { fetchTasks } from './TaskComponents.jsx';
import { showErrorToast } from '../../toastConfig';

const Index = () => {
  const [myTasksSelectedTab, setMyTasksSelectedTab] = useState('All Tasks');
  const [teamTasksSelectedTab, setTeamTasksSelectedTab] = useState('');
  const [activeSection, setActiveSection] = useState('My Tasks');
  const [tasks, setTasks] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  // New state for filters:
  const [selectedState, setSelectedState] = useState(''); // e.g., "IL" or empty for all
  const [selectedTransactionType, setSelectedTransactionType] = useState(''); // e.g., "listing" or "buyer"

  const fetchData = async () => {
    try {
      const data = await fetchTasks(selectedState, selectedTransactionType);
      setTasks(data);
    } catch (error) {
      setTasks([]);
      // showErrorToast('No tasks found');
    } finally {
      setReloadTrigger(false);
    }
  };
  

  // Re-fetch tasks when filters change or reload is triggered
  useEffect(() => {
    if (!selectedState) {
      // If either filter is missing, clear tasks (or do nothing)
      setTasks([]);
      return;
    }
    fetchData();
  }, [reloadTrigger, selectedState]);

  return (
    <div>
      <NavBar />
      <div className='grid grid-cols-1 lg:grid-cols-12'>
        <div className='col-span-12 lg:col-span-12 w-full rounded-lg'>
          <div className='grid grid-cols-1 md:grid-cols-12'>
            <div className='md:col-span-3 lg:col-span-2'>
              <Sidebar
                myTasksSelectedTab={myTasksSelectedTab}
                setMyTasksSelectedTab={setMyTasksSelectedTab}
                teamTasksSelectedTab={teamTasksSelectedTab}
                setTeamTasksSelectedTab={setTeamTasksSelectedTab}
                setActiveSection={setActiveSection}
                activeSection={activeSection}
                tasks={tasks}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedTransactionType={selectedTransactionType}
                setSelectedTransactionType={setSelectedTransactionType}
              />
            </div>
            <div className='col-span-9 lg:col-span-10'>
              <MainContent
                myTasksSelectedTab={myTasksSelectedTab}
                teamTasksSelectedTab={teamTasksSelectedTab}
                activeSection={activeSection}
                reloadTasks={() => setReloadTrigger(true)}
                tasks={tasks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
