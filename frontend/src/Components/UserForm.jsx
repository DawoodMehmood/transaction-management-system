import React, { useEffect, useState } from 'react';
import { getServerUrl } from '../utility/getServerUrl';
import { showErrorToast } from '../toastConfig';
import { TrashIcon, PencilIcon } from '@heroicons/react/solid';
import { AnimatePresence, motion } from 'framer-motion';
import AddUserForm from './AddUserForm';
import { apiFetch } from '../utility/apiFetch';

const UserForm = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true); // Start loading
            const response = await apiFetch(`${getServerUrl()}/api/auth/users`);
            const data = await response.json();

            const mappedData = data.users.map((user) => {
                return {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    states: user.states
                };
            });

            setUsers(mappedData);
        } catch (error) {
            console.error('Error fetching users:', error);
            // showErrorToast('Error fetching users.');
            setUsers([]);
        } finally {
            setLoading(false); // Stop loading
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleDeleteClick = (user_id) => {
        setUserToDelete(user_id)
        setShowDeleteModal(true)
    }
    
    const handleEditClick = (user) => {
        setUserToEdit(user);
        setShowEditModal(true);
      };

    const handleDelete = async () => {
        try {
            const response = await apiFetch(
                `${getServerUrl()}/api/auth/user`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userToDelete }),
                }
            );

            if (response.ok) {
                fetchUsers()
                setUserToDelete(null)
            } else {
                showErrorToast('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showErrorToast('Error deleting user. Please try again.');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg md:max-w-4xl lg:w-[700px]">
            <div className='flex justify-between px-4 my-2'>

                <h2 className="text-xl font-semibold mb-4 text-center">
                    Users
                </h2>
                <div
                    className="bg-gray-700 text-white px-4 pt-2 rounded-lg cursor-pointer hover:bg-gray-900"
                    onClick={() => setShowAddModal(true)}
                >
                    Add
                </div>
                <AddModal isOpen={showAddModal} setIsOpen={setShowAddModal} refetchUsers={fetchUsers} />
                <EditModal isOpen={showEditModal} setIsOpen={setShowEditModal} refetchUsers={fetchUsers} userToEdit={userToEdit} />
                <DeleteModal
                    showDeleteModal={showDeleteModal}
                    setShowDeleteModal={setShowDeleteModal}
                    onConfirm={handleDelete}
                />
            </div>

            <div className="h-[50vh] border border-1  bg-white mb-10 overflow-x-auto lg:overflow-x-auto overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="text-gray-600 font-semibold text-lg">
                            Loading users...
                        </span>
                    </div>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-white text-nowrap">
                                <th className="px-4 py-2 text-left text-gray-700">Username</th>
                                <th className="px-4 py-2 text-left text-gray-700">Email</th>
                                <th className="px-4 py-2 text-left text-gray-700">States</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-b text-nowrap hover:bg-gray-50 cursor-pointer select-none"
                                >
                                    <td className="px-4 py-2 text-gray-600">
                                        {row.username}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">{row.email}</td>
                                    <td className="px-4 py-2 text-gray-600">{row.states.join(', ')}</td>
                                    <td className="px-4 py-2 flex space-x-5">
                                        <PencilIcon className="w-5 h-5 text-gray-700 cursor-pointer" onClick={() => handleEditClick(row)} />
                                        <TrashIcon className='size-5 text-gray-700' onClick={() =>
                                            handleDeleteClick(row.user_id)
                                        } />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const DeleteModal = ({ showDeleteModal, setShowDeleteModal, onConfirm }) => {
  const handleClose = () => {
    setShowDeleteModal(false);
  };

  const handleSubmit = () => {
    onConfirm();
    handleClose();
  };

  return (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h3 className="text-lg font-bold mb-4">Delete user</h3>
            <div>Are you sure you want to delete the user?</div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditModal = ({ isOpen, setIsOpen, refetchUsers, userToEdit }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: '12.5deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              exit={{ scale: 0, rotate: '0deg' }}
              onClick={(e) => e.stopPropagation()}
              className="shadow-xl cursor-default"
            >
              <AddUserForm refetchUsers={refetchUsers} onClose={() => setIsOpen(false)} initialData={userToEdit} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };


const AddModal = ({ isOpen, setIsOpen, refetchUsers }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: '12.5deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              exit={{ scale: 0, rotate: '0deg' }}
              onClick={(e) => e.stopPropagation()}
              className="  shadow-xl cursor-default"
            >
              <AddUserForm refetchUsers={refetchUsers} onClose={()=> setIsOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

export default UserForm;
