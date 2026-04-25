import React from 'react';
import { FiHome, FiUsers, FiGrid, FiCalendar, FiAlertCircle, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Admin Sidebar - Fixed positioning */}
        <div className="fixed left-0 top-0 h-screen w-72 bg-[#0A0F1D] border-r border-[rgba(255,255,255,0.08)] z-50">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-[rgba(255,255,255,0.08)]">
              <Logo variant="white" size="lg" />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-3 space-y-1">
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[2px] mb-4 px-4 mt-2">Management</p>
              {[
                { title: 'Dashboard', icon: <FiHome className="w-4 h-4" />, path: '/admin' },
                { title: 'Users', icon: <FiUsers className="w-4 h-4" />, path: '/admin/users' },
                { title: 'Resources', icon: <FiGrid className="w-4 h-4" />, path: '/admin/resources' },
                { title: 'Bookings', icon: <FiCalendar className="w-4 h-4" />, path: '/admin/bookings' },
                { title: 'Tickets', icon: <FiAlertCircle className="w-4 h-4" />, path: '/admin/tickets' },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 group font-semibold text-sm"
                >
                  <span className="text-gray-500 group-hover:text-[#A78BFA] transition-colors">
                    {item.icon}
                  </span>
                  {item.title}
                </a>
              ))}
            </nav>

            {/* Admin Profile Section */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-9 h-9 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mr-3 shadow-sm">
                  <span className="text-white font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-xs truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-gray-500 text-[10px] font-medium truncate tracking-tight">
                    {user?.email || 'admin@campus.edu'}
                  </p>
                </div>
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

export default AdminLayout;
