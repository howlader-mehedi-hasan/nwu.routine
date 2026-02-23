import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Check, X, Shield, Clock } from 'lucide-react';

export default function UserManagement() {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div>Loading users...</div>;

    const pendingUsers = users.filter(u => u.status === 'pending');
    const approvedUsers = users.filter(u => u.status !== 'pending');

    return (
        <div className="space-y-8 p-6">
            <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="text-indigo-600 h-8 w-8" /> User Management
                </h2>
                <p className="text-muted-foreground">Manage registration requests and user permissions.</p>
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
                                    <td className="px-4 py-3">
                                        <select
                                            className="px-2 py-1 border rounded bg-background"
                                            value={user.role}
                                            onChange={(e) => updateStatus(user.id, user.status, e.target.value)}
                                            disabled={user.role === 'Super Admin'} // Protect existing super admins here briefly
                                        >
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
