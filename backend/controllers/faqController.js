const FAQ = require('../models/FAQ');

/**
 * @desc    Get all FAQs
 * @route   GET /api/faqs
 * @access  Public
 */
const getFAQs = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isActive: true };

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search if provided
    if (search) {
      query.$text = { $search: search };
    }

    const faqs = await FAQ.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('relatedQuestions', 'question category')
      .sort({ usageCount: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    console.error('Get FAQs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQs'
    });
  }
};

/**
 * @desc    Get single FAQ
 * @route   GET /api/faqs/:id
 * @access  Public
 */
const getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('relatedQuestions', 'question category');

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    console.error('Get FAQ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQ'
    });
  }
};

/**
 * @desc    Create new FAQ
 * @route   POST /api/faqs
 * @access  Private (Admin)
 */
const createFAQ = async (req, res) => {
  try {
    const { category, question, answer, keywords, relatedQuestions } = req.body;

    const faq = await FAQ.create({
      category,
      question,
      answer,
      keywords,
      relatedQuestions,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Create FAQ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating FAQ'
    });
  }
};

/**
 * @desc    Update FAQ
 * @route   PUT /api/faqs/:id
 * @access  Private (Admin)
 */
const updateFAQ = async (req, res) => {
  try {
    const { category, question, answer, keywords, relatedQuestions, isActive } = req.body;

    let faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Update fields
    if (category) faq.category = category;
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (keywords) faq.keywords = keywords;
    if (relatedQuestions) faq.relatedQuestions = relatedQuestions;
    if (isActive !== undefined) faq.isActive = isActive;

    faq.updatedBy = req.user.id;

    await faq.save();

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Update FAQ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating FAQ'
    });
  }
};

/**
 * @desc    Delete FAQ
 * @route   DELETE /api/faqs/:id
 * @access  Private (Admin)
 */
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await faq.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Delete FAQ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting FAQ'
    });
  }
};

/**
 * @desc    Get FAQ categories with counts
 * @route   GET /api/faqs/categories/stats
 * @access  Public
 */
const getFAQCategoryStats = async (req, res) => {
  try {
    const stats = await FAQ.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get FAQ Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching FAQ statistics'
    });
  }
};

module.exports = {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQCategoryStats
};
