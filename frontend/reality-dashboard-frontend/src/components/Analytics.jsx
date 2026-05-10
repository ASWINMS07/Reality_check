import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { useTheme } from '../ThemeContext';
import { Target, Clock, TrendingUp, Calendar, AlertCircle, Activity, Award } from 'lucide-react';
import { fetchTasks } from '../services/api';
import { motion } from 'framer-motion';
import MetricCard from './MetricCard';

export default function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks().then(data => {
      // Sort ascending for chronological charts
      setTasks(data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const metrics = useMemo(() => {
    if (!tasks.length) return null;
    
    let totalEst = 0, totalAct = 0;
    const daysCount = {};
    
    tasks.forEach(t => {
      if (t.status === 'completed') {
        totalEst += t.estimated_time || 0;
        totalAct += t.actual_time || 0;
        
        const day = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        daysCount[day] = (daysCount[day] || 0) + 1;
      }
    });

    const mostProductiveDay = Object.keys(daysCount).reduce((a, b) => daysCount[a] > daysCount[b] ? a : b, 'N/A');
    const timeEfficiency = totalAct > 0 ? ((totalEst / totalAct) * 100).toFixed(0) : 0;
    
    return {
      efficiency: timeEfficiency,
      mostProductiveDay,
      totalEst,
      totalAct,
      completion_score: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length * 100).toFixed(0) : 0,
      reality_score: (parseFloat(timeEfficiency) + (tasks.filter(t => t.status === 'completed').length / tasks.length * 100)) / 2
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    return tasks.filter(t => t.status === 'completed').map((t, index) => {
      const accuracy = t.estimated_time > 0 
        ? Math.max(0, 100 - (Math.abs(t.estimated_time - (t.actual_time || 0)) / t.estimated_time) * 100) 
        : 0;
      
      return {
        name: `Task ${index + 1}`,
        title: t.title,
        accuracy: parseFloat(accuracy.toFixed(1)),
        planned: t.estimated_time,
        actual: t.actual_time || 0,
        deviation: (t.actual_time || 0) - t.estimated_time
      };
    });
  }, [tasks]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen w-full transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[1200px] mx-auto w-full transition-colors duration-300"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Detailed Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Deep dive into your productivity patterns.</p>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <AlertCircle size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">Complete some tasks first to unlock deep analytics and insights about your performance.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Avg Accuracy" 
              value={`${metrics?.efficiency}%`} 
              icon={Activity} 
              colorClass="bg-blue-100 text-blue-600"
            />
            <MetricCard 
              title="Completion" 
              value={`${metrics?.completion_score}%`} 
              icon={Target} 
              colorClass="bg-purple-100 text-purple-600"
            />
            <MetricCard 
              title="Best Day" 
              value={metrics?.mostProductiveDay} 
              icon={Calendar} 
              colorClass="bg-green-100 text-green-600"
            />
            <MetricCard 
              title="Status" 
              value={metrics?.reality_score > 70 ? "Elite" : "Growing"} 
              icon={Award} 
              colorClass="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Execution Accuracy</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Comparison between your estimated time and actual time spent across tasks.</p>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: tooltipBg,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        color: isDark ? '#f8fafc' : '#111827'
                      }} 
                      itemStyle={{ color: isDark ? '#f8fafc' : '#111827' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAccuracy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Planned vs Actual</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Comparison of scheduled minutes against the reality of time spent.</p>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: tooltipBg,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        color: isDark ? '#f8fafc' : '#111827'
                      }} 
                      itemStyle={{ color: isDark ? '#f8fafc' : '#111827' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="planned" name="Planned" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2 transition-colors duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Time Deviation per Task (Minutes)</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Visualizing how much you are over or under your initial estimates.</p>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: tooltipBg,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        color: isDark ? '#f8fafc' : '#111827'
                      }} 
                      itemStyle={{ color: isDark ? '#f8fafc' : '#111827' }}
                    />
                    <Line type="monotone" dataKey="deviation" name="Over/Under Time" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-6 sm:p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">Behavioral Insight</h3>
            <p className="text-blue-800 dark:text-blue-400 leading-relaxed font-medium">
              {tasks.filter(t => t.status === 'completed').length > 0 
                ? "Your productivity patterns show consistent execution. Focus on tasks with high deviation to improve estimation accuracy."
                : "Start completing tasks to see your behavioral patterns and productivity insights."}
            </p>
          </section>
        </div>
      )}
    </motion.div>
  );
}
