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
  'sk_c64906350c26a93e21498c2d08d0a445470bb66fafad6c33'
];

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

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
    soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    
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
      if (this.isPlaying) {
        this.stopPlayback();
      } else {
        soundButton.classList.add('playing');
        
        // Use dynamic response for images, otherwise use message content
        const text = hasImage 
          ? this.getRandomResponse(character)
          : (messageNode.querySelector('.message-content')?.textContent || messageNode.textContent);
        
        await this.playText(text, voiceId, soundButton);
        soundButton.classList.remove('playing');
      }
    });

    messageNode.appendChild(soundButton);
  }

  async playText(text, voiceId, button) {
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
        const audioUrl = URL.createObjectURL(audioBlob);
        
        this.currentAudio = new Audio(audioUrl);
        
        this.currentAudio.addEventListener('ended', () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          button.classList.remove('playing');
        });

        await this.currentAudio.play();
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
          alert('Voice service temporarily unavailable. Please try again later.');
        }
      }
    }
  }

  stopPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }
}

// Initialize sound manager
const soundManager = new SoundManager();
