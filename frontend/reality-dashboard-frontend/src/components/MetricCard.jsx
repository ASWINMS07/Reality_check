import React from 'react';

export default function MetricCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass.split(' ').map(c => c.includes('bg-') ? `${c} dark:bg-${c.split('-')[1]}-900/30` : c).join(' ')}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
