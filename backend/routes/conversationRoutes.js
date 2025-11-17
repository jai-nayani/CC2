const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
} = require('../controllers/conversationController');
const { protect, authorize } = require('../middleware/auth');

// All conversation routes require authentication
router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversation)
  .put(authorize('agent', 'admin'), updateConversation)
  .delete(authorize('admin'), deleteConversation);

module.exports = router;
