// StepperContent/ContactsContent.js
import React from 'react';

const ContactsContent = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className='Contacts-step-1'>
          <h2>Step 1: Contacts Details</h2>
          <form>
            <div className='form-group'>
              <label>Contacts Address</label>
              <input type='text' placeholder='Enter address' />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </div>
      )}

      {currentStep === 1 && (
        <div className='Contacts-step-2'>
          <h2>Step 2: Upload Documents</h2>
          <button>Upload File</button>
        </div>
      )}

      {currentStep === 2 && (
        <div className='Contacts-step-3'>
          <h2>Step 3: Review Information</h2>
          <button className='save-btn'>Save Contacts Details</button>
        </div>
      )}
    </div>
  );
};

export default ContactsContent;
