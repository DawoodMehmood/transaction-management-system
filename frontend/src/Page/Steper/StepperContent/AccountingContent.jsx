// StepperContent/AccountingContent.js
import React from 'react';

const AccountingContent = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className='Accounting-step-1'>
          <h2>Step 1: Accounting Details</h2>
          <form>
            <div className='form-group'>
              <label>Accounting Address</label>
              <input type='text' placeholder='Enter address' />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </div>
      )}
      {currentStep === 1 && (
        <div className='Accounting-step-2'>
          <h2>Step 2: Upload Documents</h2>
          <button>Upload File</button>
        </div>
      )}
      {currentStep === 2 && (
        <div className='Accounting-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Accounting Details</button>
        </div>
      )}{' '}
      {currentStep === 3 && (
        <div className='Accounting-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Accounting Details</button>
        </div>
      )}{' '}
      {currentStep === 4 && (
        <div className='Accounting-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Accounting Details</button>
        </div>
      )}
    </div>
  );
};

export default AccountingContent;
