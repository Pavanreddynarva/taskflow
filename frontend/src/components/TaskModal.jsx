import React, { useState } from 'react';
import './Modal.css';

export default function TaskModal({ users, onSubmit, onClose, initialData }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignedTo: initialData?.assignedTo?._id || '',
    priority: initialData?.priority || 'medium',
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : '',
    status: initialData?.status || 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Task title is required.');
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Task Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Design homepage mockup" autoFocus />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add details about this task..." rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {isEdit && (
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Assign To</label>
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users?.filter(Boolean).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Deadline</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
