// src/App.js

import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import './App.css';
import Calendar from './Page/Calendar/index.jsx';
import Listing from './Page/Listings/Listings.jsx'; // Correct path for Listings page
import LoginSignUpScreen from './Page/Login/LoginSignUpScreen.jsx';
import Index from './Page/Steper/index.jsx';
function App() {
  return (
    <Router>
      {/* <NavBar /> NavBar will be rendered on all pages */}
      <Routes>
        {/* <Route path="/" element={<Listing />} /> Define route with element */}
        <Route path='/' element={<LoginSignUpScreen />} />{' '}
        <Route path='/Transactions' element={<Listing />} />{' '}
        <Route path='/Calendars' element={<Calendar />} />{' '}
        <Route path='/StepperSection' element={<Index />} />{' '}
        {/* Route for Listings */}
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
