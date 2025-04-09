import { MenuIcon, UserCircleIcon, XIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // Import React Router
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import UserForm from './UserForm.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { isSuperAdmin } from '../utility/isSuperAdmin.js';

const NavBar = () => {
  const [isPeopleDropdownOpen, setIsPeopleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const [activeItem, setActiveItem] = useState('');
  const navigate = useNavigate();
  const [showUserModal, setShowUserModal] = useState(false);


  const navItems = [
    // { name: 'People', dropdown: true },
    { name: 'Transactions', dropdown: false, path: '/Transactions' },
    // { name: 'Listings', dropdown: false, path: '/listings' },
    { name: 'Systems', dropdown: false },
    { name: 'Calendar View', dropdown: false, path: '/Calendars' },
    // { name: 'Marketing', dropdown: false },
    // { name: 'Reporting', dropdown: false },
    // { name: 'Website', dropdown: false },
    // { name: 'Marketplace', dropdown: false },
    { name: 'Settings', dropdown: false, path: '/Settings' },
  ];

  // Set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    const matchedItem = navItems.find((item) => item.path === currentPath);

    if (matchedItem) {
      setActiveItem(matchedItem.name);
    } else {
      setActiveItem(''); // Reset for non-routed pages
    }
  }, [location.pathname]);

  const handleNavClick = (item) => {
    setActiveItem(item.name);
    if (item.name === 'People') setIsPeopleDropdownOpen(!isPeopleDropdownOpen);
    else setIsPeopleDropdownOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/'); // Redirect to homepage on success
  }

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Left Section - Logo and Nav Items */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="text-xl font-bold">Logo</div>

        {/* Nav Items */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={`flex items-center hover:text-gray-700 ${activeItem === item.name
                    ? 'border-b-4 border-[#616161] text-[#616161]'
                    : ''
                    }`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.name}

                  {/* Red Dot on Listings */}
                  {item.name === 'Listings' && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 h-2 w-2 rounded-full"></span>
                  )}
                </NavLink>
              ) : (
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center hover:text-gray-700 ${activeItem === item.name
                    ? 'border-b-4 border-[#616161] text-[#616161]'
                    : ''
                    }`}
                >
                  {item.name}

                  {/* Dropdown arrow for People */}
                  {item.name === 'People' && (
                    <svg
                      className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${isPeopleDropdownOpen ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              )}

              {/* People Dropdown */}
              {item.name === 'People' && isPeopleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-md"
                >
                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Sub People 1
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Sub People 2
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Sub People 3
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Icons */}
      <div className="flex items-center space-x-4">
        <Menu as="div" className="relative ml-3">
          <div>
            <MenuButton className="relative flex rounded-full text-sm">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="size-8 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </MenuButton>
          </div>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            {isSuperAdmin() ? (
              <MenuItem>
                <div
                  className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden hover:cursor-pointer"
                  onClick={() => setShowUserModal(true)}
                >
                  User Management
                </div>
              </MenuItem>
            ) : (<></>)}
            <MenuItem>
              <div
                className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden hover:cursor-pointer"
                onClick={handleSignOut}
              >
                Sign out
              </div>
            </MenuItem>
          </MenuItems>
        </Menu>

        <UserModal
          showUserModal={showUserModal}
          setShowUserModal={setShowUserModal}
        />

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden block"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <XIcon className="w-6 h-6 text-gray-500" />
          ) : (
            <MenuIcon className="w-6 h-6 text-gray-500" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute z-50 top-16 left-0 w-full bg-white shadow-lg"
        >
          <ul className="flex flex-col items-start p-4">
            {navItems.map((item) => (
              <li
                key={item.name}
                className={`py-2 flex items-center justify-between w-full ${activeItem === item.name
                  ? 'border-b-4 border-[#616161] text-[#616161]'
                  : ''
                  }`}
              >
                {item.path ? (
                  <NavLink
                    to={item.path}
                    className="w-full text-left flex items-center"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.name}

                    {/* Red Dot on Listings */}
                    {item.name === 'Listings' && (
                      <span className="ml-2 bg-red-500 h-2 w-2 rounded-full inline-block"></span>
                    )}
                  </NavLink>
                ) : (
                  <button
                    className="w-full text-left flex items-center"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </nav>
  );
};

const UserModal = ({
  showUserModal,
  setShowUserModal,
}) => {

  return (
    <AnimatePresence>
      {showUserModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowUserModal(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="  shadow-xl cursor-default"
          >
            <UserForm />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default NavBar;
