import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiBell, FiLogOut, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, bookingAPI, ticketAPI, resourceAPI, notificationAPI } from '../../services/api';

interface PremiumTopbarProps {
  title: string;
  subtitle?: string;
  onSearchResults?: (results: any[]) => void;
}

const PremiumTopbar: React.FC<PremiumTopbarProps> = ({ title, subtitle, onSearchResults }) => {
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResults?.([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Search across multiple endpoints based on role
      const searchTasks = isAdmin() 
        ? [
            adminAPI.getAllUsers(),
            bookingAPI.getAll({}),
            ticketAPI.getAll({}),
            resourceAPI.getAll()
          ]
        : [
            Promise.resolve({ data: { data: [] } }), // Users not searchable by students
            bookingAPI.getMyBookings(),
            ticketAPI.getMyTickets(),
            resourceAPI.getAll()
          ];

      const [usersResponse, bookingsResponse, ticketsResponse, resourcesResponse] = await Promise.allSettled(searchTasks);

      const results: any[] = [];
      
      // Process users
      if (usersResponse.status === 'fulfilled' && usersResponse.value.data?.data) {
        const users = usersResponse.value.data.data
          .filter((user: any) => 
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3)
          .map((user: any) => ({
            type: 'user',
            id: user.id,
            title: user.name || user.username,
            subtitle: user.email,
            link: `/admin/users/${user.id}`,
            icon: 'user'
          }));
        results.push(...users);
      }
      
      // Process bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.data?.data) {
        const bookings = bookingsResponse.value.data.data
          .filter((booking: any) => 
            booking.resourceName?.toLowerCase().includes(query.toLowerCase()) ||
            booking.status?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3)
          .map((booking: any) => ({
            type: 'booking',
            id: booking.id,
            title: booking.resourceName,
            subtitle: booking.status,
            link: `/admin/bookings/${booking.id}`,
            icon: 'booking'
          }));
        results.push(...bookings);
      }
      
      // Process tickets
      if (ticketsResponse.status === 'fulfilled' && ticketsResponse.value.data?.data) {
        const tickets = ticketsResponse.value.data.data
          .filter((ticket: any) => 
            ticket.title?.toLowerCase().includes(query.toLowerCase()) ||
            ticket.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3)
          .map((ticket: any) => ({
            type: 'ticket',
            id: ticket.id,
            title: ticket.title || ticket.description,
            subtitle: ticket.status,
            link: `/admin/tickets/${ticket.id}`,
            icon: 'ticket'
          }));
        results.push(...tickets);
      }
      
      // Process resources
      if (resourcesResponse.status === 'fulfilled' && resourcesResponse.value.data?.data) {
        const resources = resourcesResponse.value.data.data
          .filter((resource: any) => 
            resource.name?.toLowerCase().includes(query.toLowerCase()) ||
            resource.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3)
          .map((resource: any) => ({
            type: 'resource',
            id: resource.id,
            title: resource.name,
            subtitle: resource.type || 'Resource',
            link: `${isAdmin() ? '/admin' : ''}/resources/${resource.id}`,
            icon: 'resource'
          }));
        results.push(...resources);
      }
      
      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onSearchResults?.([]);
    } finally {
      setIsSearching(false);
    }
  }, [onSearchResults]);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch real notifications from API
        const response = await notificationAPI.getUnread();
        const notificationsData = response.data?.data || [];
        
        // If no real data, use mock data as fallback
        if (notificationsData.length === 0) {
          const mockNotifications = [
            {
              id: '1',
              title: 'Booking confirmed',
              message: 'Your booking for Study Room A has been approved',
              type: 'booking',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
            },
            {
              id: '2',
              title: 'Ticket update',
              message: 'Your support ticket has been resolved',
              type: 'ticket',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
            },
            {
              id: '3',
              title: 'System announcement',
              message: 'New resources available in the library',
              type: 'system',
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
            }
          ];
          
          setNotifications(mockNotifications);
          const unreadCount = mockNotifications.filter(n => !n.read).length;
          setNotificationCount(unreadCount);
        } else {
          setNotifications(notificationsData);
          const unreadCount = notificationsData.filter(n => !n.read).length;
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Set empty state on error
        setNotifications([]);
        setNotificationCount(0);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotificationCount(0);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'ticket': return 'bg-orange-100 text-orange-600';
      case 'system': return 'bg-purple-100 text-purple-600';
      case 'booking': return 'bg-green-100 text-green-600';
      case 'security': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <header className="glass-card-white-strong h-20 mb-6 border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left side - Page title and subtitle */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Right side - Search and notifications */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAdmin() ? "Search users, tickets, resources..." : "Search bookings, tickets, resources..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-white w-64 pl-10"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            
            {/* Search Results Dropdown */}
            {(searchQuery && searchResults.length > 0) && (
              <div className="absolute top-full mt-2 w-64 glass-card-white-strong border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg z-[1000] max-h-80 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-gray-500 font-medium mb-2 px-2">Search Results</p>
                  {searchResults.map((result, index) => (
                    <a
                      key={`${result.type}-${result.id}-${index}`}
                      href={result.link}
                      className="block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.type === 'user' ? 'bg-blue-100 text-blue-600' :
                          result.type === 'ticket' ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {result.type === 'user' ? 'U' : result.type === 'ticket' ? 'T' : 'R'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* No Results */}
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full mt-2 w-64 glass-card-white-strong border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg z-[1000]">
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for users, tickets, or resources</p>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isSearching && (
              <div className="absolute top-full mt-2 w-64 glass-card-white-strong border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg z-[1000]">
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Searching...</p>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="glass-card-white p-3 hover:bg-[rgba(124,58,237,0.05)] transition-all duration-250 group relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#F97316] to-[#EF4444] text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-glow-orange">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full mt-2 w-80 glass-card-white-strong border border-[rgba(0,0,0,0.08)] rounded-xl shadow-lg z-[1000] max-h-96 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Notifications List */}
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationIcon(notification.type)}`}>
                            {notification.type === 'user' ? 'U' :
                             notification.type === 'ticket' ? 'T' :
                             notification.type === 'system' ? 'S' :
                             notification.type === 'booking' ? 'B' : 'A'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <FiCheck className="w-3 h-3 text-gray-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No notifications</p>
                      <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="p-3 border-t border-gray-200">
                  <Link 
                    to={isAdmin() ? "/admin/notifications" : "/notifications"} 
                    className="block w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#22D3EE] via-[#10B981] to-[#F97316]">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `${window.location.origin}${user.profilePicture}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-gray-900 font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-gray-600 text-xs">
                {user?.roles?.includes('ADMIN') ? 'Administrator' : 
                 user?.roles?.includes('TECHNICIAN') ? 'Technician' : 'Student'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-[rgba(239,68,68,0.1)] transition-all duration-250 group"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PremiumTopbar;
