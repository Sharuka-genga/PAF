import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import { FiGrid, FiCalendar, FiAlertCircle, FiBell, FiPlus, FiArrowRight, FiSettings } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import ProfileDropdown from '../components/ui/ProfileDropdown';
import NotificationDropdown from '../components/ui/NotificationDropdown';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0, notifications: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
          bookingAPI.getMyBookings().catch(() => ({ data: { data: [] } })),
          ticketAPI.getMyTickets().catch(() => ({ data: { data: [] } })),
          notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } }))
        ]);

        const getValue = (result, isCount = false) => {
          if (result.status === 'fulfilled' && result.value?.data?.data) {
            return isCount ? (result.value.data.data.count || 0) : (result.value.data.data.length || 0);
          }
          return 0;
        };

        setStats({
          resources: getValue(results[0]),
          bookings: getValue(results[1]),
          tickets: getValue(results[2]),
          notifications: getValue(results[3], true)
        });
        
        setRecentBookings(results[1].status === 'fulfilled' ? (results[1].value.data?.data || []).slice(0, 5) : []);
        setRecentTickets(results[2].status === 'fulfilled' ? (results[2].value.data?.data || []).slice(0, 5) : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Resources', value: stats.resources, icon: <FiGrid className="w-5 h-5" />, color: 'bg-blue-500', link: '/resources' },
    { label: 'My Bookings', value: stats.bookings, icon: <FiCalendar className="w-5 h-5" />, color: 'bg-green-500', link: '/bookings' },
    { label: 'My Tickets', value: stats.tickets, icon: <FiAlertCircle className="w-5 h-5" />, color: 'bg-orange-500', link: '/tickets' },
    { label: 'Unread Alerts', value: stats.notifications, icon: <FiBell className="w-5 h-5" />, color: 'bg-purple-500', link: '/notifications' },
  ];

  const getBadgeProps = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'RESOLVED':
        return { variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' };
      case 'REJECTED':
        return { variant: 'destructive', className: '' };
      case 'PENDING':
      case 'IN_PROGRESS':
        return { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
      case 'OPEN':
        return { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600 text-white' };
      case 'CANCELLED':
      case 'CLOSED':
      default:
        return { variant: 'outline', className: 'text-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Smart Campus Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on campus today.</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} to={card.link} className="block group">
            <Card className="transition-all hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl text-white shadow-sm`}>
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Button asChild size="lg" className="h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/bookings/create">
            <FiPlus className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">New Booking</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/tickets/create">
            <FiPlus className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Report Issue</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/resources">
            <FiGrid className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Browse Resources</span>
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link to="/bookings">
                View all <FiArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No bookings yet</p>
            ) : (
              <div className="space-y-3 mt-2">
                {recentBookings.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.resourceName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{b.bookingDate} · {b.startTime} - {b.endTime}</p>
                    </div>
                    <Badge {...getBadgeProps(b.status)}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link to="/tickets">
                View all <FiArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No tickets yet</p>
            ) : (
              <div className="space-y-3 mt-2">
                {recentTickets.map(t => (
                  <Link key={t.id} to={`/tickets/${t.id}`} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent transition-colors block">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.category} · {t.priority}</p>
                    </div>
                    <Badge {...getBadgeProps(t.status)}>{t.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
};

export default Dashboard;

