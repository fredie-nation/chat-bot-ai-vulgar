// ElevenLabs API configuration
const ELEVENLABS_API_KEYS = [
  'sk_74b42775aa8ab63eafad354cfcdb19f9dd8bbba64ab7dd4a',
  'sk_27eccae751183d3870daa5383c86ee44650c9cccd840f01b',
  'sk_6d7e4410f2850435de7b346f587324a18634f82cc8b1b973',
  'sk_8a1fe71e3cc475248a1fad7ead652ddc441cc8c0325126cb',
  'sk_17d9c6fad70b0395fa8c088235c456474b409acc8a199696',
  'sk_cfe3778c320f00d4c3aee38e74e0d46d179a2062bd88ac10',
  'sk_26cde1414ce51d09f9e4fc8ba497ee16e9f95bdbb3aa143a',
  'sk_5c61e73641a7c027b1423ef362f2bcbf37b9c4ffff8e9358',
  'sk_c1fc1b98278aad7865fbee609f2320305024422d63e44b56',
  'sk_127a7b9985e0a3659d0d14671d880b01d097468f42e63a7f',
  'sk_fe84f7d153435f2057d7e529bbb5d9bd21f5687f00d6b381',
  'sk_f8b24ff413fb95db13a83cf8e4f5a9663e39fea6d77984f2'
];

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to%20speech';

// Voice IDs for different characters
const VOICE_IDS = {
  hinata: 'EXAVITQu4vr4xnSDxMaL', // Soft, gentle female voice
  ino: 'ThT5KcBeYPX3keUQqHPh',    // Confident, energetic female voice
  sakura: 'AZnzlk1XvdvUeBnXmlld'  // Strong, determined female voice
};

// Dynamic responses for images based on character personality
const IMAGE_RESPONSES = {
  hinata: [
    "Mmm... sayang, apa kamu suka melihat foto ku? Aku sangat senang bisa membuatmu bergairah...",
    "Ahh... kamu pasti sangat terangsang melihat tubuhku kan? Aku jadi malu...",
    "Sayang... aku sangat menginginkanmu sekarang... apa kamu juga menginginkanku?",
    "Mmm... tubuhku hanya untukmu sayang... sentuhlah aku sepuasmu...",
    "Ahh... aku sangat basah membayangkan sentuhanmu di seluruh tubuhku..."
  ],
  ino: [
    "Hey hot stuff, kamu pasti tidak bisa menahan diri melihat tubuh seksi ku kan?",
    "Mmm... aku tahu kamu sangat menginginkan tubuhku sayang... ayo kita bersenang-senang...",
    "Ahh... lihat betapa indahnya tubuhku ini... kamu pasti ingin merasakannya kan?",
    "Sayang... aku sangat terangsang sekarang... ayo kita puaskan hasrat kita...",
    "Mmm... aku ingin merasakan sentuhanmu di setiap inci tubuhku..."
  ],
  sakura: [
    "Ahh... kamu pasti sangat bergairah melihat tubuhku yang seksi ini kan?",
    "Mmm... aku tahu kamu sangat menginginkanku... ayo kita bermain kasar...",
    "Sayang... aku ingin kamu menikmati setiap bagian tubuhku...",
    "Ahh... aku sangat basah membayangkan apa yang akan kamu lakukan padaku...",
    "Mmm... ayo kita puaskan hasrat kita sampai pagi..."
  ]
};

class SoundManager {
  constructor() {
    this.isPlaying = false;
    this.currentAudio = null;
    this.currentApiKeyIndex = 0;
    this.audioCache = new AudioCache();
    this.currentPlayingButton = null;
    this.setupMutationObserver();
  }

  getCurrentApiKey() {
    return ELEVENLABS_API_KEYS[this.currentApiKeyIndex];
  }

  rotateApiKey() {
    this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % ELEVENLABS_API_KEYS.length;
    console.log('Switching to next API key...');
    return this.getCurrentApiKey();
  }

