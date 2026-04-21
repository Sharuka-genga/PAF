import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiCalendar, FiAlertCircle, FiMessageCircle } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const NOTIFICATION_CHANGE_EVENT = 'notifications:changed';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnread, setShowUnread] = useState(false);

  useEffect(() => { fetchNotifications(); }, [showUnread]);

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

  const emitNotificationChange = () => {
    window.dispatchEvent(new Event(NOTIFICATION_CHANGE_EVENT));
  };

  const handleMarkRead = async (id) => {
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

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      emitNotificationChange();
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationAPI.markAsRead(notif.id);
        emitNotificationChange();
      } catch (err) {
        // continue navigation even if mark-as-read fails
      }
    }

    if (notif.type?.startsWith('BOOKING_')) {
      navigate('/bookings');
      return;
    }

    if (notif.referenceId && notif.type?.startsWith('TICKET_')) {
      navigate(`/tickets/${notif.referenceId}`);
      return;
    }

    navigate('/notifications');
  };

  const getIcon = (type) => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated on your activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={showUnread ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnread(!showUnread)}
            className="rounded-full"
          >
            {showUnread ? 'Show All' : 'Unread Only'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12 shadow-sm border-dashed">
          <CardContent className="pt-6">
            <FiBell className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <Card key={notif.id} className={`shadow-sm overflow-hidden transition-colors hover:bg-accent/50 ${!notif.read ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardContent className="p-4 flex items-start space-x-4">
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className="mt-1"
                  title="Open related item"
                >
                  {getIcon(notif.type)}
                </button>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(notif)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
                  className="flex-1 text-left cursor-pointer outline-none"
                >
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleMarkRead(notif.id)}
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(notif.id)}
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
    </div>
  );
};

export default Notifications;

