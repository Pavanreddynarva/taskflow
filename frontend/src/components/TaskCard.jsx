import React from "react";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import { useAuth } from "../context/AuthContext";
import "./TaskCard.css";

const STATUS_OPTIONS = ["pending", "in-progress", "completed"];

const statusLabel = (s) =>
  ({
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
  })[s] || s;
const priorityLabel = (p) =>
  ({ low: "Low", medium: "Medium", high: "High" })[p] || p;

const isOverdue = (task) =>
  task.status !== "completed" &&
  task.deadline &&
  isPast(new Date(task.deadline));

const UserAvatar = ({ user }) => {
  if (!user)
    return (
      <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
        Unassigned
      </span>
    );
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="task-assignee">
      <div className="avatar avatar-sm">{initials}</div>
      <span>{user.name}</span>
    </div>
  );
};

export default function TaskCard({
  task,
  onStatusChange,
  onDelete,
  showProject = false,
}) {
  const { user, isAdmin } = useAuth();
  const overdue = isOverdue(task);
  const canDelete = isAdmin || task.createdBy?._id === user?._id;

  return (
    <div className={`task-card ${overdue ? "overdue" : ""}`}>
      <div className="task-card-left">
        {/* Status dropdown */}
        <select
          className={`status-select badge badge-${task.status.replace("-", "-")}`}
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          title="Change status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="task-card-body">
        <div className="task-title-row">
          <h3
            className={`task-title ${task.status === "completed" ? "completed" : ""}`}
          >
            {task.title}
          </h3>
          <div className="task-badges">
            <span className={`badge badge-${task.priority}`}>
              {priorityLabel(task.priority)}
            </span>
            {overdue && <span className="badge badge-overdue">Overdue</span>}
          </div>
        </div>

        {task.description && <p className="task-desc">{task.description}</p>}

        <div className="task-meta">
          {showProject && task.project && (
            <Link
              to={`/projects/${task.project._id}`}
              className="task-project-badge"
              style={{
                "--project-color": task.project.color || "var(--accent)",
              }}
            >
              ⬡ {task.project.name}
            </Link>
          )}
          <UserAvatar user={task.assignedTo} />
          {task.deadline && (
            <span className={`task-deadline ${overdue ? "overdue-text" : ""}`}>
              {overdue ? "⚠ " : "◷ "}
              {format(new Date(task.deadline), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>

      {canDelete && (
        <button
          className="btn btn-ghost btn-icon task-delete-btn"
          onClick={() => onDelete(task._id)}
          title="Delete task"
        >
          ✕
        </button>
      )}
    </div>
  );
}
