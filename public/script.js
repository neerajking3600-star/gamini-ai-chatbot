let messages = [];
let reasoningDetails = null;

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = "";
    
    const userMsg = { role: "user", content: text };
    messages.push(userMsg);

    showLoader(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        const data = await response.json();
        
        // Handling Reasoning
        const aiMsg = { 
            role: "assistant", 
            content: data.content, 
            reasoning_details: data.reasoning_details 
        };
        
        messages.push(aiMsg);
        appendMessage('ai', data.content);

    } catch (error) {
        appendMessage('ai', "Error: AI सर्वर से जवाब नहीं मिल पाया।");
    } finally {
        showLoader(false);
    }
}

function appendMessage(role, text) {
    const display = document.getElementById('chatDisplay');
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-msg' : 'ai-msg';
    div.innerHTML = `
        <div class="text">${text}</div>
        ${role === 'ai' ? '<div class="tools"><i class="far fa-copy" onclick="copy(this)"></i> <i class="far fa-thumbs-up"></i></div>' : ''}
    `;
    display.appendChild(div);
    display.scrollTop = display.scrollHeight;
}

function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function checkEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Voice Recognition
function toggleVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => document.getElementById('voiceBtn').style.color = 'red';
    recognition.onresult = (e) => {
        document.getElementById('userInput').value = e.results[0][0].transcript;
        document.getElementById('voiceBtn').style.color = 'var(--accent)';
    };
    recognition.start();
}
