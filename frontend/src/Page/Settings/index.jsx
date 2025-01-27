import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar';
import MainContent from './MainContent.jsx';
import Sidebar from './Sidebar/Sidebar.jsx';
import { getServerUrl } from '../../utility/getServerUrl';

const Index = () => {
  const [myTasksSelectedTab, setMyTasksSelectedTab] = useState('Pre Listing');
  const [teamTasksSelectedTab, setTeamTasksSelectedTab] = useState('');
  const [activeSection, setActiveSection] = useState('Checklist Settings');
  const [tasks, setTasks] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [dateFields, setDateFields] = useState([]); // Static date fields

  const fetchData = async () => {
    try {
      const response = await fetch(`${getServerUrl()}/api/tasks`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    setReloadTrigger(false); // Reset loading after data fetch
  };

  const fetchAllDateFields = async () => {
    try {
      const response = await fetch(`${getServerUrl()}/api/transactions/dates`);
      if (!response.ok) throw new Error('Failed to fetch date fields.');
      const data = await response.json();
      setDateFields(data);
    } catch (error) {
      console.error('Error fetching date fields:', error);
    }
  };

  useEffect(() => {
    if (reloadTrigger) {
      fetchData();
    }
  }, [reloadTrigger]); // Re-fetch tasks when updatedLoading is true

  useEffect(() => {
    fetchData();
    fetchAllDateFields();
  }, []);

  return (
    <div>
      <NavBar />
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-12 lg:col-span-12 w-full rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-3 lg:col-span-2">
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
            <div className="col-span-9 lg:col-span-10">
              <MainContent
                myTasksSelectedTab={myTasksSelectedTab}
                teamTasksSelectedTab={teamTasksSelectedTab}
                activeSection={activeSection}
                reloadTasks={() => setReloadTrigger(true)}
                tasks={tasks}
                dateFields={dateFields}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
