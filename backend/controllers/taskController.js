const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check project access
const checkProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found.', status: 404 };

  const isMember =
    role === 'admin' ||
    project.owner.toString() === userId.toString() ||
    project.members.some((m) => m.toString() === userId.toString());

  if (!isMember) return { error: 'Access denied.', status: 403 };
  return { project };
};

// GET /api/tasks  (dashboard - all accessible tasks)
exports.getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, assignedTo } = req.query;

    // Build filter
    let projectFilter = {};
    if (req.user.role !== 'admin') {
      const accessibleProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      projectFilter = { project: { $in: accessibleProjects.map((p) => p._id) } };
    }

    const filter = { ...projectFilter };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (projectId) filter.project = projectId;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Overdue filter
    if (status === 'overdue') {
      filter.status = { $in: ['pending', 'in-progress'] };
      filter.deadline = { $lt: new Date() };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:projectId/tasks
exports.getProjectTasks = async (req, res, next) => {
  try {
    const { error, status } = await checkProjectAccess(
      req.params.projectId,
      req.user._id,
      req.user.role
    );
    if (error) return res.status(status).json({ success: false, message: error });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/tasks
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { error, status, project } = await checkProjectAccess(
      req.params.projectId,
      req.user._id,
      req.user.role
    );
    if (error) return res.status(status).json({ success: false, message: error });

    const { title, description, assignedTo, priority, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      project: project._id,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
      deadline,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const { error, status } = await checkProjectAccess(
      task.project,
      req.user._id,
      req.user.role
    );
    if (error) return res.status(status).json({ success: false, message: error });

    const allowed = ['title', 'description', 'assignedTo', 'status', 'priority', 'deadline'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');

    res.status(200).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const { error, status } = await checkProjectAccess(
      task.project,
      req.user._id,
      req.user.role
    );
    if (error) return res.status(status).json({ success: false, message: error });

    // Only admin or creator can delete
    const canDelete =
      req.user.role === 'admin' ||
      task.createdBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'Only the task creator or admin can delete this task.' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    let projectFilter = {};
    if (req.user.role !== 'admin') {
      const projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      projectFilter = { project: { $in: projects.map((p) => p._id) } };
    }

    const now = new Date();
    const [total, completed, inProgress, pending, overdue] = await Promise.all([
      Task.countDocuments(projectFilter),
      Task.countDocuments({ ...projectFilter, status: 'completed' }),
      Task.countDocuments({ ...projectFilter, status: 'in-progress' }),
      Task.countDocuments({ ...projectFilter, status: 'pending' }),
      Task.countDocuments({
        ...projectFilter,
        status: { $in: ['pending', 'in-progress'] },
        deadline: { $lt: now },
      }),
    ]);

    res.status(200).json({ success: true, stats: { total, completed, inProgress, pending, overdue } });
  } catch (err) {
    next(err);
  }
};
