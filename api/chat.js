const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory conversation store
const conversations = {};

// Function to save conversation to Supabase
async function saveConversationToSupabase(sessionId, conversation) {
  try {
    const { data, error } = await supabase
      .from('conversations_web_chatbot')
      .insert([
        {
          conversation_id: sessionId,
          messages: conversation
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log('Conversation saved to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
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
    
    // Save conversation to Supabase
    const savedData = await saveConversationToSupabase(sessionId, conversations[sessionId]);
    // send response to frontend (client)
    res.status(200).json({ 
      response: aiMessage,
      savedToSupabase: savedData ? true : false,
      //messageCount: conversations[sessionId].length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}; 