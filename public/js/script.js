//Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert){
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden");
    }, time);

    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    });

}
//End Alert

//Button Go Back
const buttonsGoBack = document.querySelectorAll("[button-go-back]");
if(buttonsGoBack.length > 0){   
    buttonsGoBack.forEach(button => {
        button.addEventListener("click", () => {
            window.history.back();
        });
    });
}
//End Button Go Back

//Phân trang
document.addEventListener('DOMContentLoaded', () => {
    const paginationButtons = document.querySelectorAll('[button-pagination]');

    paginationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('button-pagination');
            const url = new URL(window.location.href);
            url.searchParams.set('page', page);
            window.location.href = url.href;
        });
    });
});
//End Phân trang

// Giao tiếp với API Gemini
document.addEventListener('DOMContentLoaded', () => {
    const chatbox = document.getElementById('chatbox');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    const messages = document.getElementById('messages');
    const closeChatbox = document.getElementById('close-chatbox');
    const openChatbox = document.getElementById('open-chatbox');

    // Lưu trữ session ID để duy trì ngữ cảnh cuộc trò chuyện
    let currentSessionId = localStorage.getItem('chatSessionId') || null;

    if (openChatbox) {
        openChatbox.addEventListener('click', () => {
            chatbox.style.display = 'flex';
            // Hiển thị thông báo chào mừng nếu là session mới
            if (!currentSessionId && messages && messages.children.length === 0) {
                const welcomeMessage = createMessageElement(
                    'Xin chào! Tôi là trợ lý ảo của Lâm Mobiles. Tôi có thể giúp bạn tìm hiểu về các sản phẩm điện thoại, giá cả, và tư vấn lựa chọn phù hợp. Bạn cần hỗ trợ gì hôm nay?', 
                    false
                );
                messages.appendChild(welcomeMessage);
                scrollToBottom();
            }
        });
    }

    const scrollToBottom = () => {
        if (messages) {
            // Scroll mượt mà và chính xác
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 50);
        }
    };

    const createMessageElement = (content, isUser = false) => {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${isUser ? 'user-message' : 'ai-message'}`;
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        if (isUser) {
            avatar.innerHTML = '👤';
        } else {
            avatar.innerHTML = '🤖';
        }
        
        // Message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Sender name
        const senderName = document.createElement('div');
        senderName.className = 'sender-name';
        senderName.textContent = isUser ? 'Bạn' : 'Lâm Mobiles';
        
        // Message text
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = content;
        
        // Timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Assemble message
        messageContent.appendChild(senderName);
        messageContent.appendChild(messageText);
        messageContent.appendChild(timestamp);
        
        if (isUser) {
            messageWrapper.appendChild(messageContent);
            messageWrapper.appendChild(avatar);
        } else {
            messageWrapper.appendChild(avatar);
            messageWrapper.appendChild(messageContent);
        }
        
        messageContainer.appendChild(messageWrapper);
        return messageContainer;
    };

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userMessage = createMessageElement(message, true);
        if (messages) {
            messages.appendChild(userMessage);
            scrollToBottom();
        }

        // Clear input
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message-container ai-message">
                <div class="message-wrapper">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="sender-name">Lâm Mobiles</div>
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (messages) {
            messages.appendChild(typingIndicator);
            scrollToBottom();
        }

        try {
            const response = await fetch('/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    sessionId: currentSessionId 
                }),
            });
            const data = await response.json();
            
            // Lưu sessionId để duy trì ngữ cảnh
            if (data.sessionId) {
                currentSessionId = data.sessionId;
                localStorage.setItem('chatSessionId', currentSessionId);
            }
            
            // Remove typing indicator
            if (messages && typingIndicator.parentNode) {
                messages.removeChild(typingIndicator);
            }
            
            // Add AI response với thông tin metadata
            const aiMessage = createMessageElement(data.response, false);
            
            // Thêm indicator số tin nhắn trong cuộc trò chuyện
            if (data.messageCount) {
                const contextIndicator = document.createElement('div');
                contextIndicator.className = 'context-indicator';
                contextIndicator.style.cssText = 'font-size: 10px; color: #666; margin-top: 5px;';
                contextIndicator.textContent = `💬 Tin nhắn ${data.messageCount} trong cuộc trò chuyện`;
                aiMessage.querySelector('.message-content').appendChild(contextIndicator);
            }
            
            // Thêm indicator nếu không phải AI response
            if (data.metadata && !data.metadata.isAIResponse) {
                const indicator = document.createElement('div');
                indicator.className = 'quota-indicator';
                indicator.style.cssText = 'font-size: 10px; color: #ff6b6b; margin-top: 5px;';
                indicator.textContent = data.metadata.quotaExceeded ? 
                    '⚠️ AI quota exceeded - using smart fallback' : 
                    '💡 Smart response';
                aiMessage.querySelector('.message-content').appendChild(indicator);
            }
            
            if (messages) {
                messages.appendChild(aiMessage);
                scrollToBottom();
            }
        } catch (error) {
            // Remove typing indicator
            if (messages && typingIndicator.parentNode) {
                messages.removeChild(typingIndicator);
            }
            
            // Add error message
            const errorMessage = createMessageElement('Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.', false);
            if (messages) {
                messages.appendChild(errorMessage);
                scrollToBottom();
            }
        }
    };

    if (sendChat) {
        sendChat.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Ngăn không cho form submit và scroll trang
                sendMessage();
            }
        });
        
        // Ngăn không cho textarea tự động resize và scroll trang
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (closeChatbox) {
        closeChatbox.addEventListener('click', () => {
            if (chatbox) {
                chatbox.style.display = 'none';
            }
        });
    }

    // Thêm nút xóa lịch sử cuộc trò chuyện
    const clearHistoryButton = document.getElementById('clear-chat-history');
    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            // Xóa session ID
            currentSessionId = null;
            localStorage.removeItem('chatSessionId');
            
            // Xóa tin nhắn hiện tại
            if (messages) {
                messages.innerHTML = '';
            }
            
            // Hiển thị thông báo
            const clearMessage = createMessageElement('Đã xóa lịch sử cuộc trò chuyện. Cuộc trò chuyện mới bắt đầu!', false);
            if (messages) {
                messages.appendChild(clearMessage);
                scrollToBottom();
            }
        });
    }
});
// End Giao tiếp với AI
