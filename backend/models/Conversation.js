const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated'],
    default: 'active'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'frustrated'],
    default: 'neutral'
  },
  category: {
    type: String,
    enum: ['account', 'billing', 'technical', 'product', 'general'],
    default: 'general'
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    aiMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isAgentInvolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ sentiment: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
