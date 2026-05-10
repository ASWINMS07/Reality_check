import React, { useState, useEffect } from 'react';
import { updateUser, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, User, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Settings() {
  // Load user from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(storedUser.name || '');
  const [email] = useState(storedUser.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const { user } = await updateUser({ name });
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Profile updated successfully');
      // Dispatch custom event to update sidebar
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    setLoadingSecurity(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoadingSecurity(false);
    }
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto min-h-screen w-full transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loadingProfile}
              className="h-[46px] px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingProfile ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Appearance Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 max-w-md">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDarkMode ? 'Currently using navy/dark theme' : 'Currently using clean/light theme'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSecurity}
              className="h-[46px] px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl transition-all shadow-sm focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingSecurity ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
