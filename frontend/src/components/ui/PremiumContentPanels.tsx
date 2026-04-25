import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiAlertCircle, FiMoreHorizontal, FiExternalLink, FiUsers } from 'react-icons/fi';
import { adminAPI, bookingAPI, ticketAPI } from '../../services/api';
import type { Booking, Ticket, User } from '../../types';

const PremiumContentPanels: React.FC = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [usersResult, ticketsResult] = await Promise.allSettled([
          adminAPI.getAllUsers(),
          ticketAPI.getAll({})
        ]);

        const usersData = usersResult.status === 'fulfilled' ? (usersResult.value.data?.data || []) : [];
        const ticketsData = ticketsResult.status === 'fulfilled' ? (ticketsResult.value.data?.data || []) : [];
        
        setRecentUsers(usersData.slice(0, 5));
        setOpenTickets(ticketsData.filter((ticket: Ticket) => ticket.status === 'OPEN').slice(0, 5));
        
        if (usersResult.status === 'rejected' && ticketsResult.status === 'rejected') {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string, type: 'user' | 'ticket') => {
    if (type === 'user') {
      switch (status) {
        case 'active':
          return <span className="status-badge-premium-green">Active</span>;
        case 'inactive':
          return <span className="status-badge-premium-gray">Inactive</span>;
        default:
          return <span className="status-badge-premium-gray">Unknown</span>;
      }
    } else {
      switch (status) {
        case 'open':
          return <span className="status-badge-premium-red">Open</span>;
        case 'in-progress':
          return <span className="status-badge-premium-orange">In Progress</span>;
        case 'resolved':
          return <span className="status-badge-premium-green">Resolved</span>;
        default:
          return <span className="status-badge-premium-gray">Unknown</span>;
      }
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="status-badge-premium-red">Critical</span>;
      case 'high':
        return <span className="status-badge-premium-orange">High</span>;
      case 'medium':
        return <span className="status-badge-premium-green">Medium</span>;
      case 'low':
        return <span className="status-badge-premium-gray">Low</span>;
      default:
        return <span className="status-badge-premium-gray">Unknown</span>;
    }
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#7C3AED] to-[#8B5CF6]',
      'from-[#10B981] to-[#059669]',
      'from-[#F97316] to-[#EA580C]',
      'from-[#22D3EE] to-[#06B6D4]',
      'from-[#EC4899] to-[#BE185D]'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Panel Loading */}
        <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Users</h2>
              <p className="text-gray-600 text-sm">Latest user registrations</p>
            </div>
            <Link 
              to="/admin/users" 
              className="text-[#7C3AED] hover:text-gray-900 transition-colors flex items-center gap-1 text-sm"
            >
              View All
              <FiExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Tickets Panel Loading */}
        <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Open Tickets</h2>
              <p className="text-gray-600 text-sm">Recent support requests</p>
            </div>
            <Link 
              to="/admin/tickets" 
              className="text-[#7C3AED] hover:text-gray-900 transition-colors flex items-center gap-1 text-sm"
            >
              View All
              <FiExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Users Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Users</h2>
            <p className="text-gray-400 text-xs font-medium">Latest registered users</p>
          </div>
          <Link 
            to="/admin/users" 
            className="text-[#7C3AED] hover:text-[#6D28D9] transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
          >
            View All
            <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-1">
          {recentUsers.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No users yet</p>
            </div>
          ) : (
            recentUsers.map((user: User) => (
              <Link 
                key={user.id} 
                to={`/admin/users/${user.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                {/* User Icon */}
                <div className="w-9 h-9 bg-[#F5F3FF] text-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#7C3AED]/10 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                  <FiUsers className="w-4 h-4" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-900 font-bold text-sm truncate">{user.name || 'Unknown User'}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-100">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500 text-xs truncate font-medium">
                      {user.email || 'No email'}
                    </p>
                    <span className="text-gray-300">·</span>
                    <p className="text-gray-400 text-[10px] truncate uppercase font-bold tracking-tight">
                      {user.roles?.join(', ') || 'USER'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Open Tickets Panel */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Open Tickets</h2>
            <p className="text-gray-400 text-xs font-medium">Active support requests</p>
          </div>
          <Link 
            to="/admin/tickets" 
            className="text-[#7C3AED] hover:text-[#6D28D9] transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
          >
            View All
            <FiExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-1">
          {openTickets.length === 0 ? (
            <div className="text-center py-8">
              <FiAlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No open tickets</p>
            </div>
          ) : (
            openTickets.map((ticket: Ticket) => (
              <Link 
                key={ticket.id} 
                to={`/admin/tickets/${ticket.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                {/* Ticket Icon */}
                <div className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <FiAlertCircle className="w-4 h-4" />
                </div>

                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-900 font-bold text-sm truncate">{ticket.title || ticket.description || 'Support Ticket'}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      ticket.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                      ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {ticket.priority || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs font-medium">{ticket.category || 'General'}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <FiExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#7C3AED] transition-colors" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumContentPanels;
