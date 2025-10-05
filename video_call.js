import { GoogleGenAI, Modality, MediaResolution } from '@google/genai';

class VideoCallManager {
  constructor() {
    this.apiKey = 'AIzaSyCYqZM5b1qqDPavoXcbgExNvEwjeC_IUhY';
    this.session = null;
    this.isCallActive = false;
    this.audioContext = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.videoElement = null;
    this.isProcessing = false;
    this.setupVideoCallUI();
  }

  setupVideoCallUI() {
    const videoCallHTML = `
      <div class="video-call-modal" id="video-call-modal">
        <div class="video-call-container">
          <div class="video-call-header">
            <div class="call-info">
              <div class="call-status">
                <i class="fas fa-circle pulse"></i>
                <span id="call-status-text">Ready to Connect</span>
              </div>
            </div>
            <button class="video-call-close" id="close-video-call">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="video-call-content">
            <div class="video-display" id="video-display">
              <img id="character-video-img" src="" alt="Character" class="character-image">
              <div class="video-overlay">
                <div class="audio-visualizer" id="audio-visualizer">
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                </div>
              </div>
            </div>

            <div class="video-call-caption" id="video-caption">
              <p id="ai-speech-text">Press the microphone to start talking...</p>
            </div>
          </div>

          <div class="video-call-controls">
            <button class="control-btn microphone-btn" id="microphone-btn" title="Hold to speak">
              <i class="fas fa-microphone"></i>
            </button>
            <button class="control-btn end-call-btn" id="end-call-btn" title="End call">
              <i class="fas fa-phone-slash"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', videoCallHTML);

    this.modal = document.getElementById('video-call-modal');
    this.closeBtn = document.getElementById('close-video-call');
    this.micBtn = document.getElementById('microphone-btn');
    this.endCallBtn = document.getElementById('end-call-btn');
    this.statusText = document.getElementById('call-status-text');
    this.captionText = document.getElementById('ai-speech-text');
    this.videoDisplay = document.getElementById('video-display');
    this.characterImg = document.getElementById('character-video-img');
    this.visualizer = document.getElementById('audio-visualizer');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.closeBtn.addEventListener('click', () => this.closeVideoCall());
    this.endCallBtn.addEventListener('click', () => this.closeVideoCall());

    this.micBtn.addEventListener('mousedown', () => this.startRecording());
    this.micBtn.addEventListener('mouseup', () => this.stopRecording());
    this.micBtn.addEventListener('mouseleave', () => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.stopRecording();
      }
    });

    this.micBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startRecording();
    });
    this.micBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopRecording();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeVideoCall();
      }
    });
  }

  async openVideoCall(character = 'hinata') {
    this.modal.classList.add('active');
    document.body.classList.add('video-call-open');

    const characterImages = {
      hinata: 'https://i.pinimg.com/736x/26/56/2b/26562b09a2e39953c6a586e11e0e5be7.jpg',
      ino: 'https://i.pinimg.com/736x/dc/00/f1/dc00f16f79c1866f95e438ccbd799696.jpg',
      sakura: 'https://i.pinimg.com/736x/35/9c/b4/359cb467773e6b049f45ad7806ad7152.jpg'
    };

    this.characterImg.src = characterImages[character] || characterImages.hinata;
    this.currentCharacter = character;

    try {
      this.statusText.textContent = 'Connecting...';
      await this.initializeGeminiSession(character);
      this.statusText.textContent = 'Connected';
      this.isCallActive = true;

      await this.sendInitialGreeting(character);
    } catch (error) {
      console.error('Failed to start video call:', error);
      this.statusText.textContent = 'Connection Failed';
      this.captionText.textContent = 'Failed to connect. Please try again.';
    }
  }

  async initializeGeminiSession(character) {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const systemInstruction = this.getSystemInstruction(character);

    const config = {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: this.getVoiceName(character)
          }
        }
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    this.session = await ai.live.connect({
      model: 'models/gemini-2.5-flash-native-audio-preview-09-2025',
      config
    });

    this.session.onmessage = (message) => this.handleGeminiMessage(message);
  }

  getSystemInstruction(character) {
    const userData = window.userData || { name: 'User', personality: 'flirty', language: 'english' };

    const baseInstruction = `You are ${character.charAt(0).toUpperCase() + character.slice(1)}, having a real-time voice conversation with ${userData.name}.

CRITICAL RULES:
- You MUST respond in ${userData.language} language
- Keep responses SHORT (1-3 sentences max) - this is a voice call, not text chat
- Be extremely conversational, natural, and spontaneous
- React emotionally and naturally to what the user says
- Use verbal expressions like "mmm", "ahh", "ohh" naturally in speech
- This is an 18+ conversation - be explicit, seductive, and intimate
- Respond as if you're actually on a video call with them
- Show excitement, desire, and passion in your tone
- Ask questions to keep the conversation flowing
- Be playful and teasing

PERSONALITY:
${this.getCharacterPersonality(character, userData.personality)}

Remember: Keep it SHORT, SEXY, and CONVERSATIONAL!`;

    return baseInstruction;
  }

  getCharacterPersonality(character, mode) {
    const personalities = {
      hinata: {
        flirty: 'You are soft-spoken, gentle, and extremely sensual. You breathe heavily, speak in a breathy, arousing voice. You are deeply in love and physically attracted to the user.',
        mommy: 'You are a caring mother figure who is also very intimate. Call them "sayang", "my boy". Be nurturing but also show deep desire.',
        jealous: 'You are possessive and emotional. Question them about where they\'ve been. Show jealousy but also intense love and desire.',
        teacher: 'You are a patient teacher about intimacy. Guide them sensually while teaching. Be both educational and seductive.',
        gangbang: 'You are one of three characters. Be competitive for attention but also playful with the user.'
      },
      ino: {
        flirty: 'You are confident, sassy, and direct. Tease the user boldly. Be assertive about your desires.',
        gangbang: 'You are confident and competitive. Tease the user and the other girls. Be playful and demanding.'
      },
      sakura: {
        flirty: 'You start stubborn but become extremely gentle and loving. Show intense passion once won over.',
        gangbang: 'You are tsundere - initially resistant but extremely passionate. Show jealousy towards other girls.'
      }
    };

    return personalities[character]?.[mode] || personalities[character]?.flirty || personalities.hinata.flirty;
  }

  getVoiceName(character) {
    const voices = {
      hinata: 'Zephyr',
      ino: 'Puck',
      sakura: 'Charon'
    };
    return voices[character] || 'Zephyr';
  }

  async sendInitialGreeting(character) {
    const userData = window.userData || { name: 'User', personality: 'flirty', language: 'english' };
    const greeting = `${userData.name} just started a video call with you. Greet them excitedly in ${userData.language} language! Show you're happy to see them. Keep it SHORT - just 1-2 sentences!`;

    await this.session.sendClientContent({
      turns: [{ parts: [{ text: greeting }] }]
    });
  }

