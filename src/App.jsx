import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomeDashboard from './HomeDashboard';
import ReportIssue from './ReportIssue';
import AIAnalysis from './AIAnalysis';
import TrackStatus from './TrackStatus';
import AuthorityDashboard from './AuthorityDashboard';

// In-file ProtectedRoute component prevents any file-path import errors
function ProtectedRoute({ children, requiredRole }) {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Citizen Portal */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <HomeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <AIAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track"
          element={
            <ProtectedRoute requiredRole="CITIZEN">
              <TrackStatus />
            </ProtectedRoute>
          }
        />

        {/* Municipal Authority Portal */}
        <Route
          path="/authority"
          element={
            <ProtectedRoute requiredRole="OFFICER">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}