const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getConversationAnalytics,
  getAgentAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardAnalytics);
router.get('/conversations', getConversationAnalytics);
router.get('/agents', getAgentAnalytics);

module.exports = router;
