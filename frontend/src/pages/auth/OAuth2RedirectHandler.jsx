import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setAuthToken(token).then(userData => {
        if (userData.roles.includes('ADMIN')) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        toast.success('Login successful!');
      }).catch(err => {
        toast.error('Authentication failed');
        navigate('/login', { replace: true });
      });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, setAuthToken]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default OAuth2RedirectHandler;
