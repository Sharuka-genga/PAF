import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiShield, FiSearch, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { User, Role } from '../../types';

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
      USER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-red-100 text-red-800',
      TECHNICIAN: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage user roles and permissions</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingDetails?.id === user.id ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`name-${user.id}`} className="text-xs text-gray-600">Name</Label>
                        <Input
                          id={`name-${user.id}`}
                          type="text"
                          value={editingDetails.name}
                          onChange={(e) => setEditingDetails({...editingDetails, name: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${user.id}`} className="text-xs text-gray-600">Email</Label>
                        <Input
                          id={`email-${user.id}`}
                          type="email"
                          value={editingDetails.email}
                          onChange={(e) => setEditingDetails({...editingDetails, email: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{user.provider || 'local'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map(role => (
                      <span key={role} className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor(role)}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-3">
                    {editingDetails?.id === user.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={handleUpdateUserDetails}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 gap-1"
                        >
                          <FiSave className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Save</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDetails(null)}
                          className="h-8 gap-1 text-gray-600"
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
                          className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 px-2.5"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span className="text-xs font-semibold hidden md:inline">Details</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingUser(user); setSelectedRoles([...(user.roles || [])]); }}
                          className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 px-2.5"
                        >
                          <FiShield className="w-4 h-4" />
                          <span className="text-xs font-semibold hidden md:inline">Roles</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 px-2.5"
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
          <div className="text-center py-8 text-gray-400">No users found</div>
        )}
      </div>

      {/* Edit Roles Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900">Edit Roles</h2>
            <p className="text-sm text-gray-500 mt-1">{editingUser.name} ({editingUser.email})</p>

            <div className="mt-4 space-y-2">
              {allRoles.map(role => (
                <label key={role} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${roleColor(role)}`}>{role}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => handleUpdateRoles(editingUser.id)}
                disabled={selectedRoles.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Save Changes
              </button>
              <button onClick={() => setEditingUser(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the account for <strong>{confirmDelete.name || confirmDelete.email}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
