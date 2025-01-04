import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast, showSuccessToast } from '../../toastConfig';

const mapStage = (stage_id) => {
  switch (stage_id) {
    case 1:
      return 'Pre Listing';
    case 2:
      return 'Active Listing';
    case 3:
      return 'Under Contract';
    default:
      return '';
  }
};

const TransactionForm = ({ closeModal }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [stage_id, setStageId] = useState(''); // Store stage_id
  const [createdBy, setCreatedBy] = useState(''); // Editable createdBy field
  const [state, setState] = useState('IL'); // Default state set to 'IL'
  const [states, setStates] = useState([]); // State for the list of states
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username) {
      setCreatedBy(storedUser.username); // Set createdBy to the stored username
    } else {
      setCreatedBy('Faisal'); // Set createdBy to 'admin' for now
    }

    // Fetch states from the API
    // const fetchStates = async () => {
    //   try {
    //     const response = await fetch(`${getServerUrl()}/api/states/all`);
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch states');
    //     }
    //     const data = await response.json();
    //     setStates(data.states); // Set the states from the response
    //   } catch (error) {
    //     showErrorToast('Error fetching states. Please try again.');
    //   }
    // };

    // fetchStates();
  }, []);

  const handleSave = async () => {
    console.log({
      firstName,
      lastName,
      address1,
      city,
      state,
      zip,
      listPrice,
      stage_id,
      createdBy,
    });

    if (
      !firstName ||
      !lastName ||
      !address1 ||
      !city ||
      !state ||
      !zip ||
      !listPrice ||
      !stage_id ||
      !createdBy
    ) {
      showErrorToast('Please fill out all required fields.');
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      address1,
      address2: address2 || null,
      city,
      state,
      zip,
      list_price: parseFloat(listPrice),
      stage_id: parseInt(stage_id),
      delete_ind: false,
      created_by: createdBy,
    };

    console.log('Payload being sent:', payload);
    try {
      const response = await fetch(`${getServerUrl()}/api/transactions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('new added', response);

      if (response.ok) {
        const responseData = await response.json();
        console.log('new added', responseData);
        const transactionId = responseData.transaction.transaction_id;
        const address = responseData.transaction.address1;
        const city = responseData.transaction.city;
        const list_price = responseData.transaction.list_price;
        const fullAddress = `${address}, ${city}`;
        const price = list_price;
        console.log('Transaction ID:', transactionId);
        console.log('Full address:', fullAddress);
        console.log('Price:', price);

        showSuccessToast('Transaction saved successfully!');
        let currentStep = 1;
        navigate('/StepperSection', {
          state: {
            transactionId,
            createdBy,
            state,
            currentStep,
            fullAddress,
            price,
          },
        });
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      showErrorToast('Error saving transaction. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[700px]">
      <h2 className="text-xl font-semibold mb-4">Add Details</h2>

      {/* First Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name *
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Last Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name *
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Address 1 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address 1 *
        </label>
        <input
          type="text"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Address 2 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address 2
        </label>
        <input
          type="text"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* City */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City *
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* State Dropdown */}
      {/* <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State *
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {states.map((stateItem) => (
            <option key={stateItem.state} value={stateItem.state}>
              {stateItem.state}
            </option>
          ))}
        </select>
      </div> */}

      {/* Zip */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zip *
        </label>
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* List Price */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          List Price *
        </label>
        <input
          type="number"
          value={listPrice}
          onChange={(e) => setListPrice(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Stage Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stage *
        </label>
        <select
          value={stage_id}
          onChange={(e) => setStageId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Stage</option>
          <option value="1">Pre Listing</option>
          <option value="2">Active Listing</option>
          <option value="3">Under Contract</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-gray-700 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
      >
        Save
      </button>
      <button
        onClick={closeModal}
        className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

export default TransactionForm;
