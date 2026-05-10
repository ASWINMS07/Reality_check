import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import { Target, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex-col justify-center items-center p-12 text-white">
        <div className="bg-white/20 p-4 rounded-3xl mb-8 backdrop-blur-sm">
          <Target size={64} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Reality Check</h1>
        <p className="text-lg text-blue-100 text-center max-w-md">
          Measure the gap between your planned vs actual work. Stay disciplined and boost your productivity.
        </p>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Log in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
