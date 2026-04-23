import React from 'react';
import { FiHome, FiCalendar, FiAlertCircle, FiGrid, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* User Sidebar - Fixed positioning */}
        <div className="fixed left-0 top-0 h-screen w-72 lg:w-72 md:w-20 bg-[#0A0F1D] border-r border-[rgba(255,255,255,0.08)] z-50 transition-all duration-300">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center mx-auto shadow-glow-purple">
                  <FiShield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Smart Campus Hub</h2>
                  <p className="text-[#9CA3AF] text-xs">Student Portal</p>
                </div>
              </div>
            </div>
          </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
              <div className="space-y-1">
                <a href="/dashboard" className="sidebar-item-premium group">
                  <FiHome className="w-5 h-5" />
                  <span className="text-white font-medium">Dashboard</span>
                </a>
                <a href="/bookings" className="sidebar-item-premium group">
                  <FiCalendar className="w-5 h-5" />
                  <span className="text-white font-medium">My Bookings</span>
                </a>
                <a href="/tickets" className="sidebar-item-premium group">
                  <FiAlertCircle className="w-5 h-5" />
                  <span className="text-white font-medium">My Tickets</span>
                </a>
                <a href="/resources" className="sidebar-item-premium group">
                  <FiGrid className="w-5 h-5" />
                  <span className="text-white font-medium">Resources</span>
                </a>
                <a href="/settings" className="sidebar-item-premium group">
                  <FiSettings className="w-5 h-5" />
                  <span className="text-white font-medium">Settings</span>
                </a>
              </div>
            </nav>

            {/* User Profile Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center p-3 rounded-xl bg-[rgba(17,24,43,0.6)] border border-[rgba(255,255,255,0.08)]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#22D3EE] via-[#10B981] to-[#F97316] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-[#9CA3AF] text-xs truncate">
                    {user?.email || 'student@campus.edu'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Main Content Area - Properly offset for fixed sidebar */}
        <div className="flex-1 ml-72 lg:ml-72 md:ml-20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
