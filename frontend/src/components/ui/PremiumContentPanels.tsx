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
      <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Users</h2>
            <p className="text-gray-600 text-sm">Latest registered users</p>
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
          {recentUsers.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-gray-600">No users yet</p>
            </div>
          ) : (
            recentUsers.map((user: User) => (
              <Link 
                key={user.id} 
                to={`/admin/users/${user.id}`}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                {/* User Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-blue">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 font-medium truncate">{user.name || 'Unknown User'}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    {user.email || 'No email'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {user.roles?.join(', ') || 'USER'}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Open Tickets Panel */}
      <div className="glass-card-weak p-6 border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Open Tickets</h2>
            <p className="text-gray-600 text-sm">Active support requests</p>
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
          {openTickets.length === 0 ? (
            <div className="text-center py-8">
              <FiAlertCircle className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-gray-600">No open tickets</p>
            </div>
          ) : (
            openTickets.map((ticket: Ticket) => (
              <Link 
                key={ticket.id} 
                to={`/admin/tickets/${ticket.id}`}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                {/* Ticket Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-orange">
                  <FiAlertCircle className="w-5 h-5 text-white" />
                </div>

                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900 font-medium truncate">{ticket.title || ticket.description || 'Support Ticket'}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.priority || 'MEDIUM'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">{ticket.category || 'General'}</span>
                    <span className="text-gray-500 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <FiMoreHorizontal className="w-4 h-4 text-[#9CA3AF]" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumContentPanels;
