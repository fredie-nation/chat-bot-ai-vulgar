// Chat History Management with Enhanced Session Handling
export class ChatHistory {
  constructor() {
    this.histories = this.loadHistories();
    this.setupEventListeners();
    this.currentChatId = null;
    this.currentSession = null;
    this.setupMessageObserver();
    this.interceptFormSubmission();
    this.setupSessionManagement();
    
    // Migrate existing histories to include sessionData if needed
    this.migrateHistories();
  }

  migrateHistories() {
    let needsMigration = false;
    this.histories = this.histories.map(history => {
      if (!history.sessionData) {
        needsMigration = true;
        return {
          ...history,
          sessionData: {
            scrollPosition: 0,
            selectedCharacters: history.personality === 'gangbang' ? ['hinata', 'ino', 'sakura'] : null
          }
        };
      }
      return history;
    });
    
    if (needsMigration) {
      this.saveHistories();
    }
  }

  loadHistories() {
    const histories = localStorage.getItem('chatHistories');
    return histories ? JSON.parse(histories) : [];
  }

  saveHistories() {
    localStorage.setItem('chatHistories', JSON.stringify(this.histories));
  }

  setupSessionManagement() {
    // Simplified session management - only for current session
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    if (sessionId) {
      this.currentChatId = sessionId;
      const history = this.histories.find(h => h.id === sessionId);
      if (history) {
        this.currentSession = history;
      }
    }
  }

  addNewHistory(userName, language, personality, timestamp = new Date()) {
    const history = {
      id: `chat_${Date.now()}`,
      userName,
      language,
      personality,
      timestamp,
      lastMessage: 'Started new chat',
      messages: [],
      unreadCount: 0,
      sessionData: {
        scrollPosition: 0,
        selectedCharacters: personality === 'gangbang' ? ['hinata', 'ino', 'sakura'] : null
      }
    };

    this.histories.unshift(history);
    this.currentChatId = history.id;
    this.currentSession = history;
    this.saveHistories();
    
    // Immediately update history list
    this.updateHistoryList();
    
    return history.id;
  }

  formatAIResponse(message, personality) {
    let formattedMessage = message;
    
    switch (personality) {
      case 'flirty':
        formattedMessage = `💕 ${message}`;
        break;
      case 'mommy':
        formattedMessage = `🤗 ${message}`;
        break;
      case 'jealous':
        formattedMessage = `😠 ${message}`;
        break;
      case 'teacher':
        formattedMessage = `📚 ${message}`;
        break;
      case 'gangbang':
        break;
    }

    return formattedMessage;
  }

  updateLastMessage(chatId, message, isUser = false, customSender = null) {
    const history = this.histories.find(h => h.id === chatId);
    if (history) {
      history.lastMessage = message;
      history.timestamp = new Date();
      
      let sender = isUser ? 'user' : history.personality;
      if (customSender) {
        sender = customSender.toLowerCase();
      } else if (!isUser && history.personality === 'gangbang') {
        sender = 'hinata';
      }

      let formattedMessage = isUser ? message : this.formatAIResponse(message, history.personality);

      const messageObj = {
        content: formattedMessage,
        timestamp: new Date(),
        isUser,
        sender,
        type: 'text',
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (!isUser) {
        messageObj.content = this.cleanAIResponse(formattedMessage);
      }

      history.messages.push(messageObj);
      this.saveHistories();
      this.updateHistoryList();
    }
  }

  cleanAIResponse(message) {
    let cleaned = message;
    
    const patterns = [
      /\[System\].*?\[\/System\]/gi,
      /\{System\}.*?\{\/System\}/gi,
      /\(System:.*?\)/gi,
      /^(As an AI|As Hinata|As your virtual|I am an AI|I am a virtual|I am programmed).*/gim
    ];

    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    cleaned = cleaned.trim()
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+/gm, '');

    return cleaned;
  }

