const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * @desc    Get all conversations for a user
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    let query = {};

    // If user is customer, only show their conversations
    if (req.user.role === 'customer') {
      query.user = req.user.id;
    }
    // If user is agent, show conversations assigned to them or escalated
    else if (req.user.role === 'agent') {
      query.$or = [
        { assignedAgent: req.user.id },
        { status: 'escalated' }
      ];
    }
    // Admins can see all conversations

    const conversations = await Conversation.find(query)
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ 'metadata.lastMessageAt': -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversations'
    });
  }
};

/**
 * @desc    Get single conversation
 * @route   GET /api/conversations/:id
 * @access  Private
 */
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedAgent', 'name email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'customer' &&
      conversation.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversation'
    });
  }
};

/**
 * @desc    Create new conversation
 * @route   POST /api/conversations
 * @access  Private (Customer)
 */
const createConversation = async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.create({
      user: req.user.id,
      title: title || 'New Conversation'
    });

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    console.error('Create Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating conversation'
    });
  }
};

/**
 * @desc    Update conversation
 * @route   PUT /api/conversations/:id
 * @access  Private (Agent, Admin)
 */
const updateConversation = async (req, res) => {
  try {
    const { status, assignedAgent, title } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Update fields
    if (status) conversation.status = status;
    if (assignedAgent) {
      conversation.assignedAgent = assignedAgent;
      conversation.isAgentInvolved = true;
    }
    if (title) conversation.title = title;

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      data: conversation
    });
  } catch (error) {
    console.error('Update Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating conversation'
    });
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/conversations/:id
 * @access  Private (Admin)
 */
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete conversation
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting conversation'
    });
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
};
