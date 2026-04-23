import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../services/api';
import { FiBell, FiCheckCircle, FiAlertCircle, FiMessageCircle, FiCalendar } from 'react-icons/fi';
import { Button } from './button';
import { toast } from 'react-toastify';
import type { Notification } from '../../types';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load unread count initially, and refresh notifications when opened
  const fetchNotifications = async () => {
    try {
      const [unreadRes, allRes] = await Promise.all([
        notificationAPI.getUnreadCount(),
        notificationAPI.getUnread() // Only fetch unread for the dropdown focus
      ]);
      setUnreadCount(unreadRes.data.data?.count ?? 0);
      setNotifications(allRes.data.data?.slice(0, 5) || []); 
    } catch (err) {
      console.error('Failed to fetch notifications dropdown', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleEvent = () => fetchNotifications();
    window.addEventListener('notifications:changed', handleEvent);
    
    // Polling every 30 seconds for real-world feel
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      window.removeEventListener('notifications:changed', handleEvent);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications([]);
      window.dispatchEvent(new Event('notifications:changed'));
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      if (!notif.read) {
        await notificationAPI.markAsRead(notif.id);
        window.dispatchEvent(new Event('notifications:changed'));
      }
      setIsOpen(false);

      if (notif.type?.startsWith('BOOKING_')) {
        navigate('/bookings');
      } else if (notif.type?.startsWith('TICKET_')) {
        // Since Notification interface doesn't have referenceId explicitly, 
        // we use any type here or cast if we know it exists in the data
        const referenceId = (notif as any).referenceId;
        if (referenceId) {
          navigate(`/tickets/${referenceId}`);
        } else {
          navigate('/notifications');
        }
      } else {
        navigate('/notifications');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_APPROVED': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'BOOKING_REJECTED': return <FiCalendar className="w-5 h-5 text-red-500" />;
      case 'TICKET_STATUS_CHANGED': return <FiAlertCircle className="w-5 h-5 text-blue-500" />;
      case 'TICKET_COMMENT': return <FiMessageCircle className="w-5 h-5 text-purple-500" />;
      default: return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) fetchNotifications();
        }}
        className="relative rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 w-10 h-10"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 max-w-[20px] max-h-[20px] px-1.5 py-0.5 right-1 inline-flex items-center justify-center text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500 flex flex-col items-center">
                <FiBell className="text-gray-300 w-8 h-8 mb-2" />
                No new notifications
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => { setIsOpen(false); navigate('/notifications'); }}>
            <span className="text-sm text-blue-600 font-medium">View all notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
