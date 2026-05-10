import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import toast from 'react-hot-toast';
import { Target, Loader2 } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ name, email, password });
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
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
                minLength={6}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
