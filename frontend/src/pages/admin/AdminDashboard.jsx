import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, bookingAPI, ticketAPI, resourceAPI } from '../../services/api';
import { FiGrid, FiCalendar, FiAlertCircle, FiUsers, FiSettings } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ProfileDropdown from '../../components/ui/ProfileDropdown';
import NotificationDropdown from '../../components/ui/NotificationDropdown';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, bookings: 0, tickets: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          adminAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
          bookingAPI.getAll().catch(() => ({ data: { data: [] } })),
          ticketAPI.getAll().catch(() => ({ data: { data: [] } })),
          resourceAPI.getAll().catch(() => ({ data: { data: [] } }))
        ]);

        const getValue = (result) => {
          if (result.status === 'fulfilled' && result.value?.data?.data) {
            return result.value.data.data.length || 0;
          }
          return 0;
        };

        setStats({
          users: getValue(results[0]),
          bookings: getValue(results[1]),
          tickets: getValue(results[2]),
          resources: getValue(results[3])
        });
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: <FiUsers className="w-5 h-5" />, color: 'bg-blue-500', link: '/admin/users' },
    { label: 'Bookings', value: stats.bookings, icon: <FiCalendar className="w-5 h-5" />, color: 'bg-green-500', link: '/admin/bookings' },
    { label: 'Tickets', value: stats.tickets, icon: <FiAlertCircle className="w-5 h-5" />, color: 'bg-orange-500', link: '/admin/tickets' },
    { label: 'Resources', value: stats.resources, icon: <FiGrid className="w-5 h-5" />, color: 'bg-purple-500', link: '/admin/resources' },
  ];

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
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
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
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 rounded-2xl shadow-md text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-sm p-2 rounded-xl inline-flex"><FiUsers className="w-6 h-6 text-white"/></span> 
              Welcome Admin, {user?.name}!
            </h1>
            <p className="text-blue-100 opacity-90 text-sm mt-2 ml-[3.25rem]">Here is your comprehensive system overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
          </div>
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0"></div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild size="lg" className="h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/admin/users">
            <FiUsers className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Manage Users</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/admin/bookings">
            <FiCalendar className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Bookings</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/admin/tickets">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Tickets</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl justify-start space-x-3">
          <Link to="/admin/resources">
            <FiGrid className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Resources</span>
          </Link>
        </Button>
      </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
