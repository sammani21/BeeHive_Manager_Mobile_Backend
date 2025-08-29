const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession
} = require('../controller/chatController');
const { chatLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting to chat endpoint
router.post('/chat', chatLimiter, sendMessage);



// Get chat history for a user
router.get('/chat/history/:userId', getChatHistory);

// Get a specific chat session
router.get('/chat/session/:userId/:sessionId', getChatSession);

// Delete a chat session
router.delete('/chat/session/:userId/:sessionId', deleteChatSession);

module.exports = router;