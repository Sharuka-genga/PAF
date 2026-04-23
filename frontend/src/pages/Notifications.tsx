import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import AdminLayout from '../components/layouts/AdminLayout';
import UserLayout from '../components/layouts/UserLayout';
import PremiumTopbar from '../components/ui/PremiumTopbar';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiCalendar, FiAlertCircle, FiMessageCircle } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { Notification } from '../types';

const NOTIFICATION_CHANGE_EVENT = 'notifications:changed';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnread, setShowUnread] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = showUnread
        ? await notificationAPI.getUnread()
        : await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [showUnread]);

  const emitNotificationChange = () => {
    window.dispatchEvent(new Event(NOTIFICATION_CHANGE_EVENT));
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      emitNotificationChange();
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      emitNotificationChange();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const triggerDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await notificationAPI.delete(confirmDeleteId);
      emitNotificationChange();
      fetchNotifications();
      toast.success('Notification deleted successfully');
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await notificationAPI.markAsRead(notif.id);
        emitNotificationChange();
      } catch (err) {
        // continue navigation even if mark-as-read fails
      }
    }

    const prefix = isAdmin() ? '/admin' : '';
    
    if (notif.type?.startsWith('BOOKING_')) {
      navigate(`${prefix}/bookings`);
      return;
    }

    const referenceId = (notif as any).referenceId;
    if (referenceId && notif.type?.startsWith('TICKET_')) {
      navigate(`${prefix}/tickets/${referenceId}`);
      return;
    }

    navigate(`${prefix}/notifications`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_APPROVED': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'BOOKING_REJECTED': return <FiCalendar className="w-5 h-5 text-red-500" />;
      case 'BOOKING_CANCELLED': return <FiCalendar className="w-5 h-5 text-orange-500" />;
      case 'TICKET_STATUS_CHANGED': return <FiAlertCircle className="w-5 h-5 text-blue-500" />;
      case 'TICKET_COMMENT': return <FiMessageCircle className="w-5 h-5 text-purple-500" />;
      case 'TICKET_ASSIGNED': return <FiAlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <FiBell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const Layout = isAdmin() ? AdminLayout : UserLayout;

  return (
    <Layout>
      <PremiumTopbar title="Notifications" subtitle="Stay updated on your activities" />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
            <p className="text-gray-600 mt-1">Manage your system alerts and updates</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={showUnread ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUnread(!showUnread)}
              className="rounded-xl px-4"
            >
              {showUnread ? 'Show All' : 'Unread Only'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-[#7C3AED] hover:text-[#6D28D9] hover:bg-[#7C3AED]/10 px-4"
            >
              <FiCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card className="glass-card-white shadow-sm border-dashed py-16 text-center">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">We'll notify you when something important happens.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <Card key={notif.id} className={`glass-card-white-strong shadow-sm overflow-hidden transition-all hover:shadow-md border border-[rgba(0,0,0,0.05)] ${!notif.read ? 'border-l-4 border-l-[#7C3AED]' : ''}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div 
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                      notif.type?.startsWith('BOOKING_') ? 'bg-green-100 text-green-600' :
                      notif.type?.startsWith('TICKET_') ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div
                    onClick={() => handleNotificationClick(notif)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#7C3AED] hover:bg-[#7C3AED]/10"
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as read"
                      >
                        <FiCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerDelete(notif.id);
                      }}
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="glass-card-white p-8 w-full max-w-sm shadow-2xl border border-[rgba(255,255,255,0.2)] scale-in-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Alert</h2>
              <p className="text-gray-600 mb-6 text-sm">
                This action cannot be undone. Are you sure?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
