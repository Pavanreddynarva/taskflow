const express = require('express');
const { body } = require('express-validator');
const {
  getAllTasks,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllTasks);
router.get('/stats', getDashboardStats);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Nested under projects
router
  .route('/project/:projectId')
  .get(getProjectTasks)
  .post(
    [body('title').trim().notEmpty().withMessage('Task title is required')],
    createTask
  );

module.exports = router;
