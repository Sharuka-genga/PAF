import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';
import { authAPI } from '../../services/api';

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    adminSecretKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!form.adminSecretKey) {
      toast.error('Admin secret key is required for admin registration');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        adminSecretKey: form.adminSecretKey
      });
      toast.success('Admin registration successful! Please login.');
      navigate('/login');
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
        {/* Animated Mesh Gradients (Admin Red Theme) */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-red-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/5 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-red-900/10 blur-[80px]"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <Logo variant="white" size="lg" />
          </div>
          
          <div>
            <h2 className="text-white text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Administrative <br />
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Control Center</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-md font-medium leading-relaxed">
              Register your institution and gain full control over campus resources, user permissions, and system monitoring.
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"></div> Authority</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"></div> Oversight</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"></div> Management</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-[#FDFBF7] py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Registration</h1>
            <p className="text-gray-500 font-medium">Setup your institutional administrator account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-gray-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-gray-300"
                  placeholder="admin@university.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Secret Key</label>
              <div className="relative group">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  type="password"
                  required
                  value={form.adminSecretKey}
                  onChange={(e) => setForm({ ...form, adminSecretKey: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-gray-300 shadow-sm shadow-red-50"
                  placeholder="Enter system secret key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-700 hover:shadow-red-200 transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98] mt-4"
            >
              {loading ? 'Authenticating...' : 'Establish Admin Access'}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-500 pt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
