const express = require('express');
const router = express.Router();
const {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategoryStats
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getFAQs);
router.get('/categories/stats', getFAQCategoryStats);
router.get('/:id', getFAQ);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

module.exports = router;
