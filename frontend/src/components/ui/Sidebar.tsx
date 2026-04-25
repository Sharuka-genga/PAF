import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiGrid, FiCalendar, FiAlertCircle, FiBell, FiSettings, FiUsers, FiChevronDown, FiChevronRight, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import Logo from './Logo';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  badge?: number;
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isAdmin = user?.roles?.includes('ADMIN' as any) || user?.roles?.includes('SUPER_ADMIN' as any);

  const menuItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/dashboard'
    },
    {
      title: 'Resources',
      icon: <FiGrid className="w-5 h-5" />,
      path: '/resources'
    },
    {
      title: 'Bookings',
      icon: <FiCalendar className="w-5 h-5" />,
      children: [
        { title: 'My Bookings', icon: <FiCalendar className="w-4 h-4" />, path: '/bookings' },
        { title: 'New Booking', icon: <FiCalendar className="w-4 h-4" />, path: '/bookings/create' }
      ]
    },
    {
      title: 'Tickets',
      icon: <FiAlertCircle className="w-5 h-5" />,
      children: [
        { title: 'My Tickets', icon: <FiAlertCircle className="w-4 h-4" />, path: '/tickets' },
        { title: 'Report Issue', icon: <FiAlertCircle className="w-4 h-4" />, path: '/tickets/create' }
      ]
    },
    {
      title: 'Notifications',
      icon: <FiBell className="w-5 h-5" />,
      path: '/notifications',
      badge: 3 // This would come from notification count
    },
    {
      title: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      path: '/settings'
    },
    {
      title: 'Logout',
      icon: <FiLogOut className="w-5 h-5" />,
      path: '#logout'
    }
  ];

  const adminMenuItems: SidebarItem[] = [
    {
      title: 'Users',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/admin/users'
    },
    {
      title: 'Resources',
      icon: <FiGrid className="w-5 h-5" />,
      path: '/admin/resources'
    },
    {
      title: 'Bookings',
      icon: <FiCalendar className="w-5 h-5" />,
      path: '/admin/bookings'
    },
    {
      title: 'Tickets',
      icon: <FiAlertCircle className="w-5 h-5" />,
      path: '/admin/tickets'
    },
    {
      title: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      path: '/admin/settings'
    }
  ];

  const currentMenuItems = isAdmin && location.pathname.startsWith('/admin') ? adminMenuItems : menuItems;

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (children?: SidebarItem[]) => {
    if (!children) return false;
    return children.some(child => isActive(child.path));
  };

  const renderMenuItem = (item: SidebarItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = item.path ? isActive(item.path) : isParentActive(item.children);

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        toggleExpanded(item.title);
      } else if (item.path === '#logout') {
        e.preventDefault();
        logout();
      }
    };

    return (
      <div key={item.title} className="w-full">
        <Link
          to={item.path || '#'}
          onClick={handleClick}
          className={`
            flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg
            transition-all duration-200 group relative
            ${active 
              ? 'bg-primary/10 text-primary border-l-4 border-primary' 
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
            }
            ${isCollapsed && !hasChildren ? 'justify-center' : ''}
          `}
        >
          <div className={`flex items-center ${isCollapsed && !hasChildren ? 'justify-center' : ''}`}>
            <span className={`flex-shrink-0 ${active ? 'text-primary' : 'text-sidebar-foreground/70'}`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 truncate">{item.title}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center">
              {item.badge && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full mr-2">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <span className="text-sidebar-foreground/50">
                  {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                </span>
              )}
            </div>
          )}
        </Link>

        {hasChildren && !isCollapsed && item.children && (
          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
            <div className="pl-4 pr-2 py-1">
              {item.children.map((child) => (
                <Link
                  key={child.title}
                  to={child.path!}
                  className={`
                    flex items-center px-4 py-2 text-sm rounded-md mb-1 transition-all duration-200
                    ${isActive(child.path) 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }
                  `}
                >
                  <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-50"></span>
                  {child.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
        fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:relative lg:z-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border h-16">
            {!isCollapsed ? (
              <Logo size="md" />
            ) : (
              <div className="mx-auto">
                <Logo size="sm" className="!gap-0 [&>div:last-child]:hidden" />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-sidebar-foreground hover:text-sidebar-foreground/80 p-2 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {currentMenuItems.map(renderMenuItem)}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground font-medium text-sm truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sidebar-foreground/60 text-xs truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 shadow-md"
      >
        <FiMenu className="w-5 h-5 text-foreground" />
      </button>
    </>
  );
};

export default Sidebar;
