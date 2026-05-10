import React from 'react';

export default function HeroCard({ score, insight }) {
  // Determine dynamic colors based on score
  let bgClass = "bg-slate-50 dark:bg-slate-900";
  let textClass = "text-slate-700 dark:text-slate-300";
  let labelClass = "text-slate-500 dark:text-slate-400";
  
  if (score > 70) {
    bgClass = "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20";
    textClass = "text-green-700 dark:text-green-400";
    labelClass = "text-green-600 dark:text-green-500";
  } else if (score >= 40) {
    bgClass = "bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20";
    textClass = "text-yellow-700 dark:text-yellow-400";
    labelClass = "text-yellow-600 dark:text-yellow-500";
  } else if (score >= 0) {
    bgClass = "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20";
    textClass = "text-red-700 dark:text-red-400";
    labelClass = "text-red-600 dark:text-red-500";
  }

  return (
    <div className={`p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center text-center ${bgClass}`}>
      <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 ${labelClass}`}>Reality Score</h2>
      <div className={`text-7xl font-black mb-4 tracking-tighter ${textClass}`}>
        {score !== undefined && score !== null ? score : '--'}
      </div>
      <p className={`text-lg font-medium max-w-xl ${textClass} opacity-90`}>
        {insight || "Analyze your behavior and close the gap between planning and execution."}
      </p>
    </div>
  );
}
