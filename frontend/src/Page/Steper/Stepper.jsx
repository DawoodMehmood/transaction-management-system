import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import './Stepper.css';
import ChecklistsContent from './StepperContent/ChecklistsContent';
import DatesContent from './StepperContent/DateStepperContent.jsx';
import PropertyContent from './StepperContent/PropertyContent';

const Stepper = ({
  selectedOption,
  transactionId,
  createdBy,
  state,
  price,
  fullAddress,
  setSelectedOption,
  currentSteps,
  currentSte,
  transactionsId,
}) => {
  // Set initial value for currentStep based on currentSteps or currentSte
  const initialCurrentStep =
    Array.isArray(currentSteps) && currentSteps.length > 0
      ? currentSteps[0] - 1 // Assuming currentSteps is an array of completed steps (IDs); adjust as needed
      : currentSte !== undefined && currentSte !== null
      ? parseInt(currentSte, 10) - 1 // Convert currentSte to zero-based index
      : 0;
  const [steps, setSteps] = useState([]); // Store steps from API
  const [currentStep, setCurrentStep] = useState(initialCurrentStep); // Track current step
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [nextStep, setNextStep] = useState(null); // Track the step to move to after confirmation
  const [stepsCompletion, setStepsCompletion] = useState([]); // Track completion state
  const [loading, setLoading] = useState(true); // Track loading state

  console.log(transactionsId);

  console.log(
    'i want to send the intial value in currentStep',
    currentSteps,
    currentSte
  );

  console.log('but i am getting intial value as 0 in dates and checklist');

  // // Fetch stages from API
  useEffect(() => {
    const fetchStages = async () => {
      try {
        // Fetch stages from API
        const stagesResponse = await fetch(
          'https://api.tkglisting.com/api/transactions/stages'
        );
        const stagesData = await stagesResponse.json();
        console.log('stages', stagesData);

        const fetchedSteps = stagesData.map(stage => stage.stage_name);
        const fetchedStepsIds = stagesData.map(stage => stage.stage_id);

        // Determine completion based on available `currentSteps` or `currentSte`
        let completionStatus;
        if (Array.isArray(currentSteps) && currentSteps.length > 0) {
          completionStatus = fetchedStepsIds.map(id =>
            currentSteps.includes(id)
          );
        } else if (currentSte !== undefined && currentSte !== null) {
          const currentStageId = parseInt(currentSte, 10);
          completionStatus = fetchedStepsIds.map(id => id <= currentStageId);
        } else {
          completionStatus = fetchedStepsIds.map(() => false);
        }

        setSteps(fetchedSteps);
        setStepsCompletion(completionStatus);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stages:', error);
      }
    };

    fetchStages();
  }, [transactionsId, currentSteps, currentSte]);

  // Handle clicking on a specific step
  const handleStepClick = index => {
    if (index !== currentStep) {
      setNextStep(index); // Set the selected step
      setIsModalOpen(true); // Open confirmation modal
    }
  };

  // Handle progressing to the next step
  const handleNext = () => {
    const newNextStep = (currentStep + 1) % steps.length; // Wrap to start from the first step
    setNextStep(newNextStep); // Set the next step
    setIsModalOpen(true); // Open confirmation modal
  };

  // Handle going to the previous step (with confirmation)
  const handlePrev = () => {
    const newPrevStep = (currentStep - 1 + steps.length) % steps.length; // Wrap to go to the last step if on the first step
    setNextStep(newPrevStep); // Set the previous step as the next step
    setIsModalOpen(true); // Open the confirmation modal
  };

  // Confirm the next step (whether forward or backward)
  const confirmNextStep = async () => {
    const transactionKey = transactionId || transactionsId;

    const currentStage = parseInt(currentSte, 10);
    const new_stage = nextStep + 1; // `nextStep` directly corresponds to the new stage

    console.log('API Request Data:', {
      transaction_id: transactionKey,
      current_stage: currentStage,
      new_stage: new_stage,
    });

    try {
      const response = await fetch(
        `https://api.tkglisting.com/api/transactions/${transactionKey}/stage`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_stage: currentStage, new_stage }),
        }
      );
      console.log(response);

      const result = await response.json();
      console.log(result);

      setCurrentStep(new_stage - 1); // Adjust currentStep for zero-based indexing

      // Update completion status for previous stages
      const updatedStepsCompletion = stepsCompletion.map(
        (completed, index) => index < new_stage - 1
      );
      setStepsCompletion(updatedStepsCompletion);
      setSelectedOption('Dates');
    } catch (error) {
      console.error('Error during API call:', error);
    }

    setIsModalOpen(false); // Close modal
  };

  // Cancel moving to the next step
  const cancelNextStep = () => {
    setIsModalOpen(false); // Close the modal without progressing
    setNextStep(null); // Clear the next step
  };

  // Render the content based on the selected option
  const renderStepContent = () => {
    const stageId = currentStep + 1; // Assuming stage IDs are 1-based

    switch (selectedOption) {
      case 'Dates':
        return (
          <DatesContent
            currentStep={currentStep}
            createdBy={createdBy}
            state={state}
            transactionId={transactionId || transactionsId}
            stageId={stageId} // Pass the stage_id to DatesContent
          />
        );
      case 'Property':
        return (
          <PropertyContent
            currentStep={currentStep}
            fullAddress={fullAddress}
            price={price}
          />
        );
      case 'Checklists':
        return (
          <ChecklistsContent
            currentStep={currentStep}
            transactionId={transactionId || transactionsId}
          />
        );

      default:
        return <DatesContent currentStep={currentStep} />;
    }
  };

  if (loading) {
    return (
      <div>
        <div className='fixed inset-0 bg-gray-200 bg-opacity-60 flex justify-center items-center'>
          <div className='w-8 h-8 border-t-4 border-gray-200 border-solid rounded-full animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <ToastContainer />

      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h3>Are you sure you want to move to {steps[nextStep]}?</h3>
            <div className='modal-actions'>
              <button className='modal-btn cancel' onClick={cancelNextStep}>
                Cancel
              </button>
              <button className='modal-btn confirm' onClick={confirmNextStep}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='wrapper flex flex-col md:flex-row border items-center mt-2 bg-[#FFFFFF] py-6 ps-2 ms-2'>
        <div className='arrow-steps  clearfix'>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step  ${currentStep === index ? 'current' : ''} ${
                stepsCompletion[index] ? 'done' : ''
              }`} // Apply 'done' class based on global completion state
              onClick={() => handleStepClick(index)} // Open modal for confirmation on click
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className='flex mt-4 md:-mt-3 md:ms-10 justify-center'>
          <div
            className='bg-[#E0E0E0] px-3 py-1 me-4 flex justify-center items-center rounded-lg cursor-pointer'
            onClick={handlePrev}
          >
            <img
              src='/left-arrow-backup-2-svgrepo-com.svg'
              className='w-4'
              alt='Previous'
            />
          </div>
          <div
            className='bg-[#E0E0E0] px-3 py-1 me-4 flex justify-center items-center rounded-lg cursor-pointer'
            onClick={handleNext}
          >
            <img
              src='/right-arrow-backup-2-svgrepo-com.svg'
              className='w-4'
              alt='Next'
            />
          </div>
        </div>
      </div>

      <div className='mt-3 border bg-[#FFFFFF] h-screen overflow-y-auto ms-2'>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default Stepper;
