const Chat = require('../model/Chat');
const { getAIResponse, getAIResponseWithHistory } = require('../services/openaiService');

/**
 * Send a message to the AI (with or without history)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, userId, sessionId, useHistory = true } = req.body;

    if (!message || !userId || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, userId, sessionId'
      });
    }

    // Get AI response (auto-falls back to mock if OpenAI fails)
    let response;
    if (useHistory) {
      response = await getAIResponseWithHistory(message, userId, sessionId);
    } else {
      response = await getAIResponse(message, userId, sessionId);
    }

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      errorMessage = 'Too many requests. Please try again in a moment.';
      statusCode = 429;
    } else if (error.message === 'QUOTA_EXCEEDED') {
      errorMessage = 'Service quota exceeded. Please check your OpenAI account.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};


exports.mockChat = async (req, res) => {
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
};

/**
 * Get chat history for a user (optionally filter by session)
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;

    let query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const chats = await Chat.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get a single chat session
 */
exports.getChatSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const chat = await Chat.findOne({ userId, sessionId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Delete a chat session
 */
exports.deleteChatSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const result = await Chat.deleteOne({ userId, sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
