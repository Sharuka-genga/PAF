import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!form.name || form.name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side - Pure CSS Professional Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0A0F1D] overflow-hidden">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#7C3AED]/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[80px]"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <Logo variant="white" size="lg" />
          </div>
          
          <div>
            <h2 className="text-white text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Start Your <br />
              <span className="bg-gradient-to-r from-[#A78BFA] to-blue-400 bg-clip-text text-transparent">Academic Journey</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-md font-medium leading-relaxed">
              Join thousands of students and staff members in a smarter, more connected campus experience.
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full shadow-[0_0_8px_#7C3AED]"></div> Unified</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full shadow-[0_0_8px_#7C3AED]"></div> Efficient</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full shadow-[0_0_8px_#7C3AED]"></div> Collaborative</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#FDFBF7] py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 font-medium">Enter your details to get started with the hub.</p>
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
              <span className="px-4 bg-[#FDFBF7] text-gray-400">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="name@university.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#7C3AED] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-purple-100 hover:bg-[#6D28D9] hover:shadow-purple-200 transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="space-y-4 pt-6">
            <p className="text-center text-sm font-semibold text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#7C3AED] hover:text-[#6D28D9] font-bold transition-colors">
                Sign in instead
              </Link>
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Are you an institution?{' '}
                <Link to="/admin-register" className="text-gray-900 hover:text-[#7C3AED] transition-colors underline decoration-gray-300 underline-offset-4">
                  Register as Admin
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
