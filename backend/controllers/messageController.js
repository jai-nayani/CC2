const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const FAQ = require('../models/FAQ');
const OpenAIService = require('../utils/openaiService');

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/conversations/:conversationId/messages
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'customer' &&
      conversation.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these messages'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching messages'
    });
  }
};

/**
 * @desc    Send a message and get AI response
 * @route   POST /api/conversations/:conversationId/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'customer' &&
      conversation.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Check content safety
    const safetyCheck = await OpenAIService.checkContentSafety(content);

    if (!safetyCheck.isSafe) {
      return res.status(400).json({
        success: false,
        message: 'Message contains inappropriate content and cannot be processed. Please rephrase your message.',
        contentViolation: true
      });
    }

    // Analyze sentiment
    const sentiment = await OpenAIService.analyzeSentiment(content);

    // Create user message
    const userMessage = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      senderType: req.user.role === 'agent' ? 'agent' : 'user',
      content: content.trim(),
      metadata: { sentiment }
    });

    // Update conversation metadata
    conversation.metadata.totalMessages += 1;
    conversation.metadata.userMessages += 1;
    conversation.metadata.lastMessageAt = Date.now();
    conversation.sentiment = sentiment;

    // If agent is sending message, mark as agent involved
    if (req.user.role === 'agent') {
      conversation.isAgentInvolved = true;
      if (!conversation.assignedAgent) {
        conversation.assignedAgent = req.user.id;
      }
    }

    await conversation.save();

    // If message is from customer, generate AI response (unless agent is involved)
    let aiMessage = null;

    if (req.user.role === 'customer' && !conversation.isAgentInvolved) {
      try {
        // Get conversation history
        const messageHistory = await Message.find({ conversation: conversationId })
          .sort({ createdAt: 1 })
          .limit(20);

        // Get user preferences
        const user = req.user;

        // Search for relevant FAQs
        const relevantFAQs = await FAQ.find({
          $text: { $search: content },
          isActive: true
        }).limit(5);

        // Generate AI response
        const aiResponse = await OpenAIService.generateResponse(
          content,
          messageHistory,
          user.chatPreferences,
          relevantFAQs
        );

        // Analyze AI response sentiment
        const aiSentiment = await OpenAIService.analyzeSentiment(aiResponse.response);

        // Create AI message
        aiMessage = await Message.create({
          conversation: conversationId,
          sender: req.user.id, // Using user ID as reference
          senderType: 'ai',
          content: aiResponse.response,
          metadata: {
            sentiment: aiSentiment,
            ...aiResponse.metadata
          }
        });

        // Update conversation metadata
        conversation.metadata.totalMessages += 1;
        conversation.metadata.aiMessages += 1;
        conversation.metadata.lastMessageAt = Date.now();

        // Update average response time
        if (aiResponse.metadata.processingTime) {
          const currentAvg = conversation.metadata.averageResponseTime || 0;
          const totalAiMessages = conversation.metadata.aiMessages;
          conversation.metadata.averageResponseTime =
            (currentAvg * (totalAiMessages - 1) + aiResponse.metadata.processingTime) / totalAiMessages;
        }

        await conversation.save();

        // Increment FAQ usage count if FAQs were used
        if (relevantFAQs.length > 0) {
          await FAQ.updateMany(
            { _id: { $in: relevantFAQs.map(faq => faq._id) } },
            { $inc: { usageCount: 1 } }
          );
        }
      } catch (aiError) {
        console.error('AI Response Error:', aiError);
        // If AI fails, return user message without AI response
        return res.status(200).json({
          success: true,
          message: 'Message sent successfully, but AI response failed',
          data: {
            userMessage,
            aiMessage: null,
            aiError: 'Failed to generate AI response. Please try again.'
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage: await userMessage.populate('sender', 'name email role'),
        aiMessage: aiMessage ? await aiMessage.populate('sender', 'name email role') : null
      }
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending message'
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/conversations/:conversationId/messages/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        conversation: conversationId
      },
      {
        isRead: true,
        readAt: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking messages as read'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead
};
