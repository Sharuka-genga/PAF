import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import { FiGrid, FiCalendar } from 'react-icons/fi';
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
      />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Hero Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C3AED]/[0.02] rounded-full -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] rounded-xl flex items-center justify-center border border-[#7C3AED]/10 shadow-sm shrink-0">
                    <FiGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
                      Welcome back, {user?.name || 'Student'}!
                    </h1>
                    <p className="text-gray-500 text-sm font-normal max-w-lg">
                      Manage your campus resources, bookings, and support tickets from one central dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">System Status</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                      <span className="text-gray-700 text-sm font-semibold">All Systems Online</span>
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
