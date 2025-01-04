// src/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return user ? (
    Component
  ) : (
    <Navigate to="/" replace /> // Redirect to the login page
  );
};

export default PrivateRoute;
