// StepperContent/DatesContent.js
import React from 'react';

const DatesContent = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className='Dates-step-1'>
          <h2>Step 1: Dates Details</h2>
          <form>
            <div className='form-group'>
              <label>Dates Address</label>
              <input type='text' placeholder='Enter address' />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </div>
      )}

      {currentStep === 1 && (
        <div className='Dates-step-2'>
          <h2>Step 2: Upload Documents</h2>
          <button>Upload File</button>
        </div>
      )}

      {currentStep === 2 && (
        <div className='Dates-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Dates Details</button>
        </div>
      )}
    </div>
  );
};

export default DatesContent;
