import React from 'react';

const DocumentsContent = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className='Documents-step-1'>
          <h2>Step 1: Documents Details</h2>
          <form>
            <div className='form-group'>
              <label>Documents Address</label>
              <input type='text' placeholder='Enter address' />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </div>
      )}

      {currentStep === 1 && (
        <div className='Documents-step-2'>
          <h2>Step 2: Upload Documents</h2>
          <button>Upload File</button>
        </div>
      )}

      {currentStep === 2 && (
        <div className='Documents-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Documents Details</button>
        </div>
      )}
    </div>
  );
};

export default DocumentsContent;
