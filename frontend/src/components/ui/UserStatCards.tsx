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
      link: '/resources',
      delta: '+12%',
      trend: 'up'
    },
    {
      label: 'My Bookings',
      value: stats.bookings,
      icon: <FiCalendar className="w-6 h-6" />,
      link: '/bookings',
      delta: '+5%',
      trend: 'up'
    },
    {
      label: 'Open Tickets',
      value: stats.tickets,
      icon: <FiAlertCircle className="w-6 h-6" />,
      link: '/tickets',
      delta: '-3%',
      trend: 'down'
    },
    {
      label: 'Notifications',
      value: stats.notifications,
      icon: <FiBell className="w-6 h-6" />,
      link: '/notifications',
      delta: '+8%',
      trend: 'up'
    }
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => (
        <Link key={card.label} to={card.link} className="block group">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[#7C3AED]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center border border-[#7C3AED]/10 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors duration-300">
                {React.cloneElement(card.icon as React.ReactElement, { className: 'w-5 h-5' })}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${card.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {card.delta}
              </span>
              <span className="text-gray-400 text-[10px] font-medium">vs last month</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserStatCards;
