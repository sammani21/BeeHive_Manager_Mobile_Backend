const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  sessionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  }
}, {
  timestamps: true
});

// Create index for faster queries
chatSchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model('Chat', chatSchema);