import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiAlertCircle, FiGrid } from 'react-icons/fi';

interface ActionButton {
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'orange' | 'cyan';
  link: string;
  count?: number;
}

interface PremiumActionButtonsProps {
  stats?: {
    users?: number;
    bookings?: number;
    tickets?: number;
    resources?: number;
  };
}

const PremiumActionButtons: React.FC<PremiumActionButtonsProps> = ({ stats }) => {
  const actionButtons: ActionButton[] = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'purple',
      link: '/admin/users',
      count: stats?.users
    },
    {
      title: 'View Bookings',
      description: 'Check all booking requests',
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'green',
      link: '/admin/bookings',
      count: stats?.bookings
    },
    {
      title: 'Handle Tickets',
      description: 'Resolve support tickets',
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'orange',
      link: '/admin/tickets',
      count: stats?.tickets
    },
    {
      title: 'Resources',
      description: 'Manage campus resources',
      icon: <FiGrid className="w-6 h-6" />,
      color: 'cyan',
      link: '/admin/resources',
      count: stats?.resources
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
      {actionButtons.map((button) => {
        const styles = getButtonStyles(button.color);
        
        return (
          <Link key={button.title} to={button.link} className="block group">
            <div 
              className={`
                relative p-6 rounded-2xl transition-all duration-300 transform
                group-hover:-translate-y-2 cursor-pointer
                ${styles.shadow} ${styles.hoverShadow}
              `}
              style={{ background: styles.background }}
            >
              {/* Glass overlay for depth */}
              <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 text-white relative">
                  {button.icon}
                  {button.count !== undefined && (
                    <div className="absolute -top-2 -right-2 bg-white text-gray-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-gray-100">
                      {button.count}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{button.title}</h3>
                  {button.description && (
                    <p className="text-white/80 text-sm">{button.description}</p>
                  )}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PremiumActionButtons;
