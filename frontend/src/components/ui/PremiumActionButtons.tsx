import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiAlertCircle, FiGrid } from 'react-icons/fi';

interface ActionButton {
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'orange' | 'cyan';
  link: string;
}

const PremiumActionButtons: React.FC = () => {
  const actionButtons: ActionButton[] = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'purple',
      link: '/admin/users'
    },
    {
      title: 'View Bookings',
      description: 'Check all booking requests',
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'green',
      link: '/admin/bookings'
    },
    {
      title: 'Handle Tickets',
      description: 'Resolve support tickets',
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'orange',
      link: '/admin/tickets'
    },
    {
      title: 'Resources',
      description: 'Manage campus resources',
      icon: <FiGrid className="w-6 h-6" />,
      color: 'cyan',
      link: '/admin/resources'
    }
  ];

  const getButtonStyles = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
          shadow: 'shadow-glow-purple',
          hoverShadow: 'hover:shadow-[0_4px_32px_rgba(124,58,237,0.5)]'
        };
      case 'green':
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
          shadow: 'shadow-glow-green',
          hoverShadow: 'hover:shadow-[0_4px_32px_rgba(16,185,129,0.5)]'
        };
      case 'orange':
        return {
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)',
          shadow: 'shadow-glow-orange',
          hoverShadow: 'hover:shadow-[0_4px_32px_rgba(249,115,22,0.5)]'
        };
      case 'cyan':
        return {
          background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 50%, #0891B2 100%)',
          shadow: 'shadow-glow-cyan',
          hoverShadow: 'hover:shadow-[0_4px_32px_rgba(34,211,238,0.5)]'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
          shadow: 'shadow-glow-purple',
          hoverShadow: 'hover:shadow-[0_4px_32px_rgba(124,58,237,0.5)]'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {actionButtons.map((button) => (
        <Link key={button.title} to={button.link} className="block group">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[#7C3AED]/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] rounded-xl flex items-center justify-center border border-[#7C3AED]/10 mb-4 transition-colors group-hover:bg-[#7C3AED] group-hover:text-white">
              {React.cloneElement(button.icon as React.ReactElement, { className: 'w-6 h-6' })}
            </div>
            
            <div>
              <h3 className="text-gray-900 font-bold text-sm mb-1">{button.title}</h3>
              {button.description && (
                <p className="text-gray-400 text-[10px] leading-relaxed font-medium">{button.description}</p>
              )}
            </div>

            <div className="mt-4 text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              Go to Page →
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PremiumActionButtons;
