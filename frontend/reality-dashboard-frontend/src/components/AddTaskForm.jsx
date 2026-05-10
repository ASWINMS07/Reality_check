import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length >= 3 && estimatedTime > 0) {
      setLoading(true);
      setError('');
      
      const priorityMap = {
        low: 3,
        medium: 2,
        high: 1
      };
      
      try {
        await onAdd({ 
          title, 
          estimated_time: Number(estimatedTime), 
          priority: priorityMap[priority] 
        });
        setTitle('');
        setEstimatedTime('');
        setPriority('medium');
      } catch (err) {
        setError('Failed to add task. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Task</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Task Title - Full Width */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task name"
            className="w-full px-4 py-3 text-base text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm outline-none"
            required
            minLength={3}
            disabled={loading}
          />
        </div>
        
        {/* 3 Columns for Est Time, Priority, and Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Estimated Time */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Est. Time</label>
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="Minutes"
              className="w-full px-4 py-3 text-base text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm outline-none"
              required
              min="1"
              disabled={loading}
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 text-base text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none cursor-pointer outline-none"
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={title.length < 3 || !estimatedTime || estimatedTime <= 0 || loading}
              className="w-full h-[50px] px-6 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Plus size={20} />
              )}
              <span>{loading ? 'Adding...' : 'Add Task'}</span>
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}
