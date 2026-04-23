import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setAuthToken(token).then(userData => {
        if (!userData) {
          toast.error('Authentication failed');
          navigate('/login', { replace: true });
          return;
        }
        
        // Handle different role structures (Array or Object)
        const roles = userData.roles || [];
        const isAdmin = roles.includes('ADMIN') || roles.some((r: any) => r === 'ADMIN' || r === 'ROLE_ADMIN');
        
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        toast.success('Login successful!');
      }).catch(() => {
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      });
    } else {
      const errorStr = params.get('error');
      console.error("OAuth2Redirect error:", errorStr || "No parameter found", location.search);
      toast.error('Google login failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [navigate, setAuthToken, location.search]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-gray-600">Signing you in...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
