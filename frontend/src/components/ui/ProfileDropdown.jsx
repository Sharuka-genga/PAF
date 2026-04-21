import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { Button } from './button';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* Profile Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles?.map(role => (
                    <span
                      key={role}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        role === 'TECHNICIAN' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
              onClick={() => setIsOpen(false)}
            >
              <FiSettings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
