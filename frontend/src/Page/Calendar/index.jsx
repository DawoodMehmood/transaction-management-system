import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar';
import MainContent from './MainContent.jsx';
import Sidebar from './Sidebar/Sidebar.jsx';
import { fetchTasks } from './TaskComponents.jsx';
import TopNav from './TopNav.jsx';

const Index = () => {
  const [myTasksSelectedTab, setMyTasksSelectedTab] = useState('All Tasks');
  const [teamTasksSelectedTab, setTeamTasksSelectedTab] = useState('');
  const [activeSection, setActiveSection] = useState('My Tasks');
  const [tasks, setTasks] = useState([]);
  const [updatedLoading, setupdatedLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const fetchData = async () => {
    const data = await fetchTasks();
    setTasks(data);
    setupdatedLoading(false); // Reset loading after data fetch
    setReloadTrigger(false); // Reset loading after data fetch
  };

  useEffect(() => {
    if (updatedLoading || reloadTrigger) {
      fetchData();
    }
  }, [updatedLoading, reloadTrigger]); // Re-fetch tasks when updatedLoading is true

  useEffect(() => {
    fetchData();
  }, []);

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
              />
            </div>
            <div className='col-span-9 lg:col-span-10'>
              <TopNav />
              <MainContent
                myTasksSelectedTab={myTasksSelectedTab}
                teamTasksSelectedTab={teamTasksSelectedTab}
                activeSection={activeSection}
                setupdatedLoading={setupdatedLoading}
                reloadTasks={() => setReloadTrigger(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
