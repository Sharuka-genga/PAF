import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'dark' }) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-16 w-auto'
  };

  const textColors = {
    dark: 'text-gray-900',
    light: 'text-gray-500',
    white: 'text-white'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${size === 'xl' ? 'w-16 h-16' : size === 'lg' ? 'w-10 h-10' : 'w-9 h-9'} relative group`}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-[#7C3AED] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
        
        {/* Shield Shape */}
        <div className="relative w-full h-full bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
          {/* Abstract Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '8px 8px' }}></div>
          
          {/* Logo Icon (graduation cap + digital shield) */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-1/2 h-1/2 text-white drop-shadow-sm"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>
      
      {size !== 'xl' && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight leading-none ${size === 'lg' ? 'text-xl' : 'text-lg'} ${textColors[variant]}`}>
            SMART<span className="text-[#7C3AED]">CAMPUS</span>
          </span>
          <span className={`text-[8px] uppercase font-bold tracking-[0.3em] leading-none mt-1 ${variant === 'white' ? 'text-purple-200' : 'text-gray-400'}`}>
            Operations Hub
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
