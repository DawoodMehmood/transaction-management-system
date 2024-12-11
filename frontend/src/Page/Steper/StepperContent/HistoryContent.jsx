// StepperContent/.js
import React from 'react';

const HistoryContent = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className='History-step-1'>
          <h2>Step 1: History Details</h2>
          <form>
            <div className='form-group'>
              <label>History Address</label>
              <input type='text' placeholder='Enter address' />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </div>
      )}

      {currentStep === 1 && (
        <div className='History-step-2'>
          <h2>Step 2: Upload Documents</h2>
          <button>Upload File</button>
        </div>
      )}

      {currentStep === 2 && (
        <div className='History-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save History Details</button>
        </div>
      )}
    </div>
  );
};

export default HistoryContent;
