import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import { FiGrid } from 'react-icons/fi';
import UserLayout from '../components/layouts/UserLayout';
import PremiumSidebar from '../components/ui/PremiumSidebar';
import PremiumTopbar from '../components/ui/PremiumTopbar';
import UserStatCards from '../components/ui/UserStatCards';
import UserActionButtons from '../components/ui/UserActionButtons';
import UserContentPanels from '../components/ui/UserContentPanels';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0, notifications: 0 });
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

        const getCount = (result: any) => {
          if (result.status === 'fulfilled' && result.value?.data?.data !== undefined) {
            return Array.isArray(result.value.data.data) ? result.value.data.data.length : 0;
          }
          return 0;
        };

        setStats({
          resources: getCount(results[0]),
          bookings: getCount(results[1]),
          tickets: results[2].status === 'fulfilled' ? (results[2].value.data?.data || []).filter((t: any) => t.status === 'OPEN').length : 0,
          notifications: (results[3] as any).value?.data?.data?.count || 0
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="flex">
          <PremiumSidebar />
          <div className="flex-1">
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserLayout>
      <PremiumTopbar 
        title="Student Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Student'}!`}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Hero Banner */}
            <div className="glass-card-white-strong relative overflow-hidden p-10 border border-[rgba(124,58,237,0.15)] shadow-glow-purple group">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.1)] via-transparent to-[rgba(34,211,238,0.1)]"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                    <FiGrid className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                      Welcome back, {user?.name || 'Student'}!
                    </h1>
                    <p className="text-gray-600 text-xl font-medium max-w-xl leading-relaxed">
                      All your campus resources and activities in one place. What would you like to do today?
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 glass-card-white p-6 border border-white/50 shadow-xl">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">System Status</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-gray-900 font-bold">All Systems Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <UserStatCards stats={stats} />

            {/* Action Buttons */}
            <UserActionButtons />

            {/* Content Panels */}
            <UserContentPanels />
          </main>
    </UserLayout>
  );
};

export default Dashboard;
