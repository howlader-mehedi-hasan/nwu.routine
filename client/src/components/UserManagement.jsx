import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, Clock, Plus, Edit, Key } from 'lucide-react';

export default function UserManagement() {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        username: '', email: '', password: '', role: 'Student', status: 'approved'
    });
    const [passwordData, setPasswordData] = useState({ password: '' });

    const roles = ['Super Admin', 'Admin', 'Moderator', 'Editor', 'Department Head', 'Faculty', 'Student', 'CR/ACR'];

    const loadUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const updateStatus = async (userId, status, role = null) => {
        try {
            const updates = { status };
            if (role) updates.role = role;

            await api.put(`/auth/users/${userId}/status`, updates);
            toast.success(`User ${status} successfully`);
            loadUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/users', formData);
            toast.success('User created successfully');
            setIsCreateModalOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'Student', status: 'approved' });
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${selectedUser.id}`, {
                username: formData.username,
                email: formData.email,
                role: formData.role,
                status: formData.status
            });
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${selectedUser.id}/password`, passwordData);
            toast.success('Password changed successfully');
            setIsPasswordModalOpen(false);
            setPasswordData({ password: '' });
            setSelectedUser(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({ username: user.username, email: user.email, role: user.role, status: user.status });
        setIsEditModalOpen(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordData({ password: '' });
        setIsPasswordModalOpen(true);
    };

    if (loading) return <div>Loading users...</div>;

    const pendingUsers = users.filter(u => u.status === 'pending');
    const approvedUsers = users.filter(u => u.status !== 'pending');

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Shield className="text-indigo-600 h-8 w-8" /> User Management
                    </h2>
                    <p className="text-muted-foreground">Manage registration requests, users, and permissions.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ username: '', email: '', password: '', role: 'Student', status: 'approved' });
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create User
                </button>
            </div>

            {/* Pending Requests */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                    <Clock className="h-5 w-5 text-amber-500" /> Pending Approval ({pendingUsers.length})
                </h3>
                {pendingUsers.length === 0 ? (
                    <p className="text-muted-foreground p-4">No pending requests.</p>
                ) : (
                    <div className="divide-y border rounded-lg">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/10">
                                <div className="mb-4 md:mb-0">
                                    <div className="font-bold text-lg">{user.username}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                    <div className="flex flex-col text-sm w-full md:w-48">
                                        <span className="text-muted-foreground text-xs mb-1">Requested Role:</span>
                                        <select
                                            className="px-2 py-1 border rounded bg-background"
                                            value={user.role}
                                            onChange={(e) => updateStatus(user.id, 'pending', e.target.value)}
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStatus(user.id, 'approved')}
                                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm transition"
                                        >
                                            <Check className="h-4 w-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(user.id, 'rejected')}
                                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
                                        >
                                            <X className="h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Users */}
            <div className="bg-card rounded-lg border shadow-sm p-4 mt-8">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">All Active Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground uppercase">
                            <tr>
                                <th className="px-4 py-3 border-b">Username</th>
                                <th className="px-4 py-3 border-b">Email</th>
                                <th className="px-4 py-3 border-b">Status</th>
                                <th className="px-4 py-3 border-b">Role</th>
                                <th className="px-4 py-3 border-b text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {approvedUsers.map(user => (
                                <tr key={user.id} className="hover:bg-muted/30 transition">
                                    <td className="px-4 py-3 font-medium">{user.username}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400">
                                        {user.role}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openPasswordModal(user)}
                                                className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition-colors"
                                                title="Change Password"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
                            <h3 className="text-lg font-semibold">Create New User</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-muted">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
                            <h3 className="text-lg font-semibold">Edit User: {selectedUser?.username}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    disabled={selectedUser?.role === 'Super Admin'}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {selectedUser?.role === 'Super Admin' && (
                                    <p className="text-xs text-amber-500 mt-1">Super Admin role cannot be changed directly here.</p>
                                )}
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-muted">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-card w-full max-w-sm rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-amber-500/10 dark:bg-amber-500/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" /> Change Password
                            </h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div className="text-sm text-muted-foreground mb-4">
                                Enter a new password for <span className="font-semibold text-foreground">{selectedUser?.username}</span>.
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-amber-500 focus:border-amber-500"
                                    value={passwordData.password}
                                    onChange={e => setPasswordData({ password: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-muted">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
