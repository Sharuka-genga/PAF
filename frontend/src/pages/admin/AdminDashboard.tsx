import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, bookingAPI, ticketAPI, resourceAPI, notificationAPI } from '../../services/api';
import AdminLayout from '../../components/layouts/AdminLayout';
import PremiumTopbar from '../../components/ui/PremiumTopbar';
import PremiumHeroBanner from '../../components/ui/PremiumHeroBanner';
import PremiumStatCards from '../../components/ui/PremiumStatCards';
import PremiumActionButtons from '../../components/ui/PremiumActionButtons';
import PremiumContentPanels from '../../components/ui/PremiumContentPanels';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, bookings: 0, tickets: 0, resources: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const results = await Promise.allSettled([
          adminAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
          bookingAPI.getAll({}).catch(() => ({ data: { data: [] } })),
          ticketAPI.getAll({}).catch(() => ({ data: { data: [] } })),
          resourceAPI.getAll().catch(() => ({ data: { data: [] } })),
          notificationAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } }))
        ]);

        const extractList = (result: any): any[] => {
          if (result.status !== 'fulfilled' || result.value?.data === undefined) {
            return [];
          }
          const payload = result.value.data;
          if (Array.isArray(payload)) {
            return payload;
          }
          return Array.isArray(payload?.data) ? payload.data : [];
        };

        const users = extractList(results[0]);
        const bookings = extractList(results[1]);
        const tickets = extractList(results[2]);
        const resources = extractList(results[3]);

        setStats({
          users: users.length,
          bookings: bookings.filter((b: any) => b.status === 'PENDING' || b.status === 'APPROVED').length,
          tickets: tickets.filter((t: any) => t.status === 'OPEN').length,
          resources: resources.length,
          notifications: (results[4] as any).value?.data?.data?.count || 0
        });
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Topbar */}
      <PremiumTopbar 
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Admin'}`}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
            {/* Hero Banner */}
            <PremiumHeroBanner />

            {/* Stat Cards */}
            <PremiumStatCards stats={stats} />

            {/* Action Buttons */}
            <PremiumActionButtons />

            {/* Content Panels */}
            <PremiumContentPanels />
          </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
