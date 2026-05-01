import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/ProjectModal';
import './ProjectsPage.css';

const PROJECT_COLORS = ['#7c6af7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6'];

const ProjectCard = ({ project, onDelete, isAdmin, userId }) => {
  const { taskStats = {} } = project;
  const progress = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  const isOwner = project.owner?._id === userId;

  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-card-accent" style={{ background: project.color }} />
      <div className="project-card-header">
        <div className="project-icon" style={{ background: project.color + '22', color: project.color }}>⬡</div>
        <div className="project-actions" onClick={e => e.preventDefault()}>
          {(isAdmin || isOwner) && (
            <button
              className="btn btn-ghost btn-icon project-delete"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project._id); }}
              title="Delete project"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <h3 className="project-name">{project.name}</h3>
      {project.description && <p className="project-desc">{project.description}</p>}

      <div className="project-stats">
        <span>{taskStats.total || 0} tasks</span>
        <span>{taskStats.completed || 0} done</span>
        {taskStats.overdue > 0 && <span className="overdue-count">⚠ {taskStats.overdue} overdue</span>}
      </div>

      <div className="progress-bar" style={{ marginTop: '12px' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: project.color }} />
      </div>
      <div className="progress-label">{progress}% complete</div>

      <div className="project-members">
        {project.members?.slice(0, 4).map(m => (
          <div key={m._id} className="avatar avatar-sm" title={m.name}>
            {m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        ))}
        {project.members?.length > 4 && (
          <div className="avatar avatar-sm" style={{ color: 'var(--text-3)' }}>+{project.members.length - 4}</div>
        )}
      </div>
    </Link>
  );
};

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, usersRes] = await Promise.all([
        projectsAPI.getAll(),
        authAPI.getUsers(),
      ]);
      setProjects(projRes.data.projects);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (data) => {
    await projectsAPI.create(data);
    fetchProjects();
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete project and all its tasks? This cannot be undone.')) return;
    try {
      await projectsAPI.delete(id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + New Project
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">⬡</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
            + Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              userId={user._id}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          users={users}
          colors={PROJECT_COLORS}
          onSubmit={handleCreate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
