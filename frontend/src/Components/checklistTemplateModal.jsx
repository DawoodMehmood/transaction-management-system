import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { showSuccessToast } from '../toastConfig';

// Declare checklistData outside of the component
const checklistData = {
  Denver: [
    'Confirm Listing Contract is signed and in file.',
    'Introductory call with client – Day 1 of 10 days',
    'Ask client on a phone call for referral. See Script.',
    'Add client to Mojo, CRM and update notes.',
    'Update deals spreadsheet.',
    'Call/text client and set up a good time for a 5-minute introductory phone call.',
    'Set up sign and lockbox delivery.',
    'Set up Listing in CB software.',
  ],
  Illinois: [
    'Research Clients',
    'Create a OneDrive folder for the property and add the listing agreement and signed disclosures.',
    'Add listing to private network with photo of front of the house taken by agent at listing appointment (Check with Kari first).',
    'Schedule photo appointment and confirm time with client and photographer.',
    'Add photo appointment to calendar.',
    'Confirm all client contact information is 100% correct.',
    'Call utilities & ask for 12 month average',
  ],
  Nevada: [
    'Research Clients',
    'Create a OneDrive folder for the property and add the listing agreement and signed disclosures.',
    'Add listing to private network with photo of front of the house taken by agent at listing appointment (Check with Kari first).',
    'Schedule photo appointment and confirm time with client and photographer.',
    'Add photo appointment to calendar.',
    'Confirm all client contact information is 100% correct.',
    'Call utilities & ask for 12 month average',
  ],
};

// Define the component
export const ChecklistTemplateModal = ({
  isOpen,
  setIsOpen,
  setChecklistApplied,
  setSelectedChecklistData,
}) => {
  const [selectedChecklist, setSelectedChecklist] = useState('Denver');
  const handleConfirm = () => {
    showSuccessToast(
      'Applied Successfully! We are generating tasks according to the template you choose. You can refresh the page later.'
    );
    setSelectedChecklistData(checklistData[selectedChecklist]);
    setChecklistApplied(true); // Notify parent that checklist has been applied

    setIsOpen(false); // Close the modal
  };
  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="bg-slate-900/20 backdrop-blur p-4 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, rotate: '12.5deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              exit={{ scale: 0.95, rotate: '0deg' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg sm:max-w-xl md:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg cursor-default overflow-hidden"
            >
              {/* Modal Header */}
              <div className="border border-b flex justify-between items-center py-5 px-5">
                <p>Choose a Checklist Template</p>
                <img
                  src="/cross-svgrepo-com.svg"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8"
                  alt="Close"
                />
              </div>

              {/* Main content layout */}
              <div className="flex flex-col md:flex-row md:h-auto">
                {/* Left Sidebar */}
                <div className="w-full md:w-1/3 p-4 border border-r">
                  <div className="border rounded-lg flex bg-white py-2 mb-6">
                    <img
                      src="/search-svgrepo-com.svg"
                      className="w-5 h-5 ms-4"
                      alt="Search"
                    />
                    <input
                      type="search"
                      name=""
                      className="bg-transparent flex-grow"
                      placeholder="Search..."
                    />
                  </div>

                  <h2 className="text-lg font-bold mb-4">Choose a Checklist</h2>
                  <ol>
                    {Object.keys(checklistData).map((city) => (
                      <div key={city}>
                        <li
                          className={`p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                            selectedChecklist === city ? 'bg-gray-200' : ''
                          }`}
                          onClick={() => setSelectedChecklist(city)}
                        >
                          {city} - Checklist
                          <img
                            src="/edit-3-svgrepo-com.svg"
                            className="w-5 h-5"
                            alt="Edit"
                          />
                        </li>
                      </div>
                    ))}
                  </ol>
                </div>

                {/* Right Content (fixed width to avoid resizing) */}
                <div className="flex-grow p-4 bg-white md:rounded-r-lg">
                  <h2 className="text-xl font-semibold mb-4">
                    {selectedChecklist} - Active Listing
                  </h2>
                  <div className="max-h-[300px] md:max-h-[400px] lg:max-h-[500px] overflow-auto">
                    <ol className="list-decimal pl-6 space-y-2">
                      {checklistData[selectedChecklist].map((step, index) => (
                        <li
                          key={index}
                          className="text-sm md:text-base hover:bg-gray-300"
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end items-center pe-6 pb-6 border border-t">
                <div className="mt-4">
                  <button
                    className="bg-gray-200 py-2 px-3 rounded-lg text-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="mt-4 ms-6">
                  <button
                    className="bg-[#616161] py-2 px-3 rounded-lg text-white"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChecklistTemplateModal;
