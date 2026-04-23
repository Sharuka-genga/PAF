import React from 'react';
import { FiShield, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PremiumHeroBanner: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="glass-card-white-strong relative overflow-hidden mb-8 border border-[rgba(124,58,237,0.2)] shadow-glow-purple">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(124,58,237,0.3)] via-[rgba(139,92,246,0.2)] to-[rgba(167,139,250,0.1)]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(34,211,238,0.1)] via-transparent to-transparent"></div>
      
      {/* Radial overlay for depth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(124,58,237,0.2)] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[rgba(34,211,238,0.15)] rounded-full blur-2xl"></div>
      
      {/* Content */}
      <div className="relative z-10 p-8 flex items-center justify-between">
        {/* Left side - Welcome message */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] rounded-2xl flex items-center justify-center shadow-glow-purple">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Admin'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Here's your comprehensive system overview for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}.
            </p>
          </div>
        </div>

        {/* Right side - System status */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <FiActivity className="w-5 h-5 text-[#10B981]" />
              <span className="text-gray-900 font-semibold">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-glow-green"></div>
              <span className="status-badge-premium-green">All Systems Online</span>
            </div>
          </div>
          
          <div className="glass-card-white p-4 border border-[rgba(16,185,129,0.2)] shadow-glow-green">
            <FiCheckCircle className="w-6 h-6 text-[#10B981]" />
          </div>
        </div>
      </div>

      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.05)] to-transparent opacity-50"></div>
    </div>
  );
};

export default PremiumHeroBanner;
