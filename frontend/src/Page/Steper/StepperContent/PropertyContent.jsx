// StepperContent/PropertyContent.js
import React from 'react';

const PropertyContent = ({ currentStep, price, fullAddress }) => {
  return (
    <div>
      {currentStep === 0 && (
        <div className=''>
          {/* Header Section */}
          <div className='flex justify-between border border-b items-center'>
            <h2 className='text-lg font-semibold ps-5 py-5 text-gray-800'>
              Property
            </h2>
          </div>

          {/* Details Section */}
          <div className='space-y-2'>
            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'>Address</span>
              <span className='text-gray-800  font-semibold'>
                {fullAddress}
              </span>
            </div>

            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'> Price</span>
              <span className='text-gray-800  font-semibold'>
                ${parseInt(price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className='property-step-2'>
          <h2>Active Listing</h2>
          {/* Details Section */}
          <div className='space-y-2'>
            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'>Address</span>
              <span className='text-gray-800  font-semibold'>
                {fullAddress}
              </span>
            </div>

            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'> Price</span>
              <span className='text-gray-800  font-semibold'>${price}</span>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className='property-step-3'>
          <h2>Under Contract</h2>
          {/* Details Section */}
          <div className='space-y-2'>
            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'>Address</span>
              <span className='text-gray-800  font-semibold'>
                {fullAddress}
              </span>
            </div>

            <div className='flex justify-start border ps-5 py-5'>
              <span className='text-gray-600 w-40'> Price</span>
              <span className='text-gray-800  font-semibold'>${price}</span>
            </div>
          </div>{' '}
        </div>
      )}
    </div>
  );
};

export default PropertyContent;
