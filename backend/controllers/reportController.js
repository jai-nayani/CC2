const Report = require('../models/Report');
const Conversation = require('../models/Conversation');

/**
 * @desc    Get all reports
 * @route   GET /api/reports
 * @access  Private (Agent, Admin)
 */
const getReports = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }

    // If agent, show only assigned reports or pending reports
    if (req.user.role === 'agent') {
      query.$or = [
        { assignedTo: req.user.id },
        { status: 'pending' }
      ];
    }

    const reports = await Report.find(query)
      .populate('conversation', 'title status')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reports'
    });
  }
};

/**
 * @desc    Get single report
 * @route   GET /api/reports/:id
 * @access  Private (Agent, Admin)
 */
const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('conversation', 'title status')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching report'
    });
  }
};

/**
 * @desc    Create new report
 * @route   POST /api/reports
 * @access  Private (Customer)
 */
const createReport = async (req, res) => {
  try {
    const { conversation, issueType, description, priority } = req.body;

    // Verify conversation exists
    const conversationExists = await Conversation.findById(conversation);

    if (!conversationExists) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verify user owns the conversation
    if (conversationExists.user.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to report this conversation'
      });
    }

    const report = await Report.create({
      conversation,
      reportedBy: req.user.id,
      issueType,
      description,
      priority: priority || 'medium'
    });

    // Update conversation status to escalated
    conversationExists.status = 'escalated';
    await conversationExists.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating report'
    });
  }
};

/**
 * @desc    Update report (assign, change status, etc.)
 * @route   PUT /api/reports/:id
 * @access  Private (Agent, Admin)
 */
const updateReport = async (req, res) => {
  try {
    const { status, priority, assignedTo, notes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update fields
    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedTo) report.assignedTo = assignedTo;

    // If status is being set to resolved, add resolution details
    if (status === 'resolved') {
      report.resolution.notes = notes || '';
      report.resolution.resolvedBy = req.user.id;
      report.resolution.resolvedAt = Date.now();
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Update Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating report'
    });
  }
};

/**
 * @desc    Delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Admin)
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting report'
    });
  }
};

/**
 * @desc    Get report statistics
 * @route   GET /api/reports/stats
 * @access  Private (Agent, Admin)
 */
const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const inReviewReports = await Report.countDocuments({ status: 'in_review' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$issueType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const reportsByPriority = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalReports,
        pending: pendingReports,
        inReview: inReviewReports,
        resolved: resolvedReports,
        byType: reportsByType,
        byPriority: reportsByPriority
      }
    });
  } catch (error) {
    console.error('Get Report Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching report statistics'
    });
  }
};

module.exports = {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  getReportStats
};
