const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All message routes require authentication
router.use(protect);

router.route('/:conversationId/messages')
  .get(getMessages)
  .post(sendMessage);

router.put('/:conversationId/messages/read', markAsRead);

module.exports = router;
