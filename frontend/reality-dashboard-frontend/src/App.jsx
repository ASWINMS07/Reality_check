import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Signup from './components/Signup';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex ${
      isAuthPage 
        ? 'bg-white dark:bg-slate-950' 
        : 'bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      <Toaster position="top-right" />
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ${!isAuthPage ? 'ml-[250px]' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;