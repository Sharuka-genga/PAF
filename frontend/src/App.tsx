import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import TicketsPage from './pages/TicketsPage';
import ResourcesPage from './pages/ResourcesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminResourcesPage from './pages/admin/AdminResourcesPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TicketAdminPage from './pages/admin/TicketAdminPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import { Toaster } from 'sonner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect admin users away from user routes
  if (user && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

return isAdmin?.() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Simple placeholder for pages not yet built
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">This page is coming soon.</p>
      <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Dashboard</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Private User Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={<PrivateRoute><BookingPage /></PrivateRoute>}
          />
          <Route
            path="/bookings/create"
            element={<PrivateRoute><BookingPage /></PrivateRoute>}
          />
          <Route
            path="/my-bookings"
            element={<PrivateRoute><MyBookingsPage /></PrivateRoute>}
          />
          <Route
            path="/tickets"
            element={
              <PrivateRoute>
                <TicketsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/create"
            element={<PrivateRoute><ComingSoon title="Report Issue" /></PrivateRoute>}
          />
          <Route
            path="/tickets/:id"
            element={<PrivateRoute><ComingSoon title="Ticket Details" /></PrivateRoute>}
          />
          <Route
            path="/resources"
            element={
              <PrivateRoute>
                <ResourcesPage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={<AdminRoute><AdminBookingsPage /></AdminRoute>}
          />
          <Route
            path="/admin/tickets"
            element={<AdminRoute><TicketAdminPage /></AdminRoute>}
          />
          <Route
            path="/admin/resources"
            element={
              <AdminRoute>
                <AdminResourcesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                <Notifications />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <ComingSoon title="Admin Settings" />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
