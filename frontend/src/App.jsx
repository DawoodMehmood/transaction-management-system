import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Calendar from './Page/Calendar/index.jsx';
import Settings from './Page/Settings/index.jsx';
import Listing from './Page/Listings/Listings.jsx';
import LoginSignUpScreen from './Page/Login/LoginSignUpScreen.jsx';
import Index from './Page/Steper/index.jsx';
import { ToastContainer } from 'react-toastify';
import PrivateRoute from './PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<LoginSignUpScreen />} />

          {/* Private routes */}
          <Route
            path="/Transactions"
            element={<PrivateRoute element={<Listing />} />}
          />
          <Route
            path="/Calendars"
            element={<PrivateRoute element={<Calendar />} />}
          />
          <Route
            path="/Settings"
            element={<PrivateRoute element={<Settings />} />}
          />
          <Route
            path="/StepperSection"
            element={<PrivateRoute element={<Index />} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
