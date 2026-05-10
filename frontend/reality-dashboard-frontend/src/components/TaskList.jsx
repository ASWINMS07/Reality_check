import React, { useState, useEffect } from 'react';
import { Check, Clock, Trash2, Edit2, X, Save, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function TaskCard({ task, onComplete, onDelete, onEdit, onStart, onStop }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editEstTime, setEditEstTime] = useState(task.estimated_time);
  const isCompleted = task.status === 'completed';
  const isRunning = task.is_running;

  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && task.start_time) {
      // Calculate initial diff
      const updateTimer = () => {
        const start = new Date(task.start_time).getTime();
        const now = Date.now();
        setLiveSeconds(Math.floor((now - start) / 1000));
      };
      updateTimer(); // run immediately
      interval = setInterval(updateTimer, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, task.start_time]);

  const formatLiveTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!editTitle.trim() || editEstTime <= 0) {
      toast.error('Invalid task details');
      return;
    }
    onEdit(task.id, { title: editTitle, estimated_time: Number(editEstTime) });
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isCompleted ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-70' : isRunning ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'} hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md`}
    >
      <div className="flex-1 mb-4 sm:mb-0">
        {isEditing ? (
          <div className="flex flex-col gap-2 mr-4">
            <input 
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Est Time (min):</span>
              <input 
                type="number"
                className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                value={editEstTime} 
                onChange={(e) => setEditEstTime(e.target.value)} 
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h4 className={`font-bold ${isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                {task.title}
              </h4>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${task.priority === 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : task.priority === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                {task.priority === 1 ? 'High' : task.priority === 2 ? 'Med' : 'Low'}
              </span>
              {isRunning && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse">
                  Running
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Clock size={14} className={isRunning ? "text-blue-500 dark:text-blue-400" : ""} />
              <span>Est: {task.estimated_time}m</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              {isRunning ? (
                <span className="text-blue-600 dark:text-blue-400 font-bold">Running: {formatLiveTime(liveSeconds)}</span>
              ) : (
                <span>Actual: {task.actual_time || 0}m</span>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
              <Save size={18} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {!isCompleted && (
              <>
                <button 
                  onClick={() => onStart(task.id)}
                  disabled={isRunning}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isRunning ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}
                >
                  <Play size={16} fill={isRunning ? "none" : "currentColor"} />
                  Start
                </button>
                <button 
                  onClick={() => onStop(task.id)}
                  disabled={!isRunning}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${!isRunning ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'}`}
                >
                  <Square size={16} fill={!isRunning ? "none" : "currentColor"} />
                  Stop
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  disabled={isRunning}
                  className={`p-1.5 rounded-lg transition-colors ${isRunning ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40'}`}
                  title="Edit Task"
                >
                  <Edit2 size={18} />
                </button>
              </>
            )}
            {isCompleted && (
              <button 
                onClick={() => onComplete(task.id, Number(task.actual_time), 'pending')}
                className="px-3 py-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Undo
              </button>
            )}
            <button 
              onClick={() => onDelete(task.id)}
              disabled={isRunning}
              className={`p-1.5 rounded-lg transition-colors ${isRunning ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'}`}
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TaskList({ tasks, onComplete, onDelete, onEdit, onStart, onStop }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Tasks</h3>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-full">
          {tasks?.length || 0} tasks
        </span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {tasks && tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={onComplete} 
                onDelete={onDelete} 
                onEdit={onEdit} 
                onStart={onStart}
                onStop={onStop}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-10 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl"
            >
              No tasks match the selected filter.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
