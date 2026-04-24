import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRegister from './pages/auth/AdminRegister';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Dashboard from './pages/Dashboard';

// Booking & Admin Pages
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

// Resource Pages
import ResourcesPage from './pages/ResourcesPage';
import AdminResourcesPage from './pages/admin/AdminResourcesPage';

import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import TicketAdminPage from './pages/admin/TicketAdminPage';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect admin users away from user routes to their own dashboard
  if (user && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
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

  return isAdmin() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Placeholder for missing components from notifications branch
const ComingSoon = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-gray-500 mt-2">This feature is coming soon.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          
          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          
          {/* Booking Routes */}
          <Route path="/bookings" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
          <Route path="/bookings/create" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />

          {/* Resources Routes */}
          <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
          <Route path="/admin/resources" element={<AdminRoute><AdminResourcesPage /></AdminRoute>} />
          
          {/* Added from Notifications branch */}
          <Route path="/admin/notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><ComingSoon title="Admin - Tickets" /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><ComingSoon title="Admin Settings" /></AdminRoute>} />
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
            element={<AdminRoute><ComingSoon title="Admin - Bookings" /></AdminRoute>}
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
