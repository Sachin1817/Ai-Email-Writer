import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Pages
import Dashboard from "../pages/Dashboard";
import Generate from "../pages/Generate";
import History from "../pages/History";
import Favorites from "../pages/Favorites";
import Templates from "../pages/Templates";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Auth from "../pages/Auth";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-email-brand border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Auth />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="generate" element={<Generate />} />
        <Route path="history" element={<History />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="templates" element={<Templates />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-slate-800">
            <h1 className="text-9xl font-bold text-email-brand">404</h1>
            <p className="mt-4 text-xl font-semibold">Page Not Found</p>
            <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
            <a
              href="/dashboard"
              className="mt-6 rounded-lg bg-email-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-email-brand-hover shadow-lg"
            >
              Go Back Home
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
