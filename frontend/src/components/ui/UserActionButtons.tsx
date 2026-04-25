import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiAlertCircle, FiGrid } from 'react-icons/fi';

const UserActionButtons: React.FC = () => {
  const actions = [
    {
      title: 'New Booking',
      description: 'Reserve a study room or equipment',
      icon: <FiCalendar className="w-8 h-8" />,
      link: '/bookings/create'
    },
    {
      title: 'Report Incident',
      description: 'Report a facility or technical issue',
      icon: <FiAlertCircle className="w-8 h-8" />,
      link: '/tickets/create'
    },
    {
      title: 'Browse Resources',
      description: 'Explore available campus facilities',
      icon: <FiGrid className="w-8 h-8" />,
      link: '/resources'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => (
        <Link key={action.title} to={action.link} className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[#7C3AED]/20 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] rounded-xl flex items-center justify-center border border-[#7C3AED]/10 group-hover:bg-[#7C3AED] group-hover:text-white transition-all duration-500 shadow-sm">
              {React.cloneElement(action.icon as React.ReactElement, { className: 'w-6 h-6' })}
            </div>
            
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">{action.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{action.description}</p>
            </div>

            <div className="text-[#7C3AED] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserActionButtons;
