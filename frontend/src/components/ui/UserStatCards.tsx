import React from 'react';
import { FiGrid, FiCalendar, FiAlertCircle, FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface StatCardProps {
  stats: {
    resources: number;
    bookings: number;
    tickets: number;
    notifications: number;
  };
}

const UserStatCards: React.FC<StatCardProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Available Resources',
      value: stats.resources,
      icon: <FiGrid className="w-6 h-6" />,
      color: 'cyan',
      link: '/resources',
      delta: '+12%',
      trend: 'up'
    },
    {
      label: 'My Bookings',
      value: stats.bookings,
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'green',
      link: '/bookings',
      delta: '+5%',
      trend: 'up'
    },
    {
      label: 'Open Tickets',
      value: stats.tickets,
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'orange',
      link: '/tickets',
      delta: '-3%',
      trend: 'down'
    },
    {
      label: 'Notifications',
      value: stats.notifications,
      icon: <FiBell className="w-6 h-6" />,
      color: 'purple',
      link: '/notifications',
      delta: '+8%',
      trend: 'up'
    }
  ];

  const getStyles = (color: string) => {
    switch (color) {
      case 'cyan': return 'from-[#22D3EE] via-[#06B6D4] to-[#0891B2] shadow-glow-cyan text-cyan-600';
      case 'green': return 'from-[#10B981] via-[#059669] to-[#047857] shadow-glow-green text-green-600';
      case 'orange': return 'from-[#F97316] via-[#EA580C] to-[#DC2626] shadow-glow-orange text-orange-600';
      case 'purple': return 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] shadow-glow-purple text-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => (
        <Link key={card.label} to={card.link} className="block group">
          <div className="glass-card-white-strong p-6 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg border border-[rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStyles(card.color).split(' shadow')[0]} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {card.delta}
              </span>
              <span className="text-gray-400 text-xs">vs last month</span>
            </div>

            {/* Bottom progress bar for visual flair */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getStyles(card.color).split(' shadow')[0]}`}
                style={{ width: '65%' }}
              ></div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserStatCards;
