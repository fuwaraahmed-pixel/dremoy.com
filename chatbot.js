// Dremoy AI Chatbot Logic
function initDremoyChatbot() {
    // Inject HTML
    const chatWidgetHTML = `
        <div id="dremoy-chat-widget">
            <div id="dremoy-chat-window">
                <div id="dremoy-chat-header">
                    <div class="chat-header-info">
                        <img src="/image/Favicon.png" alt="Dremoy Logo">
                        <div>
                            <span class="chat-title">Dremoy AI</span>
                            <span class="chat-subtitle">Online • Ask me anything</span>
                        </div>
                    </div>
                    <button id="dremoy-chat-close"><i class="fas fa-times"></i></button>
                </div>
                <div id="dremoy-chat-messages">
                    <div class="chat-message bot">
                        Hi there! 👋 I am the Dremoy AI Assistant. How can I help you grow your business today?
                    </div>
                    <div class="typing-indicator" id="dremoy-typing">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                <div id="dremoy-chat-input-area">
                    <input type="text" id="dremoy-chat-input" placeholder="Type your message..." autocomplete="off">
                    <button id="dremoy-chat-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button id="dremoy-chat-btn" aria-label="Open Chat">
                <i class="fas fa-comment-dots"></i>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);

    // Elements
    const chatBtn = document.getElementById('dremoy-chat-btn');
    const chatWindow = document.getElementById('dremoy-chat-window');
    const closeBtn = document.getElementById('dremoy-chat-close');
    const messagesContainer = document.getElementById('dremoy-chat-messages');
    const inputField = document.getElementById('dremoy-chat-input');
    const sendBtn = document.getElementById('dremoy-chat-send');
    const typingIndicator = document.getElementById('dremoy-typing');

    // Replace this with your actual Vercel URL once deployed
    const BACKEND_URL = "https://chatbot-backend-vert-tau.vercel.app/api/chat.js";
    let chatHistory = [];

    // Toggle Chat Window
    const toggleChat = () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            setTimeout(() => inputField.focus(), 300);
            chatBtn.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            chatBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
        }
    };

    chatBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    const formatText = (text) => {
        // Basic markdown formatting (bold, newlines)
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    };

    // Add Message to UI
    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        
        if(sender === 'bot') {
            msgDiv.innerHTML = formatText(text);
        } else {
            msgDiv.textContent = text;
        }

        // Insert before typing indicator
        messagesContainer.insertBefore(msgDiv, typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Send Message Logic
    const sendMessage = async () => {
        const message = inputField.value.trim();
        if (!message) return;

        // UI Updates
        appendMessage(message, 'user');
        inputField.value = '';
        typingIndicator.classList.add('active');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // Call API
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            if (!response.ok) {
                throw new Error('API Error');
            }

            const data = await response.json();
            
            // Save to history (Gemini format)
            chatHistory.push({ role: 'user', parts: [{text: message}] });
            chatHistory.push({ role: 'model', parts: [{text: data.text}] });

            typingIndicator.classList.remove('active');
            appendMessage(data.text, 'bot');

        } catch (error) {
            console.error('Chat Error:', error);
            typingIndicator.classList.remove('active');
            appendMessage("Sorry, I am having trouble connecting right now. Please message us on WhatsApp!", 'bot');
        }
    };

    // Listeners
    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Ensure the DOM is fully loaded before injecting
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDremoyChatbot);
} else {
    initDremoyChatbot();
}
