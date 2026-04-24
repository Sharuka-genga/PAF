import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiShield, FiSearch, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { User, Role } from '../../types';
import AdminLayout from '../../components/layouts/AdminLayout';
import PremiumTopbar from '../../components/ui/PremiumTopbar';

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [editingDetails, setEditingDetails] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const allRoles: Role[] = ['USER', 'ADMIN', 'TECHNICIAN'];

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRoles = async (userId: string) => {
    try {
      await adminAPI.updateUserRoles(userId, selectedRoles);
      toast.success('User roles updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update roles');
    }
  };

  const handleUpdateUserDetails = async () => {
    if (!editingDetails) return;
    try {
      await adminAPI.updateUser(editingDetails.id, {
        name: editingDetails.name,
        email: editingDetails.email
      });
      toast.success('User details updated successfully!');
      setEditingDetails(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user details');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.info('Use "Delete My Account" from your profile menu to remove your own account.');
      return;
    }

    setConfirmDelete(targetUser);
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      await adminAPI.deleteUser(confirmDelete.id);
      toast.success(`User account for ${confirmDelete.name || confirmDelete.email} has been deleted successfully!`);
      setConfirmDelete(null);
      if (editingUser?.id === confirmDelete.id) {
        setEditingUser(null);
      }
      if (editingDetails?.id === confirmDelete.id) {
        setEditingDetails(null);
      }
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const roleColor = (role: string) => {
    const colors: Record<string, string> = {
      USER: 'bg-blue-100 text-blue-700 border border-blue-200',
      ADMIN: 'bg-red-100 text-red-700 border border-red-200',
      TECHNICIAN: 'bg-green-100 text-green-700 border border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const filteredUsers = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
          {/* Topbar */}
          <PremiumTopbar 
            title="User Management"
            subtitle="Manage user roles and permissions"
          />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto">
            {/* Search */}
            <div className="relative mb-6">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="input-white w-full pl-12 pr-4 py-3 text-base"
              />
            </div>

            {/* Users Table */}
            <div className="glass-card-white-strong rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Roles</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        {editingDetails?.id === user.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`name-${user.id}`} className="text-xs text-gray-600 font-medium">Name</Label>
                              <Input
                                id={`name-${user.id}`}
                                type="text"
                                value={editingDetails.name}
                                onChange={(e) => setEditingDetails({...editingDetails, name: e.target.value})}
                                className="text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`email-${user.id}`} className="text-xs text-gray-600 font-medium">Email</Label>
                              <Input
                                id={`email-${user.id}`}
                                type="email"
                                value={editingDetails.email}
                                onChange={(e) => setEditingDetails({...editingDetails, email: e.target.value})}
                                className="text-sm mt-1"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {user.provider || 'LOCAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles?.map(role => (
                            <span key={role} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(role)}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {editingDetails?.id === user.id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={handleUpdateUserDetails}
                                className="bg-green-600 hover:bg-green-700 text-white h-8 gap-1.5 px-3 rounded-lg font-medium"
                              >
                                <FiSave className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Save</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingDetails(null)}
                                className="h-8 gap-1.5 px-3 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
                              >
                                <FiX className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Cancel</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDetails(user)}
                                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 px-2.5 rounded-lg font-medium"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                <span className="text-xs font-semibold hidden md:inline">Details</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingUser(user); setSelectedRoles([...(user.roles || [])]); }}
                                className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 px-2.5 rounded-lg font-medium"
                              >
                                <FiShield className="w-4 h-4" />
                                <span className="text-xs font-semibold hidden md:inline">Roles</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 px-2.5 rounded-lg font-medium"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span className="text-xs font-semibold hidden md:inline">Delete</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </main>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card-white-strong rounded-2xl p-6 w-full max-w-md border border-[rgba(0,0,0,0.08)] shadow-lg">
            <h2 className="text-lg font-bold text-gray-900">Edit Roles</h2>
            <p className="text-sm text-gray-500 mt-1">{editingUser.name} ({editingUser.email})</p>

            <div className="mt-4 space-y-2">
              {allRoles.map(role => (
                <label key={role} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(role)}`}>{role}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => handleUpdateRoles(editingUser.id)}
                disabled={selectedRoles.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">
                Save Changes
              </button>
              <button onClick={() => setEditingUser(null)}
                className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card-white-strong rounded-2xl p-6 w-full max-w-md border border-[rgba(0,0,0,0.08)] shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the account for <strong>{confirmDelete.name || confirmDelete.email}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 font-medium"
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border-gray-300 py-2 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
