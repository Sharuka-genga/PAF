import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { FiGrid, FiCalendar, FiAlertCircle, FiUsers, FiSettings } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ProfileDropdown from '../../components/ui/ProfileDropdown';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, bookings: 0, tickets: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await adminAPI.getAllUsers();
        const bookingsRes = await adminAPI.getAllBookings?.();
        const ticketsRes = await adminAPI.getAllTickets?.();
        const resourcesRes = await adminAPI.getAllResources?.();
        
        setStats({
          users: usersRes.data.data?.length || 0,
          bookings: bookingsRes.data.data?.length || 0,
          tickets: ticketsRes.data.data?.length || 0,
          resources: resourcesRes.data.data?.length || 0
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
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}! Here's your admin overview.</p>
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
