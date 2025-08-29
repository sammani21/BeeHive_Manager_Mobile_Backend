const Chat = require('../model/Chat');
const { getAIResponse, getAIResponseWithHistory } = require('../services/openaiService');

exports.sendMessage = async (req, res) => {
  try {
    const { message, userId, sessionId, useHistory = true } = req.body;
    
    if (!message || !userId || !sessionId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: message, userId, sessionId' 
      });
    }
    
    // Get AI response (with or without history)
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
    
    // Provide appropriate error messages
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