const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory conversation store
const conversations = {};

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
    res.status(200).json({ response: aiMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 