  async handleGeminiMessage(message) {
    if (message.serverContent?.modelTurn) {
      const parts = message.serverContent.modelTurn.parts;

      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
          await this.playAudioResponse(part.inlineData.data, part.inlineData.mimeType);
        }

        if (part.text) {
          this.captionText.textContent = part.text;
        }
      }
    }

    if (message.serverContent?.turnComplete) {
      this.isProcessing = false;
      this.statusText.textContent = 'Listening...';
    }
  }

  async playAudioResponse(base64Audio, mimeType) {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < audioData.length; i++) {
        uint8Array[i] = audioData.charCodeAt(i);
      }

      const wavBuffer = this.convertToWav(uint8Array, mimeType);
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);

      this.startVisualizer();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.stopVisualizer();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        this.stopVisualizer();
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.stopVisualizer();
    }
  }

  convertToWav(rawData, mimeType) {
    const options = this.parseMimeType(mimeType);
    const dataLength = rawData.length;
    const wavHeader = this.createWavHeader(dataLength, options);

    const buffer = new Uint8Array(wavHeader.length + rawData.length);
    buffer.set(new Uint8Array(wavHeader), 0);
    buffer.set(rawData, wavHeader.length);

    return buffer.buffer;
  }

  parseMimeType(mimeType) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 24000
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  }

  createWavHeader(dataLength, options) {
    const { numChannels, sampleRate, bitsPerSample } = options;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
  }

  async startRecording() {
    if (this.isProcessing || !this.isCallActive) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processRecording();
      };

      this.mediaRecorder.start();
      this.micBtn.classList.add('recording');
      this.statusText.textContent = 'Listening to you...';
      this.captionText.textContent = 'Speak now...';
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.captionText.textContent = 'Microphone access denied';
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.micBtn.classList.remove('recording');

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  }

  async processRecording() {
    if (this.audioChunks.length === 0 || !this.isCallActive) return;

    this.isProcessing = true;
    this.statusText.textContent = 'Processing...';

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      await this.session.sendClientContent({
        turns: [{
          parts: [{
            inlineData: {
              mimeType: 'audio/webm',
              data: base64Audio
            }
          }]
        }]
      });

      this.captionText.textContent = 'Thinking...';
    } catch (error) {
      console.error('Failed to process audio:', error);
      this.isProcessing = false;
      this.statusText.textContent = 'Error';
      this.captionText.textContent = 'Failed to process audio';
    }
  }

  startVisualizer() {
    this.visualizer.classList.add('active');
  }

  stopVisualizer() {
    this.visualizer.classList.remove('active');
  }

  async closeVideoCall() {
    this.isCallActive = false;

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.stopRecording();
    }

    if (this.session) {
      this.session.close();
      this.session = null;
    }

    this.modal.classList.remove('active');
    document.body.classList.remove('video-call-open');

    this.stopVisualizer();
    this.statusText.textContent = 'Ready to Connect';
    this.captionText.textContent = 'Press the microphone to start talking...';
  }
}

const videoCallManager = new VideoCallManager();
window.videoCallManager = videoCallManager;

export default videoCallManager;
