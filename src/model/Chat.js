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
  isMock: {
    type: Boolean,
    default: false 
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    title: {
      type: String,
      default: function () {
        return `Chat started on ${new Date().toLocaleDateString()}`;
      }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for faster lookups
chatSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
