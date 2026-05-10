import React, { useState, useEffect, useMemo } from 'react';
import HeroCard from './HeroCard';
import MetricCard from './MetricCard';
import ChartSection from './ChartSection';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import { Target, CheckCircle, TrendingUp, Clock, Filter } from 'lucide-react';
import { fetchTasks, createTask, updateTask, fetchAnalytics, deleteTask, startTask, stopTask } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const loadData = async (showToast = false) => {
    try {
      let hasNetworkError = false;
      const [fetchedTasks, fetchedAnalytics] = await Promise.all([
        fetchTasks().catch(err => {
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') hasNetworkError = true;
          return [];
        }), 
        fetchAnalytics().catch(err => {
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') hasNetworkError = true;
          return null;
        })
      ]);
      setBackendError(hasNetworkError);
      setTasks(fetchedTasks || []);
      setAnalytics(fetchedAnalytics || {
        total_tasks: 0, completed_tasks: 0, completion_score: 0, accuracy_score: 0, reality_score: 0, insight: "Start adding tasks."
      });
      if (showToast) toast.success('Data refreshed');
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      await createTask(taskData);
      toast.success('Task added successfully!');
      await loadData();
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  const handleCompleteTask = async (id, actualTime, status = 'completed') => {
    try {
      await updateTask(id, { actual_time: actualTime, status });
      toast.success(status === 'completed' ? 'Task marked as complete!' : 'Task moved to pending');
      loadData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = async (id, updates) => {
    try {
      await updateTask(id, updates);
      toast.success('Task updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleStartTask = async (id) => {
    try {
      await startTask(id);
      toast.success('Timer started');
      loadData();
    } catch (error) {
      toast.error('Failed to start timer');
    }
  };

  const handleStopTask = async (id) => {
    try {
      await stopTask(id);
      toast.success('Timer stopped. Task completed!');
      loadData();
    } catch (error) {
      toast.error('Failed to stop timer');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (timeFilter === 'all') return true;
      if (!task.created_at) return true;
      const date = new Date(task.created_at);
      if (timeFilter === 'today') return isToday(date);
      if (timeFilter === 'week') return isThisWeek(date);
      if (timeFilter === 'month') return isThisMonth(date);
      return true;
    });
  }, [tasks, timeFilter]);

  // Recalculate metrics for filtered tasks
  const filteredMetrics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const completionScore = total === 0 ? 0 : (completed / total) * 100;
    
    let totalEst = 0, totalAct = 0;
    filteredTasks.forEach(t => {
      totalEst += t.estimated_time || 0;
      totalAct += t.actual_time || 0;
    });
    
    let accuracyScore = 0;
    if (totalEst > 0) {
      const diff = Math.abs(totalEst - totalAct);
      accuracyScore = Math.max(0, 100 - (diff / totalEst) * 100);
    }
    const realityScore = total === 0 ? 0 : (completionScore + accuracyScore) / 2;

    return {
      total_tasks: total,
      completed_tasks: completed,
      completion_score: completionScore.toFixed(2),
      accuracy_score: accuracyScore.toFixed(2),
      reality_score: realityScore.toFixed(2)
    };
  }, [filteredTasks]);

  const chartData = filteredTasks.map(task => ({
    name: task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
    estimated: task.estimated_time,
    actual: task.actual_time || 0
  })).reverse(); // Reverse so oldest is first in the chart if they are sorted by created_at DESC

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen w-full transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (backendError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen w-full bg-red-50 dark:bg-red-950/10 p-8 text-center transition-colors duration-300">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4 shadow-sm border border-red-200 dark:border-red-800">
          <Target size={32} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2 tracking-tight">Connection Refused</h2>
        <p className="text-red-700 dark:text-red-300 font-medium">The backend server appears to be unreachable.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-[1400px] mx-auto w-full"
    >
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Reality Check Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Measure the gap between planned vs actual work.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <Filter size={16} className="text-slate-400 dark:text-slate-500 ml-2" />
          {['all', 'today', 'week', 'month'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${timeFilter === f ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        <section>
          <HeroCard 
            score={filteredMetrics.reality_score} 
            insight={analytics?.insight} 
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Tasks" 
            value={filteredMetrics.total_tasks} 
            icon={Target} 
            colorClass="bg-blue-100 text-blue-600"
          />
          <MetricCard 
            title="Completed" 
            value={filteredMetrics.completed_tasks} 
            icon={CheckCircle} 
            colorClass="bg-green-100 text-green-600"
          />
          <MetricCard 
            title="Completion %" 
            value={`${filteredMetrics.completion_score}%`} 
            icon={TrendingUp} 
            colorClass="bg-purple-100 text-purple-600"
          />
          <MetricCard 
            title="Accuracy %" 
            value={`${filteredMetrics.accuracy_score}%`} 
            icon={Clock} 
            colorClass="bg-orange-100 text-orange-600"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSection tasks={filteredTasks} />
          </div>
          <div className="lg:col-span-1">
            <AddTaskForm onAdd={handleAddTask} />
          </div>
        </section>

        <section>
          <TaskList 
            tasks={filteredTasks} 
            onComplete={handleCompleteTask} 
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onStart={handleStartTask}
            onStop={handleStopTask}
          />
        </section>
      </div>
    </motion.div>
  );
}
