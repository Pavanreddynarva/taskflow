import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon-lg">⬡</span>
          <span className="auth-brand">TaskFlow</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing your team's work</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" placeholder="Alex Johnson" value={form.name} onChange={handleChange} required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create account →'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
