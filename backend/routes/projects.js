const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
