const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');
const FAQ = require('../models/FAQ');

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin)
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const agents = await User.countDocuments({ role: 'agent' });
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // Conversation statistics
    const totalConversations = await Conversation.countDocuments();
    const activeConversations = await Conversation.countDocuments({ status: 'active' });
    const resolvedConversations = await Conversation.countDocuments({ status: 'resolved' });
    const escalatedConversations = await Conversation.countDocuments({ status: 'escalated' });

    // Message statistics
    const totalMessages = await Message.countDocuments();
    const aiMessages = await Message.countDocuments({ senderType: 'ai' });
    const userMessages = await Message.countDocuments({ senderType: 'user' });
    const agentMessages = await Message.countDocuments({ senderType: 'agent' });

    // Sentiment statistics
    const sentimentStats = await Conversation.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]);

    // Report statistics
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Calculate average response time
    const avgResponseTime = await Conversation.aggregate([
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$metadata.averageResponseTime' }
        }
      }
    ]);

    // Get recent conversations
    const recentConversations = await Conversation.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top FAQs
    const topFAQs = await FAQ.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers,
          agents,
          online: onlineUsers
        },
        conversations: {
          total: totalConversations,
          active: activeConversations,
          resolved: resolvedConversations,
          escalated: escalatedConversations
        },
        messages: {
          total: totalMessages,
          ai: aiMessages,
          user: userMessages,
          agent: agentMessages
        },
        sentiment: sentimentStats,
        reports: {
          total: totalReports,
          pending: pendingReports,
          resolved: resolvedReports
        },
        performance: {
          averageResponseTime: avgResponseTime[0]?.avgTime || 0
        },
        recentConversations,
        topFAQs
      }
    });
  } catch (error) {
    console.error('Get Dashboard Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics'
    });
  }
};

/**
 * @desc    Get conversation analytics
 * @route   GET /api/analytics/conversations
 * @access  Private (Admin)
 */
const getConversationAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Conversations by status
    const conversationsByStatus = await Conversation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conversations by category
    const conversationsByCategory = await Conversation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conversations by sentiment
    const conversationsBySentiment = await Conversation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily conversation trend
    const dailyTrend = await Conversation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: conversationsByStatus,
        byCategory: conversationsByCategory,
        bySentiment: conversationsBySentiment,
        dailyTrend
      }
    });
  } catch (error) {
    console.error('Get Conversation Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching conversation analytics'
    });
  }
};

/**
 * @desc    Get agent performance analytics
 * @route   GET /api/analytics/agents
 * @access  Private (Admin)
 */
const getAgentAnalytics = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('name email');

    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        const assignedConversations = await Conversation.countDocuments({
          assignedAgent: agent._id
        });

        const resolvedConversations = await Conversation.countDocuments({
          assignedAgent: agent._id,
          status: 'resolved'
        });

        const agentMessageCount = await Message.countDocuments({
          sender: agent._id,
          senderType: 'agent'
        });

        const handledReports = await Report.countDocuments({
          assignedTo: agent._id
        });

        const resolvedReports = await Report.countDocuments({
          assignedTo: agent._id,
          status: 'resolved'
        });

        return {
          agent: {
            _id: agent._id,
            name: agent.name,
            email: agent.email
          },
          assignedConversations,
          resolvedConversations,
          messagesSent: agentMessageCount,
          handledReports,
          resolvedReports,
          resolutionRate: assignedConversations > 0
            ? ((resolvedConversations / assignedConversations) * 100).toFixed(2)
            : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: agentPerformance
    });
  } catch (error) {
    console.error('Get Agent Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching agent analytics'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getConversationAnalytics,
  getAgentAnalytics
};
