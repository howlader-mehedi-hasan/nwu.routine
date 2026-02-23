import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Student' });
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const roles = ['Super Admin', 'Admin', 'Moderator', 'Editor', 'Department Head', 'Faculty', 'Student', 'CR/ACR'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(formData.username, formData.password);
                toast.success('Logged in successfully');
                navigate('/');
            } else {
                const res = await register(formData);
                if (res.status === 'pending') {
                    toast.success('Registration successful! Please wait for a Super Admin to approve your account.');
                    setIsLogin(true); // Switch back to login
                } else {
                    toast.success('Registered successfully!');
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">{isLogin ? 'Sign In' : 'Register'}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isLogin ? 'Welcome back to NWU Routine' : 'Create an account to manage resources'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Requested Account Type</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md bg-transparent"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors"
                    >
                        {isLogin ? 'Sign In' : 'Request Account'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
