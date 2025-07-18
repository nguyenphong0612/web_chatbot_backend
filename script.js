// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Fixed bot responses
const botResponses = {
    greetings: [
        "Hello! How can I help you today?",
        "Hi there! Nice to meet you!",
        "Greetings! What can I assist you with?",
        "Hey! How's your day going?"
    ],
    weather: [
        "I can't check the weather in real-time, but I hope it's nice where you are!",
        "Weather forecasting isn't my specialty, but I'm here for other questions!",
        "I'd love to help with the weather, but I don't have access to current data."
    ],
    help: [
        "I'm here to help! What would you like to know?",
        "Sure! I'd be happy to assist you with any questions.",
        "Of course! What can I help you with today?"
    ],
    thanks: [
        "You're welcome! Is there anything else I can help you with?",
        "My pleasure! Feel free to ask more questions.",
        "Glad I could help! Let me know if you need anything else."
    ],
    default: [
        "That's interesting! Tell me more about that.",
        "I'm not sure I understand. Could you rephrase that?",
        "Interesting question! What made you think of that?",
        "I'm here to chat! What's on your mind?"
    ]
};

// Keywords for response selection
const keywords = {
    greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    weather: ['weather', 'temperature', 'rain', 'sunny', 'cold', 'hot'],
    help: ['help', 'assist', 'support', 'can you help'],
    thanks: ['thank', 'thanks', 'appreciate', 'grateful']
};

// Get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = getCurrentTime();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get bot response based on user input
function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keywords and return appropriate response
    for (const [category, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (lowerMessage.includes(word)) {
                const responses = botResponses[category];
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }
    
    // Return default response if no keywords match
    const defaultResponses = botResponses.default;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Handle sending message
function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Simulate typing delay
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addMessage(botResponse, false);
    }, 500 + Math.random() * 1000); // Random delay between 500-1500ms
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on load
userInput.focus();

// Set initial time
document.getElementById('currentTime').textContent = getCurrentTime(); 