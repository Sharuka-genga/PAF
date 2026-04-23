import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiGrid, FiCalendar, FiAlertCircle, FiLogOut, FiX, FiMenu, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, bookingAPI, ticketAPI, resourceAPI, notificationAPI } from '../../services/api';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

const PremiumSidebar: React.FC = () => {
  const { user, logout } = useAuth();
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
        const results = await Promise.allSettled([
          adminAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
          bookingAPI.getAll({}).catch(() => ({ data: { data: [] } })),
          ticketAPI.getAll({}).catch(() => ({ data: { data: [] } })),
          resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
          notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } }))
        ]);

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
  }, []);

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
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
            {!isCollapsed ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center mr-3 shadow-glow-purple">
                  <FiShield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Smart Campus Hub</h2>
                  <p className="text-[#9CA3AF] text-xs">Student Portal</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center mx-auto shadow-glow-purple">
                <FiShield className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-[#9CA3AF] hover:text-white p-2 rounded-xl hover:bg-[rgba(124,58,237,0.1)] transition-colors lg:hidden"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              {!isCollapsed && (
                <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-3 font-inter">Manage</p>
              )}
              {menuItems.slice(0, 5).map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className={`
                    sidebar-item-premium group
                    ${isActive(item.path) ? 'active' : ''}
                  `}
                >
                  <span className={`${isActive(item.path) ? 'text-white' : 'text-[#9CA3AF]'} group-hover:text-white transition-colors`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="text-white font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-[rgba(124,58,237,0.2)] text-[#A78BFA] text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>

            <div className="mb-4">
              {!isCollapsed && (
                <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-3 font-inter">Admin</p>
              )}
              {menuItems.slice(5).map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className={`
                    sidebar-item-premium group
                    ${isActive(item.path) ? 'active' : ''}
                  `}
                >
                  <span className={`${isActive(item.path) ? 'text-white' : 'text-[#9CA3AF]'} group-hover:text-white transition-colors`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-white font-medium">{item.title}</span>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-xl bg-[rgba(17,24,43,0.6)] border border-[rgba(255,255,255,0.08)]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#22D3EE] via-[#10B981] to-[#F97316] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-[#9CA3AF] text-xs truncate">
                      {user?.email || 'admin@campus.edu'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full sidebar-item-premium group hover:bg-[rgba(239,68,68,0.1)]"
                >
                  <FiLogOut className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#EF4444]" />
                  <span className="text-white font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#22D3EE] via-[#10B981] to-[#F97316] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-3 rounded-xl hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                >
                  <FiLogOut className="w-5 h-5 text-[#9CA3AF] hover:text-[#EF4444]" />
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
