import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Settings, Zap, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const navigate = useNavigate();
  
  // Get user from localStorage safely
  const userString = localStorage.getItem('user');
  const user = userString && userString !== 'undefined' ? JSON.parse(userString) : { name: 'User', email: 'user@example.com' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      isActive 
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm" 
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <div className="w-[250px] fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-blue-500/20 shadow-lg">
          <Zap size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Reality Check</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" className={navLinkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/analytics" className={navLinkClass}>
          <BarChart3 size={20} />
          Analytics
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-2 overflow-hidden">
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400 uppercase">
            {user.name?.substring(0, 2) || 'US'}
          </div>
          <div className="text-sm truncate">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 mt-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
