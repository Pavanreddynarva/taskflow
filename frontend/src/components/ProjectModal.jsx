import React, { useState } from 'react';
import './Modal.css';

export default function ProjectModal({ users, colors, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    members: [],
    deadline: '',
    color: colors[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required.');
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Website Redesign" autoFocus />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="What's this project about?" rows={3} />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Deadline</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>

          {users.length > 0 && (
            <div className="form-group">
              <label>Add Members</label>
              <div className="members-select">
                {users.map(u => (
                  <label key={u._id} className={`member-option ${form.members.includes(u._id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.members.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                      style={{ display: 'none' }}
                    />
                    <div className="avatar avatar-sm">
                      {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span>{u.name}</span>
                    <span className="member-email">{u.email}</span>
                    {form.members.includes(u._id) && <span className="member-check">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
