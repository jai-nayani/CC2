const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updatePreferences
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
