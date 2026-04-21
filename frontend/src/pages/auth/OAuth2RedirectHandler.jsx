import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OAuth2RedirectHandler = () => {
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
        if (userData.roles?.includes('ADMIN') || userData.roles?.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN')) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        toast.success('Login successful!');
      }).catch(() => {
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      });
    } else {
      const errorStr = params.get('error');
      console.error("OAuth2Redirect error:", errorStr || "No parameter found", location.search);
      toast.error('Google Authentication failed. Please check your backend configuration and credentials.');
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
