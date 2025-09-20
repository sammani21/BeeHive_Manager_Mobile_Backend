const { OpenAI } = require('openai');
const Chat = require('../model/Chat');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Beekeeping knowledge base
const BEEKEEPING_KNOWLEDGE = `
You are BeeBuddy, an expert assistant specialized in beekeeping and honey production. 
You have extensive knowledge about:

1. Bee species and their characteristics
2. Hive management and maintenance
3. Honey production and extraction
4. Bee health and disease management
5. Beekeeping equipment and tools
6. Seasonal beekeeping activities
7. Pollination and its importance
8. Bee behavior and communication
9. Swarm prevention and management
10. Honey bee nutrition and feeding

Important guidelines:
- Answer questions based on your knowledge of beekeeping
- If asked about something outside beekeeping, politely decline
- Be friendly, informative, and professional
- If you're unsure about something, say so rather than making up information
- Provide practical, actionable advice when possible
`;

/**
 * Mock fallback response for offline/demo mode
 */
function getMockResponse(message) {
  return `🐝 (Mock) BeeBuddy here! I received your message: "${message}". 
Since the AI service is unavailable right now, I'm giving you a demo reply.
Try asking about hive inspections, honey harvesting, or swarm prevention!`;
}

/**
 * Get AI response without history
 */
exports.getAIResponse = async (message, userId, sessionId) => {
  try {
    const messages = [
      { role: "system", content: BEEKEEPING_KNOWLEDGE },
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if available
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    await saveChatToDB(userId, sessionId, message, response);

    return response;
  } catch (error) {
    console.error('Error getting AI response:', error);

    // Handle specific OpenAI errors
    if (error.status === 429) throw new Error('RATE_LIMIT_EXCEEDED');
    if (error.code === 'insufficient_quota') throw new Error('QUOTA_EXCEEDED');

    // Fallback mock response
    const mock = getMockResponse(message);
    await saveChatToDB(userId, sessionId, message, mock);
    return mock;
  }
};

/**
 * Get AI response with history
 */
exports.getAIResponseWithHistory = async (message, userId, sessionId) => {
  try {
    let chat = await Chat.findOne({ userId, sessionId });

    const messages = [{ role: "system", content: BEEKEEPING_KNOWLEDGE }];

    if (chat && chat.messages.length > 0) {
      chat.messages.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    await saveChatToDB(userId, sessionId, message, response);

    return response;
  } catch (error) {
    console.error('Error getting AI response with history:', error);

    if (error.status === 429) throw new Error('RATE_LIMIT_EXCEEDED');
    if (error.code === 'insufficient_quota') throw new Error('QUOTA_EXCEEDED');

    // Fallback mock response
    const mock = getMockResponse(message);
    await saveChatToDB(userId, sessionId, message, mock);
    return mock;
  }
};

/**
 * Save chat to MongoDB
 */
async function saveChatToDB(userId, sessionId, message, response) {
  let chat = await Chat.findOne({ userId, sessionId });

  if (!chat) {
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;

    chat = new Chat({
      userId,
      sessionId,
      messages: [],
      title
    });
  }

  chat.messages.push({ role: 'user', content: message });
  chat.messages.push({ role: 'assistant', content: response });
  await chat.save();
}
