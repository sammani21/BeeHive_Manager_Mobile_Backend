const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession
} = require('../controller/chatController');

const { chatLimiter } = require('../middlewares/rateLimit');

// Main chat endpoint (with AI or mock fallback)
router.post('/chat', chatLimiter, sendMessage);

// Optional mock-only endpoint (forces mock response, useful for demos)
// 

router.post('/chat/mock', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !userId || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, userId, sessionId'
      });
    }

    // Smart mock response function
    function getMockResponse(message) {
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('hive') && lowerMsg.includes('inspection')) {
        return '🐝 (Demo) For hive inspections, check for brood health, bee activity, and signs of disease. Inspect weekly during peak season!';
      }

      if (lowerMsg.includes('honey') && (lowerMsg.includes('harvest') || lowerMsg.includes('production'))) {
        return '🍯 (Demo) Honey harvesting is best done when frames are 80% capped. Use gentle extraction methods to avoid harming the bees.';
      }

      if (lowerMsg.includes('swarm')) {
        return '🐝 (Demo) To prevent swarming, regularly monitor queen cells, provide enough space, and split hives if necessary.';
      }

      if (lowerMsg.includes('bee') && lowerMsg.includes('disease')) {
        return '🩺 (Demo) Common bee diseases include Varroa mites, Nosema, and American Foulbrood. Maintain hive hygiene and inspect regularly.';
      }

      if (lowerMsg.includes('feeding') || lowerMsg.includes('nutrition')) {
        return '🍯 (Demo) Feed bees sugar syrup in early spring or during nectar dearth. Pollen patties can supplement protein needs.';
      }

      if (lowerMsg.includes('queen')) {
        return '👑 (Demo) Queen health is critical. Check for brood pattern, presence of eggs, and overall activity. Replace if failing.';
      }

      // Generic fallback
      return `🐝 (Demo) BeeBuddy here! I got your question: "${message}". Try asking me about hive inspections, honey harvesting, swarm prevention, bee diseases, or feeding!`;
    }

    const mockResponse = getMockResponse(message);

    return res.json({
      success: true,
      response: mockResponse
    });
  } catch (error) {
    console.error('Mock chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


// Get chat history for a user
router.get('/chat/history/:userId', getChatHistory);

// Get a specific chat session
router.get('/chat/session/:userId/:sessionId', getChatSession);

// Delete a chat session
router.delete('/chat/session/:userId/:sessionId', deleteChatSession);

module.exports = router;
