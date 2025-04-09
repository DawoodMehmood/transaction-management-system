import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import SideSection from './SideSection.jsx';
import Stepper from './Stepper.jsx';

export const Index = () => {
  const [selectedOption, setSelectedOption] = useState('Dates'); // Default to 'Dates'
  const location = useLocation();
  const { transactionId, createdBy, state, fullAddress, currentStep, price, transactionType } =
    location.state || {};
  const initialStep = currentStep ?? 1;
  const [internalCurrentStep, setInternalCurrentStep] = useState(initialStep);

  return (
    <div>
      <NavBar />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          {/* Pass the current step to the SideSection */}
          <SideSection
            setSelectedOption={setSelectedOption}
            selectedOption={selectedOption}
            fullAddress={fullAddress}
          />
        </div>
        <div className="md:col-span-9">
          {/* Pass down the setCurrentStep and setSelectedOption */}
          <Stepper
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption} // Pass this to Stepper
            transactionId={transactionId}
            createdBy={createdBy}
            state={state}
            price={price}
            currentStep={internalCurrentStep}
            fullAddress={fullAddress}
            setCurrentStep={setInternalCurrentStep} // Track and update step changes
            transactionType={transactionType}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
