import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiAlertCircle, FiGrid } from 'react-icons/fi';

const UserActionButtons: React.FC = () => {
  const actions = [
    {
      title: 'New Booking',
      description: 'Reserve a study room or equipment',
      icon: <FiCalendar className="w-8 h-8 text-white" />,
      color: 'purple',
      link: '/bookings/create'
    },
    {
      title: 'Report Incident',
      description: 'Report a facility or technical issue',
      icon: <FiAlertCircle className="w-8 h-8 text-white" />,
      color: 'orange',
      link: '/tickets/create'
    },
    {
      title: 'Browse Resources',
      description: 'Explore available campus facilities',
      icon: <FiGrid className="w-8 h-8 text-white" />,
      color: 'cyan',
      link: '/resources'
    }
  ];

  const getStyles = (color: string) => {
    switch (color) {
      case 'purple': return 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] shadow-glow-purple hover:shadow-[0_4px_32px_rgba(124,58,237,0.5)]';
      case 'orange': return 'from-[#F97316] via-[#EA580C] to-[#DC2626] shadow-glow-orange hover:shadow-[0_4px_32px_rgba(249,115,22,0.5)]';
      case 'cyan': return 'from-[#22D3EE] via-[#06B6D4] to-[#0891B2] shadow-glow-cyan hover:shadow-[0_4px_32px_rgba(34,211,238,0.5)]';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => (
        <Link key={action.title} to={action.link} className="group relative">
          <div 
            className={`
              relative h-48 p-8 rounded-3xl transition-all duration-500 overflow-hidden
              group-hover:-translate-y-2 flex flex-col items-center justify-center text-center gap-4
              bg-gradient-to-br ${getStyles(action.color)}
            `}
          >
            {/* Glass effect layers */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-3xl"></div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            
            {/* Content */}
            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-500">
              {action.icon}
            </div>
            
            <div className="relative z-10">
              <h3 className="text-white font-bold text-xl mb-1">{action.title}</h3>
              <p className="text-white/80 text-sm">{action.description}</p>
            </div>

            {/* Hover reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserActionButtons;
