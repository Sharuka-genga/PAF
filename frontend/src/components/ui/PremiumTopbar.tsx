import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiBell, FiLogOut, FiCheck, FiX } from 'react-icons/fi';
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
    <header className="bg-white h-16 border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-8 h-full flex items-center justify-between">
        {/* Left side - Page title */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
        </div>

        {/* Right side - Search and notifications */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAdmin() ? "Search everything..." : "Quick search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] block w-64 pl-10 p-2 transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#7C3AED] rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {/* Notification Dropdown (simplified) */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-[1000] overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <p className="text-xs font-bold text-gray-900 mb-0.5">{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-xs">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-gray-700 font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-gray-900 font-bold text-xs">{user?.name || 'User'}</p>
              <p className="text-gray-400 text-[10px] font-medium">
                {user?.roles?.includes('ADMIN') ? 'Administrator' : 'Student'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PremiumTopbar;