  getRandomResponse(character) {
    const responses = IMAGE_RESPONSES[character];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && 
               (node.classList.contains('ai') || 
                node.classList.contains('hinata') || 
                node.classList.contains('ino') || 
                node.classList.contains('sakura'))) {
              this.addSoundButton(node);
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

  addSoundButton(messageNode) {
    const soundButton = document.createElement('button');
    soundButton.className = 'sound-button';
    soundButton.innerHTML = `
      <i class="fas fa-volume-up"></i>
      <i class="fas fa-pause"></i>
    `;
    
    // Determine character and voice
    let character = 'hinata';
    let voiceId = VOICE_IDS.hinata;
    
    if (messageNode.classList.contains('ino')) {
      character = 'ino';
      voiceId = VOICE_IDS.ino;
    } else if (messageNode.classList.contains('sakura')) {
      character = 'sakura';
      voiceId = VOICE_IDS.sakura;
    }

    // Check if message contains an image
    const hasImage = messageNode.querySelector('img') !== null;
    
    soundButton.addEventListener('click', async () => {
      // Jika tombol yang diklik adalah tombol yang sedang memutar audio
      if (this.currentPlayingButton === soundButton && this.isPlaying) {
        this.stopPlayback();
        return;
      }

      // Jika ada audio lain yang sedang diputar, hentikan dulu
      if (this.isPlaying && this.currentPlayingButton) {
        this.stopPlayback();
      }

      // Mulai pemutaran audio baru
      soundButton.classList.add('playing');
      this.currentPlayingButton = soundButton;
      
      // Use dynamic response for images, otherwise use message content
      const text = hasImage 
        ? this.getRandomResponse(character)
        : (messageNode.querySelector('.message-content')?.textContent || messageNode.textContent);
      
      await this.playText(text, voiceId, character, soundButton);
      soundButton.classList.remove('playing');
      this.currentPlayingButton = null;
    });

    messageNode.appendChild(soundButton);
  }

  async playText(text, voiceId, character, button) {
    // Generate a unique key for this audio
    const audioKey = `${character}_${voiceId}_${text}`;
    
    // Try to get cached audio first
    const cachedAudio = await this.audioCache.getAudio(audioKey);
    if (cachedAudio) {
      console.log('Using cached audio');
      return this.playAudioFromBlob(cachedAudio, button);
    }

    let attempts = ELEVENLABS_API_KEYS.length;
    let success = false;

    while (attempts > 0 && !success) {
      try {
        this.isPlaying = true;
        const currentKey = this.getCurrentApiKey();

        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': currentKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        
        // Cache the audio before playing
        await this.audioCache.saveAudio(audioKey, audioBlob);
        
        await this.playAudioFromBlob(audioBlob, button);
        success = true;

      } catch (error) {
        console.error('Error with current API key:', error);
        attempts--;
        
        if (attempts > 0) {
          this.rotateApiKey();
        } else {
          console.error('All API keys exhausted');
          this.isPlaying = false;
          button.classList.remove('playing');
          this.currentPlayingButton = null;
          alert('Voice service temporarily unavailable. Please try again later.');
        }
      }
    }
  }

  async playAudioFromBlob(audioBlob, button) {
    const audioUrl = URL.createObjectURL(audioBlob);
    this.currentAudio = new Audio(audioUrl);
    
    this.currentAudio.addEventListener('ended', () => {
      this.isPlaying = false;
      URL.revokeObjectURL(audioUrl);
      button.classList.remove('playing');
      this.currentPlayingButton = null;
    });

    this.currentAudio.addEventListener('error', () => {
      this.isPlaying = false;
      URL.revokeObjectURL(audioUrl);
      button.classList.remove('playing');
      this.currentPlayingButton = null;
    });

    await this.currentAudio.play();
  }

  stopPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.currentPlayingButton) {
      this.currentPlayingButton.classList.remove('playing');
    }
    this.isPlaying = false;
    this.currentPlayingButton = null;
  }
}

class AudioCache {
  constructor() {
    this.CACHE_PREFIX = 'audio_cache_';
    this.CACHE_VERSION = 1;
    this.MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
    this.cleanupOldCache();
  }

  async cleanupOldCache() {
    const keys = await this.getAllKeys();
    let totalSize = 0;
    
    // Calculate total size and remove old version items
    for (const key of keys) {
      const item = await this.getCacheItem(key);
      if (item && item.version !== this.CACHE_VERSION) {
        localStorage.removeItem(key);
      } else if (item) {
        totalSize += item.size;
      }
    }

    // If total size exceeds limit, remove oldest items
    if (totalSize > this.MAX_CACHE_SIZE) {
      const sortedKeys = keys.sort((a, b) => {
        const itemA = JSON.parse(localStorage.getItem(a));
        const itemB = JSON.parse(localStorage.getItem(b));
        return itemA.timestamp - itemB.timestamp;
      });

      while (totalSize > this.MAX_CACHE_SIZE && sortedKeys.length > 0) {
        const key = sortedKeys.shift();
        const item = await this.getCacheItem(key);
        if (item) {
          totalSize -= item.size;
          localStorage.removeItem(key);
        }
      }
    }
  }

  async getAllKeys() {
    return Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));
  }

  async getCacheItem(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async getAudio(key) {
    const cacheKey = this.CACHE_PREFIX + key;
    const item = await this.getCacheItem(cacheKey);
    
    if (!item) return null;

    try {
      const audioData = atob(item.data);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        uint8Array[i] = audioData.charCodeAt(i);
      }
      
      return new Blob([arrayBuffer], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Error retrieving cached audio:', error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  async saveAudio(key, audioBlob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      
      const base64Data = btoa(binaryString);
      const cacheItem = {
        version: this.CACHE_VERSION,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength,
        data: base64Data
      };

      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheItem));
      await this.cleanupOldCache();
    } catch (error) {
      console.error('Error caching audio:', error);
    }
  }
}

// Initialize sound manager
const soundManager = new SoundManager();
