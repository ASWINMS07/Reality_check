import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';

export default function ChartSection({ tasks = [] }) {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    // Group tasks by date
    const grouped = {};
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    sortedTasks.forEach(t => {
      if (!t.created_at) return;
      const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { total: 0, completed: 0, est: 0, act: 0 };
      }
      grouped[date].total += 1;
      if (t.status === 'completed') {
        grouped[date].completed += 1;
        grouped[date].est += t.estimated_time || 0;
        grouped[date].act += t.actual_time || 0;
      }
    });

    return Object.keys(grouped).map(date => {
      const g = grouped[date];
      const completionScore = g.total === 0 ? 0 : (g.completed / g.total) * 100;
      
      let accuracyScore = 0;
      if (g.est > 0) {
        const diff = Math.abs(g.est - g.act);
        accuracyScore = Math.max(0, 100 - (diff / g.est) * 100);
      }
      
      const realityScore = g.total === 0 ? 0 : (completionScore + accuracyScore) / 2;

      return {
        date,
        'Reality Score': parseFloat(realityScore.toFixed(1)),
        'Completion %': parseFloat(completionScore.toFixed(1))
      };
    });
  }, [tasks]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Trends</h3>
      <div className="w-full h-[300px] flex-1">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: textColor, fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ stroke: isDark ? '#334155' : '#E5E7EB', strokeWidth: 2 }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  backgroundColor: tooltipBg,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  color: isDark ? '#f8fafc' : '#111827'
                }}
                itemStyle={{ color: isDark ? '#f8fafc' : '#111827' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="Reality Score" 
                stroke="#8B5CF6" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Completion %" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <p>No task data available to display trends.</p>
          </div>
        )}
      </div>
    </div>
  );
}
