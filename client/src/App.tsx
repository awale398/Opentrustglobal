import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { BudgetDetails } from './pages/BudgetDetails';
import AboutUs from './pages/AboutUs';
import Pricing from './pages/Pricing';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <Login />
          )
        } />
        <Route path="/register" element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <Register />
          )
        } />

        {/* Protected routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Citizen routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets/:id"
          element={
            <ProtectedRoute>
              <BudgetDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App; 