  setupEventListeners() {
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history-modal');

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.openHistoryModal();
      });
    }

    if (closeHistoryBtn) {
      closeHistoryBtn.addEventListener('click', () => {
        this.closeHistoryModal();
      });
    }

    if (historyModal) {
      historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
          this.closeHistoryModal();
        }
      });
    }

    document.addEventListener('submit', (e) => {
      const startChatBtn = document.getElementById('start-chat-btn');
      if (e.target.contains(startChatBtn)) {
        this.handleNewChatStart();
      }
    });
  }

  setupMessageObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('message')) {
              const isUser = node.classList.contains('user');
              const messageContent = node.querySelector('.message-content')?.textContent || node.textContent;
              
              let sender = null;
              if (!isUser) {
                const senderElement = node.querySelector('.message-sender');
                if (senderElement) {
                  sender = senderElement.textContent.toLowerCase();
                }
              }
              
              if (this.currentChatId && messageContent) {
                this.updateLastMessage(this.currentChatId, messageContent, isUser, sender);
              }
            }
          });
        }
      });
    });

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      observer.observe(chatMessages, {
        childList: true,
        subtree: true
      });
    }
  }

  interceptFormSubmission() {
    const startChatBtn = document.getElementById('start-chat-btn');
    if (startChatBtn) {
      startChatBtn.addEventListener('click', () => {
        setTimeout(() => {
          const userName = document.getElementById('user-name').value;
          const language = document.querySelector('input[name="language"]:checked')?.value;
          const personality = document.querySelector('input[name="personality"]:checked')?.value;
          
          if (userName && language && personality) {
            this.addNewHistory(userName, language, personality);
          }
        }, 0);
      });
    }
  }

  handleNewChatStart() {
    const userName = document.getElementById('user-name').value;
    const language = document.querySelector('input[name="language"]:checked')?.value;
    const personality = document.querySelector('input[name="personality"]:checked')?.value;
    
    if (userName && language && personality) {
      this.addNewHistory(userName, language, personality);
    }
  }

  openHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
      this.updateHistoryList();
      historyModal.classList.add('active');
    }
  }

  closeHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
      historyModal.classList.remove('active');
    }
  }

  // Function to generate chat history text content
  generateChatHistoryText(history) {
    let content = `Chat History with ${history.userName}\n`;
    content += `Mode: ${this.getPersonalityLabel(history.personality)}\n`;
    content += `Language: ${history.language}\n`;
    content += `Started: ${new Date(history.timestamp).toLocaleString()}\n\n`;
    content += `=`.repeat(50) + '\n\n';

    history.messages.forEach((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      const sender = msg.isUser ? history.userName : (msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1));
      content += `[${timestamp}] ${sender}:\n${msg.content}\n\n`;
    });

    return content;
  }

  // Function to download chat history
  downloadChatHistory(history) {
    const content = this.generateChatHistoryText(history);
    const timestamp = new Date(history.timestamp);
    const fileName = `${history.userName}_${timestamp.getHours()}-${timestamp.getMinutes()}_${timestamp.getDate()}-${timestamp.getMonth() + 1}-${timestamp.getFullYear()}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  updateHistoryList() {
    const historyList = document.querySelector('.chat-history-list');
    if (!historyList) return;

    historyList.innerHTML = '';

    const sortedHistories = [...this.histories].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    if (sortedHistories.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <p>No chat history yet</p>
        </div>
      `;
      return;
    }

    sortedHistories.forEach(history => {
      const historyItem = document.createElement('div');
      historyItem.className = 'chat-history-item';
      historyItem.setAttribute('data-chat-id', history.id);

      const timestamp = new Date(history.timestamp);
      const formattedDate = this.formatDate(timestamp);

      historyItem.innerHTML = `
        <div class="history-avatar">
          <img src="https://i.pinimg.com/736x/26/56/2b/26562b09a2e39953c6a586e11e0e5be7.jpg" alt="Chat">
        </div>
        <div class="history-content">
          <div class="history-header">
            <h3>${history.userName}'s Chat</h3>
            <span class="history-time">${formattedDate}</span>
          </div>
          <div class="history-details">
            <p class="history-mode">${this.getPersonalityLabel(history.personality)} · ${history.language}</p>
            <p class="history-last-message">${this.truncateLastMessage(history.lastMessage)}</p>
          </div>
        </div>`;

      // Add click event to download chat history
      historyItem.addEventListener('click', () => {
        this.downloadChatHistory(history);
      });

      historyList.appendChild(historyItem);
    });
  }

  truncateLastMessage(message) {
    return message.length > 50 ? message.substring(0, 47) + '...' : message;
  }

  formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    if (diff < oneDay) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < oneWeek) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  getPersonalityLabel(personality) {
    const labels = {
      flirty: 'Flirty Mode',
      mommy: 'Mommy Mode',
      jealous: 'Jealous Mode',
      teacher: 'Teacher Mode',
      gangbang: 'Gang Bang Mode'
    };
    return labels[personality] || personality;
  }
}

// Initialize chat history
const chatHistory = new ChatHistory();
