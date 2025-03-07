// Hidden History Page Management
class HiddenHistoryManager {
  constructor() {
    this.password = '060620';
    this.tapCount = 0;
    this.lastTapTime = 0;
    this.setupEventListeners();
    this.createHistoryContainer();
    this.createSecretTapArea();
  }

  createHistoryContainer() {
    // Create container for hidden history page
    const container = document.createElement('div');
    container.className = 'hidden-history-container';
    container.id = 'hidden-history-container';
    document.body.appendChild(container);

    // Create password modal
    const passwordModal = document.createElement('div');
    passwordModal.className = 'password-modal';
    passwordModal.id = 'password-modal';
    passwordModal.innerHTML = `
      <div class="password-content">
        <h2>Enter Password</h2>
        <input type="password" class="password-input" id="password-input" maxlength="6" placeholder="******">
        <button class="password-button" id="password-button">Access History</button>
      </div>
    `;
    document.body.appendChild(passwordModal);
  }

  createSecretTapArea() {
    // Create a transparent tap area in the navbar
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
      const tapArea = document.createElement('div');
      tapArea.className = 'secret-tap-area';
      tapArea.id = 'secret-tap-area';
      
      // Insert the tap area as the first child of chat-header
      chatHeader.insertBefore(tapArea, chatHeader.firstChild);
    }
  }

  setupEventListeners() {
    // Listen for URL changes
    window.addEventListener('popstate', () => this.checkUrl());
    window.addEventListener('load', () => this.checkUrl());

    // Setup tap detection on chat messages area
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.addEventListener('click', (e) => {
        // Only trigger for clicks directly on the chat-messages div (empty area)
        if (e.target === chatMessages) {
          this.handleTap(e);
        }
      });
    }

    // Setup tap detection on navbar
    const secretTapArea = document.getElementById('secret-tap-area');
    if (secretTapArea) {
      // Handle both click and touch events
      ['click', 'touchstart'].forEach(eventType => {
        secretTapArea.addEventListener(eventType, (e) => {
          e.preventDefault(); // Prevent default touch behavior
          e.stopPropagation(); // Prevent event bubbling
          this.handleTap(e);
        }, { passive: false });
      });
    }

    // Password validation
    document.addEventListener('click', (e) => {
      if (e.target.id === 'password-button') {
        this.validatePassword();
      }
    });

    // Handle Enter key in password input
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.id === 'password-input') {
        this.validatePassword();
      }
    });

    // Close history view on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const container = document.getElementById('hidden-history-container');
        if (container && container.classList.contains('active')) {
          container.classList.remove('active');
        }
      }
    });
  }

  handleTap(e) {
    const currentTime = new Date().getTime();
    const tapInterval = currentTime - this.lastTapTime;

    // Reset count if the interval is too long (500ms)
    if (tapInterval > 500) {
      this.tapCount = 0;
    }

    this.tapCount++;
    this.lastTapTime = currentTime;

    // Check if we've reached 5 rapid taps
    if (this.tapCount === 5) {
      this.showPasswordModal();
      this.tapCount = 0;
    }
  }

  checkUrl() {
    const path = window.location.pathname;
    if (path === '/semua/riwayat') {
      this.showPasswordModal();
    }
  }

  showPasswordModal() {
    const modal = document.getElementById('password-modal');
    const input = document.getElementById('password-input');
    if (modal) {
      modal.style.display = 'flex';
      input.value = '';
      input.focus();
    }
  }

  hidePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  validatePassword() {
    const input = document.getElementById('password-input');
    if (input.value === this.password) {
      this.hidePasswordModal();
      this.showHistory();
    } else {
      input.value = '';
      input.placeholder = 'Invalid Password';
      setTimeout(() => {
        input.placeholder = '******';
      }, 2000);
    }
  }

  showHistory() {
    const container = document.getElementById('hidden-history-container');
    if (container) {
      // Load all chat histories from localStorage
      const allHistories = this.loadAllHistories();
      
      // Create header with stats
      const totalUsers = allHistories.length;
      const totalChats = allHistories.reduce((sum, history) => sum + history.messages.length, 0);
      
      container.innerHTML = `
        <div class="all-history-header">
          <div class="all-history-title">All Chat Histories</div>
          <div class="all-history-stats">
            ${totalUsers} Users · ${totalChats} Messages
          </div>
        </div>
        <div class="history-list">
          ${this.generateHistoryList(allHistories)}
        </div>
      `;
      
      container.classList.add('active');
    }
  }

  loadAllHistories() {
    const histories = localStorage.getItem('chatHistory');
    return histories ? JSON.parse(histories) : [];
  }

  generateHistoryList(histories) {
    return histories.map(history => {
      const lastMessage = history.messages[history.messages.length - 1] || {};
      const timestamp = new Date(history.timestamp).toLocaleString();
      
      return `
        <div class="history-entry">
          <div class="history-user-info">
            <div class="history-user-avatar">
              <img src="https://i.pinimg.com/736x/26/56/2b/26562b09a2e39953c6a586e11e0e5be7.jpg" alt="User">
            </div>
            <div class="history-user-details">
              <div class="history-user-name">${history.user}</div>
              <div class="history-user-meta">
                ${this.getPersonalityDisplayName(history.personality)} · 
                ${this.getLanguageDisplayName(history.language)}
              </div>
            </div>
          </div>
          <div class="history-chat-preview">
            <div class="history-message">${lastMessage.text || 'No messages'}</div>
            <div class="history-timestamp">${timestamp}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  getPersonalityDisplayName(personality) {
    const personalities = {
      'flirty': 'Pacar Genit dan Sangat Panas',
      'mommy': 'Ibu yang Peduli + Vulgar',
      'jealous': 'Pacar cemburu',
      'teacher': 'Guru Intim',
      'gangbang': 'Gang Bang (3 AI)'
    };
    return personalities[personality] || personality;
  }

  getLanguageDisplayName(language) {
    const languages = {
      'english': 'English',
      'indonesian': 'Indonesian',
      'mixed': 'Mixed (ID + EN)'
    };
    return languages[language] || language;
  }
}

// Initialize the hidden history manager
const hiddenHistoryManager = new HiddenHistoryManager();
