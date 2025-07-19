const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000; // 3000

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory conversation store: { sessionId: [ { role, content }, ... ] }
const conversations = {};

app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Missing message or sessionId' });
  }

  // Initialize conversation if new session
  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }
  conversations[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversations[sessionId],
      max_tokens: 150, // Giới hạn độ dài response
      temperature: 0.7, // Giảm độ sáng tạo để tiết kiệm
    });
    const aiMessage = completion.choices[0].message.content;
    conversations[sessionId].push({ role: 'assistant', content: aiMessage });
    res.json({ response: aiMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 