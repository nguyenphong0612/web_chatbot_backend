const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');
const closeBtn = document.querySelector('.close');

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

// Hiển thị modal lịch sử
function showHistoryModal() {
  historyModal.style.display = 'block';
  loadConversationHistory();
}

// Ẩn modal lịch sử
function hideHistoryModal() {
  historyModal.style.display = 'none';
}

// Load lịch sử hội thoại từ Supabase
async function loadConversationHistory() {
  // Hiển thị loading
  historyList.innerHTML = '<div class="loading-history">Đang tải lịch sử...</div>';
  
  try {
    const response = await fetch('/api/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.conversations && data.conversations.length > 0) {
      displayConversations(data.conversations);
    } else {
      historyList.innerHTML = '<div class="no-history">Chưa có lịch sử hội thoại nào</div>';
    }
  } catch (error) {
    console.error('Error loading history:', error);
    historyList.innerHTML = '<div class="no-history">Lỗi khi tải lịch sử: ' + error.message + '</div>';
  }
}

// Hiển thị danh sách cuộc hội thoại
function displayConversations(conversations) {
  historyList.innerHTML = '';
  
  conversations.forEach(conversation => {
    const conversationDiv = document.createElement('div');
    conversationDiv.className = 'conversation-item';
    
    // Format ngày tháng
    const date = new Date(conversation.created_at);
    const formattedDate = date.toLocaleString('vi-VN');
    
    // Lấy preview tin nhắn đầu tiên
    let preview = 'Không có tin nhắn';
    if (conversation.messages && conversation.messages.length > 0) {
      const firstMessage = conversation.messages[0];
      if (firstMessage.content) {
        preview = firstMessage.content.length > 100 
          ? firstMessage.content.substring(0, 100) + '...' 
          : firstMessage.content;
      }
    }
    
    conversationDiv.innerHTML = `
      <div class="conversation-header">
        <span>Cuộc hội thoại #${conversation.id}</span>
        <span class="conversation-date">${formattedDate}</span>
      </div>
      <div class="conversation-id">ID: ${conversation.conversation_id}</div>
      <div class="conversation-preview">${preview}</div>
    `;
    
    // Thêm event listener để xem chi tiết
    conversationDiv.addEventListener('click', () => {
      showConversationDetail(conversation);
    });
    
    historyList.appendChild(conversationDiv);
  });
}

// Hiển thị chi tiết cuộc hội thoại
function showConversationDetail(conversation) {
  // Tạo modal mới để hiển thị chi tiết
  const detailModal = document.createElement('div');
  detailModal.className = 'modal';
  detailModal.style.display = 'block';
  
  const date = new Date(conversation.created_at);
  const formattedDate = date.toLocaleString('vi-VN');
  
  let messagesHtml = '';
  if (conversation.messages && conversation.messages.length > 0) {
    conversation.messages.forEach(message => {
      const roleClass = message.role === 'user' ? 'user' : 'assistant';
      messagesHtml += `
        <div class="message ${roleClass}">
          <strong>${message.role === 'user' ? 'Bạn' : 'Bot'}:</strong> ${message.content}
        </div>
      `;
    });
  }
  
  detailModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Chi tiết cuộc hội thoại #${conversation.id}</h3>
        <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
      </div>
      <div style="padding: 20px;">
        <div style="margin-bottom: 15px; color: #666;">
          <strong>ID:</strong> ${conversation.conversation_id}<br>
          <strong>Thời gian:</strong> ${formattedDate}
        </div>
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 15px; background: #f9f9f9;">
          ${messagesHtml || '<p>Không có tin nhắn nào</p>'}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(detailModal);
  
  // Đóng modal khi click bên ngoài
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.remove();
    }
  });
}

// Event listeners
historyBtn.addEventListener('click', showHistoryModal);
closeBtn.addEventListener('click', hideHistoryModal);

// Đóng modal khi click bên ngoài
window.addEventListener('click', (event) => {
  if (event.target === historyModal) {
    hideHistoryModal();
  }
});

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