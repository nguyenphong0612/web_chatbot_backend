const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory conversation store
const conversations = {};

// Function to save conversation to JSON file
function saveConversation(sessionId, conversation) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `conversation_${sessionId}_${timestamp}.json`;
    const filePath = path.join(__dirname, 'conversations', fileName);
    
    // Create conversations directory if it doesn't exist
    const conversationsDir = path.join(__dirname, 'conversations');
    if (!fs.existsSync(conversationsDir)) {
      fs.mkdirSync(conversationsDir, { recursive: true });
    }
    
    // Prepare conversation data
    const conversationData = {
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      messages: conversation,
      totalMessages: conversation.length
    };
    
    // Write to JSON file
    fs.writeFileSync(filePath, JSON.stringify(conversationData, null, 2));
    console.log(`Conversation saved: ${fileName}`);
    
    return fileName;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    res.status(400).json({ error: 'Missing message or sessionId' });
    return;
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }
  conversations[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversations[sessionId],
      max_tokens: 150,
      temperature: 0.7,
    });
    const aiMessage = completion.choices[0].message.content;
    conversations[sessionId].push({ role: 'assistant', content: aiMessage });
    
    // Save conversation to JSON file
    const savedFileName = saveConversation(sessionId, conversations[sessionId]);
    
    res.status(200).json({ 
      response: aiMessage,
      savedFile: savedFileName,
      messageCount: conversations[sessionId].length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 