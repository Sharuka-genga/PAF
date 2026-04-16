import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" richColors />
        
        {/* Navigation Bar */}
        <nav className="border-b bg-white px-6 py-4 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="text-2xl font-bold text-indigo-600">
              Smart Campus
            </div>
            <div className="flex items-center space-x-6">
              <span className="font-medium text-indigo-600 border-b-2 border-indigo-600 pb-1">
                Bookings
              </span>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="mx-auto max-w-7xl p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/bookings" replace />} />
            <Route path="/bookings" element={<BookingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
