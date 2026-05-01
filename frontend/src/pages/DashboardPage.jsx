import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import './DashboardPage.css';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? (filter === 'overdue' ? { status: 'overdue' } : { status: filter }) : {};
      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll(params),
        tasksAPI.getStats(),
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchData();
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      fetchData();
    } catch {
      alert('Failed to delete task.');
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tasks</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      {stats && (
        <div className="stats-grid">
          <StatCard icon="◫" label="Total Tasks" value={stats.total} color="var(--accent)" />
          <StatCard icon="◎" label="Pending" value={stats.pending} color="var(--amber)" />
          <StatCard icon="▶" label="In Progress" value={stats.inProgress} color="var(--blue)" />
          <StatCard icon="✓" label="Completed" value={stats.completed} color="var(--green)" />
          <StatCard icon="⚠" label="Overdue" value={stats.overdue} color="var(--red)" />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Tasks</h2>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-tab ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">◫</div>
            <h3>No tasks found</h3>
            <p>
              {filter ? `No ${filter} tasks.` : 'Create a project and add tasks to get started.'}
            </p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                showProject
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
