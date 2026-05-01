const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);

module.exports = router;
