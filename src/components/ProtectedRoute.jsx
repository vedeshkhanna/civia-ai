import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('auth_user');

  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (err) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return <Navigate to="/login" replace />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'OFFICER' ? '/authority' : '/home'} replace />;
  }

  return children;
}