const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['account', 'billing', 'technical', 'product', 'general'],
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    unique: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  relatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text search index for questions and keywords
faqSchema.index({ question: 'text', keywords: 'text', answer: 'text' });
faqSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
