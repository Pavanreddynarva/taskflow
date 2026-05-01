import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { projectsAPI, tasksAPI, authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import "./ProjectDetailPage.css";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth(); // ❌ removed isAdmin
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectsAPI.getOne(id),
        tasksAPI.getByProject(id),
      ]);
      setProject(projRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = async (data) => {
    await tasksAPI.create(id, data);
    await fetchData();
    setTaskModalOpen(false);
  };

  const handleUpdateTask = async (taskId, data) => {
    await tasksAPI.update(taskId, data);
    fetchData();
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await tasksAPI.update(taskId, { status: newStatus });
    fetchData();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await tasksAPI.delete(taskId);
    fetchData();
  };

  const filteredTasks = filter
    ? tasks.filter((t) => {
        if (filter === "overdue")
          return (
            t.status !== "completed" &&
            t.deadline &&
            new Date() > new Date(t.deadline)
          );
        return t.status === filter;
      })
    : tasks;

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
  };

  const progress =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <div
          className="spinner"
          style={{ width: 36, height: 36, margin: "0 auto" }}
        />
      </div>
    );

  if (error)
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <Link
          to="/projects"
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
        >
          ← Back
        </Link>
      </div>
    );

  if (!project) return null;

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <div className="breadcrumb">
          <Link to="/projects" className="breadcrumb-link">
            Projects
          </Link>
          <span className="breadcrumb-sep">›</span>
          <span>{project.name}</span>
        </div>

        <div className="project-detail-top">
          <div className="project-detail-title-row">
            <div
              className="project-dot"
              style={{ background: project.color }}
            />
            <h1 className="page-title">{project.name}</h1>
          </div>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>

        <div className="project-detail-stats">
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.total}</span>
            <span className="detail-stat-label">Total</span>
          </div>
          <div className="detail-stat">
            <span
              className="detail-stat-value"
              style={{ color: "var(--amber)" }}
            >
              {stats.pending}
            </span>
            <span className="detail-stat-label">Pending</span>
          </div>
          <div className="detail-stat">
            <span
              className="detail-stat-value"
              style={{ color: "var(--blue)" }}
            >
              {stats.inProgress}
            </span>
            <span className="detail-stat-label">In Progress</span>
          </div>
          <div className="detail-stat">
            <span
              className="detail-stat-value"
              style={{ color: "var(--green)" }}
            >
              {stats.completed}
            </span>
            <span className="detail-stat-label">Done</span>
          </div>
        </div>

        <div className="project-progress-section">
          <div className="progress-header">
            <span>Progress</span>
            <span style={{ color: project.color, fontWeight: 700 }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, background: project.color }}
            />
          </div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title">Tasks</h2>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="filter-tabs">
              {["", "pending", "in-progress", "completed", "overdue"].map(
                (f) => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f ? f.replace("-", " ") : "All"}
                  </button>
                ),
              )}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              + Add Task
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="icon">◫</div>
            <h3>No tasks {filter ? `with status "${filter}"` : "yet"}</h3>
            <p>Add your first task to get started.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setTaskModalOpen(true)}
            >
              + Add Task
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {taskModalOpen && (
        <TaskModal
          users={[project.owner, ...(project.members || [])]}
          onSubmit={
            editingTask
              ? (data) => handleUpdateTask(editingTask._id, data)
              : handleCreateTask
          }
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
          }}
          initialData={editingTask}
        />
      )}
    </div>
  );
}
