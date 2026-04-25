import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiGrid, FiCalendar, FiAlertCircle, FiSettings, FiLogOut, FiX, FiMenu, FiShield, FiTrendingUp, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { adminAPI, bookingAPI, ticketAPI, resourceAPI, notificationAPI } from '../../services/api';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

const PremiumSidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState({
    users: 0,
    bookings: 0,
    tickets: 0,
    resources: 0,
    notifications: 0
  });

  useEffect(() => {
    const fetchSidebarCounts = async () => {
      try {
        const results = await Promise.allSettled(
          isAdmin()
            ? [
                adminAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
                bookingAPI.getAll({}).catch(() => ({ data: { data: [] } })),
                ticketAPI.getAll({}).catch(() => ({ data: { data: [] } })),
                resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
                notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } }))
              ]
            : [
                Promise.resolve({ data: { data: [] } }),
                bookingAPI.getMyBookings().catch(() => ({ data: { data: [] } })),
                ticketAPI.getMyTickets().catch(() => ({ data: { data: [] } })),
                resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
                notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } }))
              ]
        );

        const getValue = (result: any) => {
          if (result.status === 'fulfilled' && result.value?.data?.data) {
            if (typeof result.value.data.data === 'number') {
              return result.value.data.data;
            }
            return result.value.data.data.length || 0;
          }
          return 0;
        };

        setSidebarCounts({
          users: getValue(results[0]),
          bookings: getValue(results[1]),
          tickets: getValue(results[2]),
          resources: getValue(results[3]),
          notifications: (results[4] as any).value?.data?.data?.count || 0
        });
      } catch (err) {
        console.error('Sidebar counts fetch error:', err);
      }
    };

    fetchSidebarCounts();
  }, [isAdmin]);

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/admin'
    },
    {
      title: 'Users',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/admin/users',
      badge: sidebarCounts.users > 0 ? sidebarCounts.users : undefined
    },
    {
      title: 'Resources',
      icon: <FiGrid className="w-5 h-5" />,
      path: '/admin/resources',
      badge: sidebarCounts.resources > 0 ? sidebarCounts.resources : undefined
    },
    {
      title: 'Bookings',
      icon: <FiCalendar className="w-5 h-5" />,
      path: '/admin/bookings',
      badge: sidebarCounts.bookings > 0 ? sidebarCounts.bookings : undefined
    },
    {
      title: 'Tickets',
      icon: <FiAlertCircle className="w-5 h-5" />,
      path: '/admin/tickets',
      badge: sidebarCounts.tickets > 0 ? sidebarCounts.tickets : undefined
    }
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile backdrop */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-[#0A0F1D] border-r border-[rgba(255,255,255,0.08)] z-50 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-72'}
        lg:relative lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)] h-16">
            {!isCollapsed ? (
              <Logo variant="white" size="md" />
            ) : (
              <div className="mx-auto">
                <Logo size="sm" variant="white" className="!gap-0 [&>div:last-child]:hidden" />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-[#9CA3AF] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="mb-4">
              {!isCollapsed && (
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[2px] mb-4 px-4">Management</p>
              )}
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive(item.path) 
                      ? 'bg-[#7C3AED]/10 text-white border border-[#7C3AED]/20 shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <span className={`${isActive(item.path) ? 'text-[#A78BFA]' : 'text-gray-500'} group-hover:text-white transition-colors`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="font-semibold text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-gray-500 text-[10px] font-medium truncate tracking-tight">
                      {user?.email || 'admin@campus.edu'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-semibold text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-card-strong p-3 shadow-glow-purple"
      >
        <FiMenu className="w-5 h-5 text-white" />
      </button>
    </>
  );
};

export default PremiumSidebar;
