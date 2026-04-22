import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import { FiGrid, FiCalendar, FiAlertCircle, FiBell, FiPlus, FiArrowRight } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Sidebar from '../components/ui/Sidebar';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import type { Booking, Ticket } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0, notifications: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
          bookingAPI.getMyBookings().catch(() => ({ data: { data: [] } })),
          ticketAPI.getMyTickets().catch(() => ({ data: { data: [] } })),
          notificationAPI.getUnreadCount().catch(() => ({ data: { data: 0 } }))
        ]);

        const getValue = (result: any, isCount = false) => {
          if (result.status === 'fulfilled' && result.value?.data?.data !== undefined) {
            return isCount ? (result.value.data.data || 0) : (result.value.data.data.length || 0);
          }
          return 0;
        };

        setStats({
          resources: getValue(results[0]),
          bookings: getValue(results[1]),
          tickets: getValue(results[2]),
          notifications: (results[3] as any).value?.data?.data?.count || 0
        });
        
        setRecentBookings(results[1].status === 'fulfilled' ? (results[1].value as any).data?.data?.slice(0, 5) || [] : []);
        setRecentTickets(results[2].status === 'fulfilled' ? (results[2].value as any).data?.data?.slice(0, 5) || [] : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Resources', value: stats.resources, icon: <FiGrid className="w-5 h-5" />, color: 'bg-purple-600', link: '/resources' },
    { label: 'My Bookings', value: stats.bookings, icon: <FiCalendar className="w-5 h-5" />, color: 'bg-green-600', link: '/bookings' },
    { label: 'My Tickets', value: stats.tickets, icon: <FiAlertCircle className="w-5 h-5" />, color: 'bg-amber-600', link: '/tickets' },
    { label: 'Unread Alerts', value: stats.notifications, icon: <FiBell className="w-5 h-5" />, color: 'bg-purple-600', link: '/notifications' },
  ];

  const getBadgeProps = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'RESOLVED':
        return { variant: 'default' as const, className: 'status-pill status-active' };
      case 'REJECTED':
        return { variant: 'destructive' as const, className: 'status-pill status-out-of-service' };
      case 'PENDING':
      case 'IN_PROGRESS':
        return { variant: 'secondary' as const, className: 'status-pill status-maintenance' };
      case 'OPEN':
        return { variant: 'default' as const, className: 'status-pill status-active' };
      case 'CANCELLED':
      case 'CLOSED':
      default:
        return { variant: 'outline' as const, className: 'status-pill text-muted-foreground border border-border' };
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
    <div className="flex min-h-screen bg-background font-body">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-foreground">Smart Campus Hub</h1>
              </div>
              <div className="flex items-center">
                <NotificationDropdown />
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
                  <p className="text-3xl font-bold text-foreground font-mono">{card.value}</p>
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
        <Button asChild size="lg" className="h-auto py-4 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all rounded-[12px] justify-start space-x-3">
          <Link to="/bookings/create">
            <FiPlus className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">New Booking</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all rounded-[12px] justify-start space-x-3">
          <Link to="/tickets/create">
            <FiPlus className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Report Issue</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="h-auto py-4 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all rounded-[12px] justify-start space-x-3">
          <Link to="/resources">
            <FiGrid className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-base">Browse Resources</span>
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 hover:bg-primary/10">
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
                  <div key={b.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.resourceName}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{(b as any).bookingDate} · {b.startTime} - {b.endTime}</p>
                    </div>
                    <Badge {...getBadgeProps(b.status)}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 hover:bg-primary/10">
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
                  <Link key={t.id} to={`/tickets/${t.id}`} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors block">
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
    </div>
  );
};

export default Dashboard;
