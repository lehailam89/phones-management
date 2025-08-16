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

    if (openChatbox) {
        openChatbox.addEventListener('click', () => {
            chatbox.style.display = 'flex';
        });
    }

    const scrollToBottom = () => {
        const lastMessage = messages.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const sendMessage = async () => {
        const message = chatInput.value;
        if (!message) return;

        chatInput.value = ''; // Xóa input ngay khi gửi

        const messageElement = document.createElement('div');
        messageElement.textContent = `You: ${message}`;
        messageElement.classList.add('message', 'user');
        messages.appendChild(messageElement);
        scrollToBottom();

        try {
            const response = await fetch('/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            const replyElement = document.createElement('div');
            replyElement.textContent = `Gemini: ${data.response}`;
            replyElement.classList.add('message', 'ai');
            messages.appendChild(replyElement);
            scrollToBottom();
        } catch (error) {
            const errorElement = document.createElement('div');
            errorElement.textContent = 'Error: Unable to connect to server.';
            errorElement.classList.add('message', 'ai');
            messages.appendChild(errorElement);
            scrollToBottom();
        }
    };

    sendChat.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    closeChatbox.addEventListener('click', () => {
        chatbox.style.display = 'none';
    });
});
// End Giao tiếp với AI
