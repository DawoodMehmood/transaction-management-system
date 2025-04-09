import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar';
import MainContent from './MainContent.jsx';
import Sidebar from './Sidebar/Sidebar.jsx';
import { getServerUrl } from '../../utility/getServerUrl';
import { apiFetch } from '../../utility/apiFetch';

const Index = () => {
  const [myTasksSelectedTab, setMyTasksSelectedTab] = useState('Pre Listing');
  const [teamTasksSelectedTab, setTeamTasksSelectedTab] = useState('');
  const [activeSection, setActiveSection] = useState('Checklist Settings');
  const [tasks, setTasks] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [dateFields, setDateFields] = useState([]); // Static date fields
  
  // New state for filters:
  const [selectedState, setSelectedState] = useState(''); // e.g., "IL" or empty for all
  const [selectedTransactionType, setSelectedTransactionType] = useState(''); // e.g., "listing" or "buyer"
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [availableStages, setAvailableStages] = useState([]);
  
  const fetchData = async () => {
    try {
      const response = await apiFetch(`${getServerUrl()}/api/tasks?state=${selectedState}&transaction_type=${selectedTransactionType}`);
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
      const response = await apiFetch(`${getServerUrl()}/api/transactions/dates?state=${selectedState}&transaction_type=${selectedTransactionType}`);
      if (!response.ok) throw new Error('Failed to fetch date fields.');
      const data = await response.json();
      setDateFields(data);
    } catch (error) {
      console.error('Error fetching date fields:', error);
    }
  };
  
    // Re-fetch tasks when filters change or reload is triggered
    useEffect(() => {
      if (!selectedState || !selectedTransactionType) {
        // If either filter is missing, clear tasks (or do nothing)
        setTasks([]);
        setDateFields([]);
        return;
      }
      fetchData();
      fetchAllDateFields();
    }, [reloadTrigger, selectedState, selectedTransactionType]);
    
    useEffect(() => {
      if (selectedState && selectedTransactionType) {
        const fetchStages = async () => {
          try {
            const response = await apiFetch(
              `${getServerUrl()}/api/transactions/stages?state=${selectedState}&transaction_type=${selectedTransactionType}`
            );
            const data = await response.json();
            if (response.ok) {
              setAvailableStages(data.stages);
              // Set default stage if not selected
              if (!selectedStageId && data.stages.length > 0) {
                setSelectedStageId(data.stages[0].stage_id);
              }
            } else {
              throw new Error(data.error || 'Failed to fetch stages');
            }
          } catch (error) {
            showErrorToast(error.message);
          }
        };
  
        fetchStages();
      } else {
        setAvailableStages([]);
        setSelectedStageId(null);
      }
    }, [selectedState, selectedTransactionType, selectedStageId, setSelectedStageId]);
    

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
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedTransactionType={selectedTransactionType}
                setSelectedTransactionType={setSelectedTransactionType}
                selectedStageId={selectedStageId}
                setSelectedStageId={setSelectedStageId}
                availableStages={availableStages}
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
                selectedStageId={selectedStageId}
                availableStages={availableStages}
                selectedState={selectedState}
                selectedTransactionType={selectedTransactionType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
