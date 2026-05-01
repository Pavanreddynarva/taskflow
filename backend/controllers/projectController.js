const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort('-createdAt');

    // Attach task counts
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const overdue = tasks.filter(
          (t) => t.status !== 'completed' && t.deadline && new Date() > new Date(t.deadline)
        ).length;
        return { ...project.toObject(), taskStats: { total, completed, overdue } };
      })
    );

    res.status(200).json({ success: true, projects: projectsWithStats });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember =
      req.user.role === 'admin' ||
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, description, members, deadline, color } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
      deadline,
      color: color || '#6366f1',
    });

    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the owner or admin can update this project.' });
    }

    const allowed = ['name', 'description', 'members', 'status', 'deadline', 'color'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the owner or admin can delete this project.' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project and its tasks deleted.' });
  } catch (err) {
    next(err);
  }
};
