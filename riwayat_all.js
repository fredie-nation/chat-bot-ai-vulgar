/* Hidden History Page Styles */
.hidden-history-container {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--chat-bg);
  z-index: 9999;
  overflow-y: auto;
  padding: 20px;
}

.hidden-history-container.active {
  display: block;
}

/* Password Modal */
.password-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.password-content {
  background: var(--chat-bg);
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.password-input {
  width: 100%;
  padding: 15px;
  margin: 20px 0;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
  background: var(--input-bg);
  color: var(--text-color);
}

.password-input:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.password-button {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.password-button:hover {
  transform: translateY(-2px);
}

/* History List Styles */
.all-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 15px;
  margin-bottom: 20px;
}

.all-history-title {
  font-size: 24px;
  font-weight: bold;
}

.all-history-stats {
  font-size: 14px;
  opacity: 0.9;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-entry {
  background: var(--input-bg);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s;
  cursor: pointer;
}

.history-entry:hover {
  transform: translateY(-2px);
}

.history-user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.history-user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.history-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-user-details {
  flex: 1;
}

.history-user-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 5px;
}

.history-user-meta {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
}

.history-chat-preview {
  background: var(--chat-bg);
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}

.history-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
}

.history-timestamp {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 5px;
  text-align: right;
}

/* Tap Area Styles */
.chat-header {
  position: relative;
}

.secret-tap-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .hidden-history-container {
    padding: 10px;
  }

  .all-history-header {
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .all-history-title {
    font-size: 20px;
  }

  .history-entry {
    padding: 15px;
  }

  .history-user-avatar {
    width: 40px;
    height: 40px;
  }

  .history-user-name {
    font-size: 16px;
  }

  .history-chat-preview {
    padding: 10px;
  }
}

/* Scrollbar Styling */
.hidden-history-container::-webkit-scrollbar {
  width: 6px;
}

.hidden-history-container::-webkit-scrollbar-track {
  background: transparent;
}

.hidden-history-container::-webkit-scrollbar-thumb {
  background-color: var(--accent-color);
  border-radius: 10px;
}

.hidden-history-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-color);
}
