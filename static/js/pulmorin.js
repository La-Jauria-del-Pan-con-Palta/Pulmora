const pulmorinButton = document.getElementById('pulmorin-button');
const pulmorinChat = document.getElementById('pulmorin-chat');
const closeChat = document.getElementById('close-chat');
const messagesContainer = document.getElementById('pulmorin-messages');
const inputField = document.getElementById('pulmorin-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.querySelector('.typing-indicator');

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

pulmorinButton.addEventListener('click', () => {
    pulmorinChat.classList.toggle('active');
    if (pulmorinChat.classList.contains('active')) {
        inputField.focus();
    }
});

closeChat.addEventListener('click', () => {
    pulmorinChat.classList.remove('active');
});

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.insertBefore(messageDiv, typingIndicator);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function toggleTyping(show) {
    typingIndicator.classList.toggle('active', show);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage(message) {
    try {
        toggleTyping(true);
        sendButton.disabled = true;
        inputField.disabled = true;

        const response = await fetch('/api/chatbox/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        toggleTyping(false);
        sendButton.disabled = false;
        inputField.disabled = false;
        inputField.focus();

        if (data.success) {
            addMessage(data.response);
        } else {
            addMessage('Lo siento, hubo un error. Por favor intenta de nuevo.');
            console.error('Error del servidor:', data.error);
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        toggleTyping(false);
        sendButton.disabled = false;
        inputField.disabled = false;
        inputField.focus();
        addMessage('Lo siento, no pude conectarme al servidor. Por favor intenta más tarde.');
    }
}

function handleSend() {
    const message = inputField.value.trim();
    
    if (message === '') return;
    
    addMessage(message, true);
    inputField.value = '';
    
    sendMessage(message);
}

sendButton.addEventListener('click', handleSend);

inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
    }
});

inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

console.log('Pulmorin widget cargado correctamente');