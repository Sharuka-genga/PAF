import React, { useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiLock, FiMonitor, FiSave, FiSettings, FiShield, FiUser, FiAlertCircle, FiTrash2, FiCamera, FiUpload, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../components/layouts/UserLayout';
import PremiumTopbar from '../components/ui/PremiumTopbar';
import type { UserPreferences } from '../types';

const SETTINGS_STORAGE_KEY = 'smartCampusSettings';

const Settings: React.FC = () => {
  const { user, loadUser, isAdmin, isTechnician, deleteAccount } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [preferences, setPreferences] = useState<Omit<UserPreferences, 'userId'>>({
    emailAlerts: true,
    ticketAlerts: true,
    bookingAlerts: true,
    compactMode: false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user]);

  // Load preferences from backend on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await authAPI.getPreferences();
        if (res.data.data) {
          setPreferences({
            emailAlerts: res.data.data.emailAlerts ?? true,
            ticketAlerts: res.data.data.ticketAlerts ?? true,
            bookingAlerts: res.data.data.bookingAlerts ?? true,
            compactMode: res.data.data.compactMode ?? false,
          });
        }
      } catch (err) {
        // Fall back to localStorage if API fails
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          setPreferences((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore invalid local settings payload
        }
      }
    };
    loadPreferences();
  }, []);

  // Persist preferences to localStorage (backup)
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const roleLabel = useMemo(() => (user?.roles || []).join(', ') || 'USER', [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      await authAPI.uploadProfileImage(formData);
      await loadUser();
      toast.success('Profile image updated successfully');
      setProfileImage(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploadingImage(true);
      await authAPI.removeProfileImage();
      await loadUser();
      toast.success('Profile image removed successfully');
      setImagePreview('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      setSavingProfile(true);
      await authAPI.updateMe({ name: profileName.trim() });
      await loadUser();
      toast.success('Account profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setSavingPassword(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await authAPI.updatePreferences(preferences);
      toast.success('Preferences saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const triggerDeleteAccount = () => {
    setConfirmDeleteAccount(true);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Your account has been deleted permanently');
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setConfirmDeleteAccount(false);
    }
  };

  return (
    <UserLayout>
      <PremiumTopbar title="Account Settings" />
      
      <div className="max-w-none px-8 py-8 bg-[#FDFBF7] min-h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <FiUser className="text-[#7C3AED]" />
                <h2 className="font-bold text-gray-900">Profile Information</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-50">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center ring-4 ring-white shadow-md">
                        {imagePreview || user?.profilePicture ? (
                          <img 
                            src={imagePreview || (user?.profilePicture?.startsWith('http') ? user.profilePicture : `${window.location.origin}${user?.profilePicture}`)} 
                            alt="Profile" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-blue-600 flex items-center justify-center text-white text-3xl font-black">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-100 text-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all active:scale-90"
                      >
                        <FiCamera className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Profile Picture</h3>
                      <p className="text-xs text-gray-400 font-medium mb-3 tracking-tight">JPG, PNG or GIF. Max size 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {profileImage && (
                          <>
                            <button
                              type="button"
                              onClick={handleImageUpload}
                              disabled={uploadingImage}
                              className="px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl hover:bg-[#6D28D9] transition-all flex items-center gap-2"
                            >
                              <FiUpload className="w-3.5 h-3.5" />
                              {uploadingImage ? 'Uploading...' : 'Save Image'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProfileImage(null);
                                setImagePreview('');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {user?.profilePicture && !profileImage && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
                            className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        id="profileName"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        id="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile || uploadingImage}
                    className="flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#6D28D9] hover:shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {savingProfile ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <FiLock className="text-orange-600" />
                <h2 className="font-bold text-gray-900">Security & Password</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <FiShield className="w-4 h-4" />
                    {savingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <FiBell className="text-green-600" />
                <h2 className="font-bold text-gray-900">Notifications & Display</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'emailAlerts', label: 'Email Summaries', desc: 'Periodic activity reports via email' },
                    { key: 'ticketAlerts', label: 'Ticket Updates', desc: 'Instant alerts on support status' },
                    { key: 'bookingAlerts', label: 'Booking Reminders', desc: 'Reminders for room/equip bookings' },
                    { key: 'compactMode', label: 'Compact Dashboard', desc: 'Smaller UI elements for visibility' },
                  ].map((item) => (
                    <div 
                      key={item.key} 
                      onClick={() => togglePreference(item.key as keyof typeof preferences)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        preferences[item.key as keyof typeof preferences] 
                        ? 'border-[#7C3AED]/30 bg-purple-50/30' 
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="pr-4">
                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences[item.key as keyof typeof preferences] ? 'bg-[#7C3AED]' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences[item.key as keyof typeof preferences] ? 'left-6' : 'left-1'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="mt-8 flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {savingPreferences ? 'Saving...' : 'Save All Preferences'}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/30 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-50 bg-red-50/50 flex items-center gap-2">
                <FiAlertCircle className="text-red-600" />
                <h2 className="font-bold text-red-600">Danger Zone</h2>
              </div>
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <p className="text-sm font-bold text-gray-900">Delete Account Permanently</p>
                  <p className="text-xs text-gray-500 max-w-sm">Once you delete your account, all data will be purged. This action is not reversible.</p>
                </div>
                <button
                  onClick={triggerDeleteAccount}
                  className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-[0.95]"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Snapshot Column */}
          <aside className="space-y-6">
            <div className="bg-[#0A0F1D] rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7C3AED]/20 rounded-full blur-[60px]"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {roleLabel}
                  </div>
                  <FiActivity className="text-[#A78BFA] w-5 h-5" />
                </div>
                
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-blue-600 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center font-black text-xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{user?.name}</h3>
                    <p className="text-gray-400 text-sm font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Account Status</span>
                    <span className="text-green-400 font-black tracking-widest uppercase">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Member Since</span>
                    <span className="text-white font-black tracking-widest uppercase">APR 2026</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                    <FiCheckCircle className="text-[#A78BFA]" />
                    Two-Factor Auth Active
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                    <FiCheckCircle className="text-[#A78BFA]" />
                    Cloud Storage Synced
                  </div>
                </div>
              </div>
            </div>

            {(isAdmin() || isTechnician()) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiMonitor className="text-[#7C3AED]" />
                  <h3 className="font-bold text-gray-900 text-sm">Privileged Access</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-wider">
                    As an authorized staff member, you have access to system-wide logs and critical infrastructure management.
                  </div>
                  <a href="/admin" className="block text-center py-2 text-xs font-black text-[#7C3AED] hover:underline uppercase tracking-widest">
                    Enter Admin Workspace
                  </a>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {confirmDeleteAccount && (
        <div className="fixed inset-0 bg-[#0A0F1D]/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Wait, are you sure?</h2>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">
              Deleting your account is permanent and cannot be undone. All your bookings, tickets, and preferences will be permanently erased from the Smart Campus Hub.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setConfirmDeleteAccount(false)}
                className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                I Changed My Mind
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default Settings;
