// ==================== CHAT CONFIGURATION ====================
const CHAT_API_URL = '/api/chat';

// ==================== INITIALIZE CHAT ====================
document.addEventListener('DOMContentLoaded', function() {
    loadChatSuggestions();
});

// ==================== LOAD SUGGESTIONS ====================
async function loadChatSuggestions() {
    try {
        const response = await fetch(`${CHAT_API_URL}/suggestions`);
        const data = await response.json();
        
        if (data.success) {
            renderSuggestions(data.suggestions);
        }
    } catch (error) {
        console.error('Error al cargar sugerencias:', error);
    }
}

function renderSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('chat-suggestions');
    if (!suggestionsContainer) return;
    
    // Mostrar solo 3 sugerencias aleatorias
    const randomSuggestions = suggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    suggestionsContainer.innerHTML = randomSuggestions.map(suggestion => `
        <span class="suggestion-chip" onclick="useSuggestion('${suggestion}')">
            ${suggestion}
        </span>
    `).join('');
}

// ==================== USE SUGGESTION ====================
function useSuggestion(suggestion) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = suggestion;
        sendChatMessage();
    }
}

// ==================== SEND MESSAGE ====================
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    
    if (!question) {
        return;
    }
    
    // Agregar mensaje del usuario
    addMessage(question, 'user');
    
    // Limpiar input
    input.value = '';
    
    // Mostrar indicador de "escribiendo..."
    addTypingIndicator();
    
    try {
        const response = await fetch(`${CHAT_API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: question })
        });
        
        const data = await response.json();
        
        // Remover indicador
        removeTypingIndicator();
        
        if (data.success) {
            addMessage(data.answer, 'bot');
        } else {
            addMessage('Lo siento, ocurri un error al procesar tu pregunta. Por favor intenta de nuevo.', 'bot');
        }
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        removeTypingIndicator();
        addMessage('Error de conexin. Por favor verifica tu conexin e intenta nuevamente.', 'bot');
    }
}

// ==================== ADD MESSAGE TO CHAT ====================
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-bubble">${text}</div>
        <span class="message-time">${time}</span>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Si el mensaje es del bot, hablar
    if (sender === 'bot') {
        speak(text);
    }
}

// ==================== TEXT TO SPEECH ====================
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES'; // Cambia el idioma si lo necesitas
        window.speechSynthesis.speak(utterance);
    }
}

// ==================== TYPING INDICATOR ====================
function addTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message bot';
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.innerHTML = `
        <div class="message-bubble">
            <div class="spinner"></div>
            <span style="margin-left: 0.5rem;">Escribiendo...</span>
        </div>
    `;
    
    chatMessages.appendChild(indicatorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// ==================== HANDLE ENTER KEY ====================
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// ==================== QUICK ACTIONS ====================
function askAboutKPI(kpiName) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = `Cul es el ${kpiName} actual?`;
        sendChatMessage();
    }
}

function askAboutEquipment(equipmentCode) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = `Cul es el estado del equipo ${equipmentCode}?`;
        sendChatMessage();
    }
}

function askWhyPrediction(predictionId) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = `Por qu la prediccin #${predictionId} tiene ese resultado?`;
        sendChatMessage();
    }
}

// ==================== CLEAR CHAT ====================
function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="message-bubble">
                    1Hola! Soy tu asistente de mantenimiento predictivo. En qu puedo ayudarte?
                </div>
                <span class="message-time">Ahora</span>
            </div>
        `;
    }
}

