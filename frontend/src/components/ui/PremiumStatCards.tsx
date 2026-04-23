import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiAlertCircle, FiGrid, FiTrendingUp } from 'react-icons/fi';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'orange' | 'cyan';
  link: string;
  delta?: string;
  trend?: 'up' | 'down';
}

interface PremiumStatCardsProps {
  stats?: {
    users: number;
    bookings: number;
    tickets: number;
    resources: number;
    notifications: number;
  };
}

const PremiumStatCards: React.FC<PremiumStatCardsProps> = ({ stats }) => {
  const defaultStats = {
    users: 1,
    bookings: 0,
    tickets: 0,
    resources: 0,
    notifications: 0
  };

  const currentStats = stats || defaultStats;

  const statCards: StatCard[] = [
    {
      label: 'All Resources',
      value: currentStats.resources,
      icon: <FiGrid className="w-6 h-6" />,
      color: 'cyan',
      link: '/admin/resources',
      delta: '+12%',
      trend: 'up'
    },
    {
      label: 'Active Bookings',
      value: currentStats.bookings,
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'green',
      link: '/admin/bookings',
      delta: '+5%',
      trend: 'up'
    },
    {
      label: 'Open Tickets',
      value: currentStats.tickets,
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'orange',
      link: '/admin/tickets',
      delta: '-3%',
      trend: 'down'
    },
    {
      label: 'Total Users',
      value: currentStats.users,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'purple',
      link: '/admin/users',
      delta: '+8%',
      trend: 'up'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          iconBg: 'bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
          iconGlow: 'shadow-glow-purple',
          progressBg: 'bg-[rgba(124,58,237,0.2)]',
          progressLine: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]'
        };
      case 'green':
        return {
          iconBg: 'bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857]',
          iconGlow: 'shadow-glow-green',
          progressBg: 'bg-[rgba(16,185,129,0.2)]',
          progressLine: 'bg-gradient-to-r from-[#10B981] to-[#059669]'
        };
      case 'orange':
        return {
          iconBg: 'bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#DC2626]',
          iconGlow: 'shadow-glow-orange',
          progressBg: 'bg-[rgba(249,115,22,0.2)]',
          progressLine: 'bg-gradient-to-r from-[#F97316] to-[#EA580C]'
        };
      case 'cyan':
        return {
          iconBg: 'bg-gradient-to-br from-[#22D3EE] via-[#06B6D4] to-[#0891B2]',
          iconGlow: 'shadow-glow-cyan',
          progressBg: 'bg-[rgba(34,211,238,0.2)]',
          progressLine: 'bg-gradient-to-r from-[#22D3EE] to-[#06B6D4]'
        };
      default:
        return {
          iconBg: 'bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
          iconGlow: 'shadow-glow-purple',
          progressBg: 'bg-[rgba(124,58,237,0.2)]',
          progressLine: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => {
        const colors = getColorClasses(card.color);
        
        return (
          <Link key={card.label} to={card.link} className="block group">
            <div className="glass-card-white-strong p-6 border border-[rgba(0,0,0,0.08)] hover:border-[rgba(124,58,237,0.2)] transition-all duration-300 group-hover:transform group-hover:-translate-y-2">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 font-mono">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.iconGlow}`}>
                  {card.icon}
                </div>
              </div>

              {/* Delta Badge */}
              {card.delta && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <FiTrendingUp className={`${card.trend === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'} w-3 h-3`} />
                    <span className={`text-xs font-semibold ${card.trend === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {card.delta}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">vs last month</span>
                </div>
              )}

              {/* Progress Line */}
              <div className={`h-1 ${colors.progressBg} rounded-full overflow-hidden`}>
                <div className={`h-full ${colors.progressLine} rounded-full`} style={{ width: '75%' }}></div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PremiumStatCards;
