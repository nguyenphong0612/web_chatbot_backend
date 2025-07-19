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
  loadingDiv.textContent = 'Đang xử lý...';
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
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    const data = await res.json();
    hideLoading();
    
    if (data.response) {
      appendMessage('assistant', data.response);
    } else if (data.error) {
      appendMessage('assistant', 'Lỗi: ' + data.error);
    }
  } catch (err) {
    hideLoading();
    appendMessage('assistant', 'Lỗi kết nối mạng.');
  }
}); 