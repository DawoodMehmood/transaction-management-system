import React, { useEffect, useState } from 'react';
import './Stepper.css';
import ChecklistsContent from './StepperContent/ChecklistsContent';
import DatesContent from './StepperContent/DateStepperContent.jsx';
import PropertyContent from './StepperContent/PropertyContent';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from '../../toastConfig.js';
import { apiFetch } from '../../utility/apiFetch';

const Stepper = ({
  selectedOption,
  setSelectedOption,
  transactionId,
  createdBy,
  state,
  price,
  transactionType,
  fullAddress,
  currentStep,
  setCurrentStep,
}) => {
  const [steps, setSteps] = useState([]); // Store steps from API
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [nextStep, setNextStep] = useState(null); // Track the step to move to after confirmation
  const [stepsCompletion, setStepsCompletion] = useState([]); // Track completion state
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchStages = async () => {
      try {
        // Fetch stages from API
        const stagesResponse = await apiFetch(
          `${getServerUrl()}/api/transactions/stages?state=${state}&transaction_type=${transactionType}`
        );
        const stagesData = await stagesResponse.json();
        console.log('stages', stagesData);

        const fetchedSteps = stagesData.stages.map((stage) => stage.stage_name);
        const fetchedStepsIds = stagesData.stages.map((stage) => stage.stage_id);

        // Determine completion based on available `currentStep`
        let completionStatus;
        if (currentStep !== undefined && currentStep !== null) {
          completionStatus = fetchedStepsIds.map((id) => id <= currentStep);
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
  }, [currentStep]);

  // Handle clicking on a specific step
  const handleStepClick = (index) => {
    const stepNumber = index + 1; // Convert zero-based index to 1-based step
    if (stepNumber !== currentStep) {
      setNextStep(stepNumber);
      setIsModalOpen(true);
    }
  };

  // Handle progressing to the next step
  const handleNext = () => {
    // If you want wrapping behavior for one-based steps:
    const newNextStep = (currentStep % steps.length) + 1;
    setNextStep(newNextStep);
    setIsModalOpen(true);
  };

  // Handle going to the previous step (with confirmation)
  const handlePrev = () => {
    // For previous step with wrapping:
    const newPrevStep = ((currentStep - 2 + steps.length) % steps.length) + 1;
    setNextStep(newPrevStep);
    setIsModalOpen(true);
  };

  // Confirm the next step (whether forward or backward)
  const confirmNextStep = async () => {
    const transactionKey = transactionId;

    const new_stage = nextStep; // `nextStep` directly corresponds to the new stage

    console.log('API Request Data:', {
      transaction_id: transactionKey,
      current_stage: currentStep,
      new_stage: new_stage,
    });

    try {
      const response = await apiFetch(
        `${getServerUrl()}/api/transactions/${transactionKey}/stage`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_stage: currentStep, new_stage }),
        }
      );
      console.log(response);
      if (response.ok) {
        const result = await response.json();
        console.log(result);

        setCurrentStep(new_stage); // Adjust currentStep for zero-based indexing

        // Update completion status for previous stages
        const updatedStepsCompletion = stepsCompletion.map(
          (_, i) => i < new_stage - 1
        );
        setStepsCompletion(updatedStepsCompletion);
        setSelectedOption('Dates');
        // showSuccessToast('Stage updated successfully');
      } else {
        showErrorToast('Error updating stage');
      }
    } catch (error) {
      console.error('Error during API call:', error);
    } finally {
      setIsModalOpen(false); // Close modal
    }
  };

  // Cancel moving to the next step
  const cancelNextStep = () => {
    setIsModalOpen(false); // Close the modal without progressing
    setNextStep(null); // Clear the next step
  };

  // Render the content based on the selected option
  const renderStepContent = () => {
    switch (selectedOption) {
      case 'Dates':
        return (
          <DatesContent
            createdBy={createdBy}
            state={state}
            transactionId={transactionId}
            stageId={currentStep}
            transactionType={transactionType}
          />
        );
      case 'Property':
        return (
          <PropertyContent
            currentStep={currentStep}
            price={price}
            fullAddress={fullAddress}
          />
        );
      case 'Checklists':
        return (
          <ChecklistsContent
            currentStep={currentStep}
            transactionId={transactionId}
            transactionType={transactionType}
            state={state}
          />
        );

      default:
        return <DatesContent currentStep={currentStep} />;
    }
  };

  if (loading) {
    return (
      <div>
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex justify-center items-center">
          <div className="w-8 h-8 border-t-4 border-gray-200 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to move to {steps[nextStep - 1]}?</h3>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={cancelNextStep}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={confirmNextStep}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wrapper flex flex-col md:flex-row border items-center mt-2 bg-[#FFFFFF] py-6 ps-2 ms-2">
        <div className="arrow-steps  clearfix">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step  ${currentStep === index + 1 ? 'current' : ''} ${
                stepsCompletion[index] ? 'done' : ''
              }`} // Apply 'done' class based on global completion state
              onClick={() => handleStepClick(index)} // Open modal for confirmation on click
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className="flex mt-4 md:-mt-3 md:ms-10 justify-center">
          <div
            className="bg-[#E0E0E0] px-3 py-1 me-4 flex justify-center items-center rounded-lg cursor-pointer"
            onClick={handlePrev}
          >
            <img
              src="/left-arrow-backup-2-svgrepo-com.svg"
              className="w-4"
              alt="Previous"
            />
          </div>
          <div
            className="bg-[#E0E0E0] px-3 py-1 me-4 flex justify-center items-center rounded-lg cursor-pointer"
            onClick={handleNext}
          >
            <img
              src="/right-arrow-backup-2-svgrepo-com.svg"
              className="w-4"
              alt="Next"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 border bg-[#FFFFFF] h-screen overflow-y-auto ms-2">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default Stepper;
