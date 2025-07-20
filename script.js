const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Generate a simple sessionId for the user (could be improved)
const sessionId = 'sess-' + Math.random().toString(36).substr(2, 9);

function appendMessage(role, content) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  msgDiv.textContent = content;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message assistant loading';
  loadingDiv.textContent = 'Analyzing...';
  loadingDiv.id = 'loading-message';
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-message');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  
  appendMessage('user', message);
  userInput.value = '';
  showLoading();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    hideLoading();
    console.log(data);
    if (data.response) {
      appendMessage('assistant', data.response);
      
      // Show save status (optional)
      if (data.savedToSupabase) {
        console.log('✅ Conversation saved to Supabase');
      } else {
        console.log('❌ Failed to save to Supabase');
      }
    } else if (data.error) {
      appendMessage('assistant', 'Error: ' + data.error);
    }
  } catch (err) {
    hideLoading();
    console.error('Network error:', err);
    appendMessage('assistant', 'Network error. Please try again.');
  }
}); 