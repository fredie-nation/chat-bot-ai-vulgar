// Hidden History Page Management
class HiddenHistoryManager {
  constructor() {
    // Password: 060620 (plain)
    this.password = '060620';
    this.setupEventListeners();
    this.showPasswordModal();
  }

  setupEventListeners() {
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
  }

  showPasswordModal() {
    const modal = document.getElementById('password-modal');
    const input = document.getElementById('password-input');
    if (modal) {
      modal.style.display = 'flex';
      if (input) {
        input.value = '';
        input.focus();
      }
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
    if (input) {
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
  }

  showHistory() {
    const container = document.getElementById('hidden-history-container');
    if (container) {
      // Load all chat histories from localStorage
      const allHistories = this.loadAllHistories();
      
      // Create header with stats
      const totalUsers = Object.keys(allHistories).length;
      const totalChats = this.calculateTotalChats(allHistories);
      
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
    const histories = localStorage.getItem('chatHistories');
    return histories ? JSON.parse(histories) : {};
  }

  calculateTotalChats(histories) {
    return Object.values(histories).reduce((total, history) => {
      return total + (history.messages ? history.messages.length : 0);
    }, 0);
  }

  formatIndonesianDate(date) {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const d = new Date(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  }

  generateHistoryList(histories) {
    return Object.entries(histories).map(([userId, history]) => {
      const lastMessage = history.messages && history.messages.length > 0 
        ? history.messages[history.messages.length - 1] 
        : { content: 'No messages' };
      const timestamp = this.formatIndonesianDate(history.timestamp || Date.now());
      
      return `
        <div class="history-entry">
          <div class="history-user-info">
            <div class="history-user-avatar">
              <img src="https://i.pinimg.com/736x/26/56/2b/26562b09a2e39953c6a586e11e0e5be7.jpg" alt="User">
            </div>
            <div class="history-user-details">
              <div class="history-user-name">${history.userName || 'Unknown User'}</div>
              <div class="history-user-meta">
                ${this.getPersonalityDisplayName(history.personality)} · 
                ${this.getLanguageDisplayName(history.language)}
              </div>
            </div>
          </div>
          <div class="history-chat-preview">
            <div class="history-message">${lastMessage.content || 'No messages'}</div>
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
    return personalities[personality] || personality || 'Unknown Mode';
  }

  getLanguageDisplayName(language) {
    const languages = {
      'english': 'English',
      'indonesian': 'Indonesian',
      'mixed': 'Mixed (ID + EN)'
    };
    return languages[language] || language || 'Unknown Language';
  }
}

// Initialize the hidden history manager
document.addEventListener('DOMContentLoaded', () => {
  window.hiddenHistoryManager = new HiddenHistoryManager();
});
