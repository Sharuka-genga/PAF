import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import { Toaster } from "sonner";
import { Button } from "./components/ui/button";
import { ShieldUser, User } from "lucide-react";

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync navigation with state
  useEffect(() => {
    if (isAdmin && location.pathname !== "/admin") {
      navigate("/admin");
    } else if (!isAdmin && location.pathname !== "/bookings") {
      navigate("/bookings");
    }
  }, [isAdmin, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      
      {/* Navigation Bar */}
      <nav className="border-b bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Smart Campus
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
              <Button 
                variant={!isAdmin ? "outline" : "ghost"} 
                size="sm" 
                onClick={() => setIsAdmin(false)}
                className={!isAdmin ? "bg-white shadow-sm" : "text-slate-500"}
              >
                <User className="size-4 mr-2" /> User View
              </Button>
              <Button 
                variant={isAdmin ? "outline" : "ghost"} 
                size="sm" 
                onClick={() => setIsAdmin(true)}
                className={isAdmin ? "bg-white shadow-sm text-indigo-600 border-indigo-200" : "text-slate-500"}
              >
                <ShieldUser className="size-4 mr-2" /> Admin View
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl p-6">
        <Routes>
          <Route path="/" element={<Navigate to={isAdmin ? "/admin" : "/bookings"} replace />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/admin" element={<AdminBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
