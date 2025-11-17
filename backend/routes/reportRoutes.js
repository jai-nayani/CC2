const express = require('express');
const router = express.Router();
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  getReportStats
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Statistics route (for agents and admins)
router.get('/stats', authorize('agent', 'admin'), getReportStats);

router.route('/')
  .get(authorize('agent', 'admin'), getReports)
  .post(createReport);

router.route('/:id')
  .get(authorize('agent', 'admin'), getReport)
  .put(authorize('agent', 'admin'), updateReport)
  .delete(authorize('admin'), deleteReport);

module.exports = router;
