import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiBell, FiLock, FiMonitor, FiSave, FiSettings, FiShield, FiUser, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import type { UserPreferences } from '../types';

const SETTINGS_STORAGE_KEY = 'smartCampusSettings';

const Settings: React.FC = () => {
  const { user, loadUser, isAdmin, isTechnician, deleteAccount } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

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
      toast.success('Your account has been deleted permanently from the system');
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setConfirmDeleteAccount(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FiSettings className="text-blue-600" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile, security, and personal preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profileName">Full Name</Label>
                  <Input
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    className="bg-muted text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <FiSave />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FiLock className="text-orange-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                  <FiShield />
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FiBell className="text-green-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: 'emailAlerts', label: 'Email alert summaries' },
                  { key: 'ticketAlerts', label: 'Ticket status reminders' },
                  { key: 'bookingAlerts', label: 'Booking updates' },
                ].map((item) => (
                  <Label key={item.key} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer font-normal hover:bg-accent transition-colors">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={preferences[item.key as keyof typeof preferences]}
                      onChange={() => togglePreference(item.key as keyof typeof preferences)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Label>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Display Settings</h3>
                <Label className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer font-normal hover:bg-accent transition-colors">
                  <span className="text-sm text-foreground">Compact dashboard mode</span>
                  <input
                    type="checkbox"
                    checked={preferences.compactMode}
                    onChange={() => togglePreference('compactMode')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </Label>
              </div>
              <Button
                onClick={handleSavePreferences}
                disabled={savingPreferences}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <FiSave />
                {savingPreferences ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <FiAlertCircle className="text-red-600" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  onClick={triggerDeleteAccount}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  <FiTrash2 />
                  Delete My Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white border-0 shadow-md">
            <CardContent className="p-5">
              <h3 className="font-semibold text-lg">Account Snapshot</h3>
              <p className="text-sm mt-3 opacity-90">{user?.name}</p>
              <p className="text-xs opacity-80">{user?.email}</p>
              <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">{roleLabel}</p>
            </CardContent>
          </Card>

          {(isAdmin() || isTechnician()) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FiMonitor className="text-indigo-600" />
                  Admin Panel Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  {isAdmin() && <p>- Manage users, roles, bookings and tickets.</p>}
                  {isTechnician() && <p>- Track assigned tickets and update statuses.</p>}
                  <p>- Security best practice: rotate passwords regularly.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* Delete Account Confirmation Modal */}
      {confirmDeleteAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FiAlertCircle className="text-red-600 inline" /> Confirm Account Deletion
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Are you absolutely sure you want to delete your account? This action <strong>cannot be undone</strong> and you will lose all data associated with your profile.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteAccount(false)}
                className="hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white hover:bg-red-700 font-medium"
              >
                Yes, Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
