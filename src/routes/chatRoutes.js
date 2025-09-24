const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession,
  mockChat
} = require('../controller/chatController');

const { chatLimiter } = require('../middlewares/rateLimit');

// Main chat endpoint (with AI or mock fallback)
router.post('/chat', chatLimiter, sendMessage);

// Optional mock-only endpoint (forces mock response, useful for demos)
// 

router.post('/chat/mock', mockChat);

// Get chat history for a user
router.get('/chat/history/:userId', getChatHistory);

// Get a specific chat session
router.get('/chat/session/:userId/:sessionId', getChatSession);

// Delete a chat session
router.delete('/chat/session/:userId/:sessionId', deleteChatSession);

module.exports = router;
