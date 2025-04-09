import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Calendar from './Page/Calendar/index';
import Settings from './Page/Settings/index';
import Transactions from './Page/Home/Transactions';
import LoginSignUpScreen from './Page/Login/LoginSignUpScreen';
import Index from './Page/Steper/index';
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
            element={<PrivateRoute element={<Transactions />} />}
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
