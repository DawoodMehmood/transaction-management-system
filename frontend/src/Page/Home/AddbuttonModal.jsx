import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../../utility/getServerUrl';
import { showErrorToast } from '../../toastConfig';
import { apiFetch } from '../../utility/apiFetch';

const AddTransactionForm = ({ closeModal, transactionType }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [listPrice, setListPrice] = useState(0);
  const [stage_id, setStageId] = useState(''); // Selected stage id
  const [createdBy, setCreatedBy] = useState(''); // Editable createdBy field
  const [state, setState] = useState(''); // Default state set to 'IL'
  const [states, setStates] = useState([]); // List of all states (fetched from backend)
  const [availableStages, setAvailableStages] = useState([]); // Stages based on transaction type & state

  const navigate = useNavigate();


  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.username) {
      setCreatedBy(storedUser.username);
    } else {
      setCreatedBy('Faisal');
    }

    const fetchStates = async () => {
      try {
        const response = await apiFetch(`${getServerUrl()}/api/states`);
        const data = await response.json();
        if (response.ok) {
          setStates(data.states);
        } else {
          throw new Error(data.error || 'Failed to fetch states');
        }
      } catch (error) {
        showErrorToast(error.message);
      }
    };

    fetchStates();
  }, []);


  // Fetch stages when transactionType or state changes
  useEffect(() => {
    // Only fetch if a transaction type is selected (and state is available)
    if (transactionType && state) {
      const fetchStages = async () => {
        try {
          const response = await apiFetch(
            `${getServerUrl()}/api/transactions/stages?state=${state}&transaction_type=${transactionType}`
          );
          const data = await response.json();
          if (response.ok) {
            setAvailableStages(data.stages);
          } else {
            throw new Error(data.error || 'Failed to fetch stages');
          }
        } catch (error) {
          showErrorToast(error.message);
        }
      };

      fetchStages();
    } else {
      setAvailableStages([]);
      setStageId(''); // Clear stage selection if no transaction type is selected
    }
  }, [transactionType, state]);


  const handleSave = async (e) => {
    e.preventDefault()
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

    if (!listPrice || isNaN(listPrice) || Number(listPrice) <= 0) {
      showErrorToast('Price must be a valid number.');
      return;
    }

    if (
      !firstName ||
      !lastName ||
      !address1 ||
      !city ||
      !state ||
      !zip ||
      !listPrice ||
      !stage_id ||
      !createdBy ||
      !transactionType
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
      transaction_type: transactionType, // include transaction type in payload
      delete_ind: false,
      created_by: createdBy,
    };

    console.log('Payload being sent:', payload);

    try {
      const response = await apiFetch(`${getServerUrl()}/api/transactions/add`, {
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

        const currentStep = parseInt(responseData.transaction.stage_id);
        navigate('/StepperSection', {
          state: {
            transactionId,
            createdBy,
            state,
            currentStep,
            fullAddress,
            price,
            transactionType
          },
        });
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      showErrorToast('Error saving transaction. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[700px]">
      <h2 className="text-xl font-semibold mb-4">Add Details</h2>
      <form onSubmit={(e) => handleSave(e)}>
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
            required
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
            required
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
            required
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
            required
          />
        </div>

        {/* State Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            id="states"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          >
            <option value="">Select State</option>

            {states.map((stateObj) => (
              <option key={stateObj.state} value={stateObj.state}>
                {stateObj.state_name}
              </option>
            ))}
          </select>
        </div>

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
            required
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
            onKeyDown={(e) => {
              if (
                e.key === '-' ||
                e.key === ',' ||
                e.key === '+' ||
                e.key === '_' ||
                e.key === '/' ||
                e.key === '#' ||
                e.key === '='
              ) {
                e.preventDefault();
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type *
          </label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Transaction Type</option>
            <option value="listing">Listing</option>
            <option value="buyer">Buyer</option>
          </select>
        </div> */}

        {/* Stage Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage *
          </label>
          <select
            value={stage_id}
            onChange={(e) => setStageId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Stage</option>
            {availableStages.map((stage) => (
              <option key={stage.stage_id} value={stage.stage_id}>
                {stage.stage_name}
              </option>
            ))}
          </select>
        </div>


        <button
          type='submit'
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
      </form>
    </div>
  );
};

export default AddTransactionForm;
