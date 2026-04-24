import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { bookingAPI, ticketAPI } from '../../services/api';
import type { Booking, Ticket } from '../../types';

const UserContentPanels: React.FC = () => {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [myIncidents, setMyIncidents] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, ticketsRes] = await Promise.allSettled([
          bookingAPI.getMyBookings(),
          ticketAPI.getMyTickets()
        ]);

        if (bookingsRes.status === 'fulfilled') {
          const all: Booking[] = bookingsRes.value.data?.data || bookingsRes.value.data || [];
          const sorted = [...all].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          setRecentBookings(sorted.slice(0, 3));
        }
        if (ticketsRes.status === 'fulfilled') {
          setMyIncidents(ticketsRes.value.data?.data?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Error fetching user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="flex items-center gap-4 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent My Bookings */}
      <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Recent My Bookings</h2>
            <p className="text-gray-600 text-sm">Your upcoming facility reservations</p>
          </div>
          <Link to="/bookings" className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors flex items-center gap-1 text-sm font-medium">
            View All <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentBookings.length === 0 ? (
            <div className="text-center py-10">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-100 group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 font-semibold truncate">{booking.resourceName || 'Resource Booking'}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Incidents */}
      <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">My Incidents</h2>
            <p className="text-gray-600 text-sm">Status of your reported issues</p>
          </div>
          <Link to="/tickets" className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors flex items-center gap-1 text-sm font-medium">
            View All <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {myIncidents.length === 0 ? (
            <div className="text-center py-10">
              <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reported incidents</p>
            </div>
          ) : (
            myIncidents.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-100 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  ticket.status === 'OPEN' ? 'bg-red-100 text-red-600' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <FiAlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 font-semibold truncate">{ticket.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserContentPanels;
