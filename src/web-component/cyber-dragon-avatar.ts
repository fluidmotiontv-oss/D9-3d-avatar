/**
 * STANDALONE SMART OBJECT WEB COMPONENT: <cyber-dragon-avatar>
 * 
 * Standard Vanilla Custom Element with Shadow DOM encapsulation.
 * Drop into any HTML page, Ebook reader, Payhip/Gumroad storefront, or FluidmotionTV media hub.
 */

export const WEB_COMPONENT_SOURCE_CODE = `/**
 * ==========================================================================
 * <cyber-dragon-avatar> Standalone Web Component
 * FluidmotionTV & Dragon 9 Infinity Flow Voice-Reactive Smart Object
 * ==========================================================================
 */
class CyberDragonAvatarElement extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'freq', 'auto-sync', 'jaw-multiplier', 'mode', 'width', 'height'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.audioCtx = null;
    this.analyser = null;
    this.rafId = null;
    this.jawOpen = 0;
    this.isListening = false;
    this.themeColors = {
      'cyber-neon': { primary: '#06b6d4', secondary: '#3b82f6', accent: '#ec4899', energy: '#22d3ee', eye: '#f43f5e' },
      'solar-flare': { primary: '#f59e0b', secondary: '#ef4444', accent: '#fbbf24', energy: '#fb923c', eye: '#facc15' },
      'emerald-matrix': { primary: '#10b981', secondary: '#059669', accent: '#34d399', energy: '#6ee7b7', eye: '#a7f3d0' },
      'dragon9-chrono': { primary: '#0ea5e9', secondary: '#6366f1', accent: '#38bdf8', energy: '#818cf8', eye: '#38bdf8' }
    };
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
    if (this.getAttribute('auto-sync') === 'true') {
      this.initAudioSync();
    }
  }

  disconnectedCallback() {
    this.stopAudioSync();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  get currentTheme() {
    const t = this.getAttribute('theme') || 'cyber-neon';
    return this.themeColors[t] || this.themeColors['cyber-neon'];
  }

  render() {
    const theme = this.currentTheme;
    const freq = this.getAttribute('freq') || '432';
    const width = this.getAttribute('width') || '100%';
    const height = this.getAttribute('height') || '400px';

    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          position: relative;
          width: \${width};
          height: \${height};
          background: #09090b;
          border: 1px solid \${theme.primary}40;
          border-radius: 16px;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
          box-shadow: 0 0 30px \${theme.primary}20;
          user-select: none;
        }
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hud-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(9, 9, 11, 0.8);
          border: 1px solid \${theme.primary}50;
          color: \${theme.energy};
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.05em;
        }
        .hud-freq {
          color: #a1a1aa;
          font-size: 9px;
        }
        .dragon-svg {
          width: 85%;
          height: 85%;
          max-height: 380px;
          filter: drop-shadow(0 0 15px \${theme.primary}60);
          transition: transform 0.1s ease-out;
        }
        .jaw-group {
          transform-origin: 220px 290px;
          transition: transform 0.05s ease-out;
        }
        .controls {
          position: absolute;
          bottom: 12px;
          z-index: 10;
          display: flex;
          gap: 8px;
        }
        .btn {
          background: \${theme.primary}20;
          border: 1px solid \${theme.primary};
          color: \${theme.energy};
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn:hover {
          background: \${theme.primary};
          color: #09090b;
        }
        .plasma-beam {
          opacity: 0;
          transition: opacity 0.1s;
        }
      </style>
      <div class="container">
        <div class="hud-overlay">
          <span>DRAGON 9 // SMART OBJECT</span>
          <span class="hud-freq">[\${freq}Hz SYNC]</span>
        </div>

        <svg class="dragon-svg" viewBox="0 0 600 650" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ambient Infinity Halo Ring -->
          <circle cx="300" cy="300" r="220" stroke="\${theme.primary}" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.4" />
          <circle cx="300" cy="300" r="240" stroke="\${theme.secondary}" stroke-width="1" stroke-dasharray="16 8" opacity="0.3" />
          
          <!-- Cyber Dragon Head Base Frame -->
          <path d="M190 120 L300 60 L410 120 L440 240 L380 340 L300 370 L220 340 L160 240 Z" fill="#0f172a" stroke="\${theme.primary}" stroke-width="3" />
          
          <!-- Titanium Horn Conduits -->
          <path d="M210 110 C160 50 110 40 70 80 C110 110 160 130 190 150 Z" fill="#1e293b" stroke="\${theme.accent}" stroke-width="2.5" />
          <path d="M390 110 C440 50 490 40 530 80 C490 110 440 130 410 150 Z" fill="#1e293b" stroke="\${theme.accent}" stroke-width="2.5" />

          <!-- Cybernetic Eye Lenses -->
          <circle cx="230" cy="220" r="14" fill="\${theme.eye}" />
          <circle cx="370" cy="220" r="14" fill="\${theme.eye}" />
          <line x1="230" y1="210" x2="230" y2="230" stroke="#fff" stroke-width="3" />
          <line x1="370" y1="210" x2="370" y2="230" stroke="#fff" stroke-width="3" />

          <!-- Upper Cranium & Snout Armor -->
          <polygon points="260,200 340,200 360,270 300,300 240,270" fill="#1e1e24" stroke="\${theme.primary}" stroke-width="2" />
          <!-- Upper Razor Cyber Fangs -->
          <polygon points="270,285 277,305 284,285" fill="#e2e8f0" />
          <polygon points="316,285 323,305 330,285" fill="#e2e8f0" />

          <!-- ARTICULATED LOWER JAW GROUP (Web Audio Driven) -->
          <g id="dragon-jaw" class="jaw-group">
            <!-- Lower Titanium Mandible -->
            <polygon points="250,295 350,295 330,360 300,380 270,360" fill="#111827" stroke="\${theme.secondary}" stroke-width="2.5" />
            <!-- Lower Fangs -->
            <polygon points="280,300 286,280 292,300" fill="#e2e8f0" />
            <polygon points="308,300 314,280 320,300" fill="#e2e8f0" />
            <!-- Glowing Throat Maw -->
            <ellipse cx="300" cy="310" rx="30" ry="12" fill="\${theme.energy}" opacity="0.75" />
          </g>

          <!-- Dynamic Plasma Breath Beam -->
          <line id="plasma-beam" class="plasma-beam" x1="300" y1="310" x2="300" y2="580" stroke="\${theme.energy}" stroke-width="14" stroke-linecap="round" />
        </svg>

        <div class="controls">
          <button id="btn-sync" class="btn">MIC SYNC</button>
          <button id="btn-speak" class="btn">SPEAK SAMPLE</button>
          <button id="btn-roar" class="btn">PLASMA ROAR</button>
        </div>
      </div>
    \`;
  }

  setupEvents() {
    const btnSync = this.shadowRoot.getElementById('btn-sync');
    const btnSpeak = this.shadowRoot.getElementById('btn-speak');
    const btnRoar = this.shadowRoot.getElementById('btn-roar');

    if (btnSync) {
      btnSync.addEventListener('click', () => {
        if (this.isListening) {
          this.stopAudioSync();
          btnSync.textContent = 'MIC SYNC';
        } else {
          this.initAudioSync();
          btnSync.textContent = 'STOP SYNC';
        }
      });
    }

    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        this.speak('Dragon 9 synchronized to 432Hz.');
      });
    }

    if (btnRoar) {
      btnRoar.addEventListener('click', () => this.roar());
    }
  }

  async initAudioSync() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      this.isListening = true;
      this.runLoop();
    } catch (e) {
      console.warn('Microphone permission required for direct sync', e);
    }
  }

  stopAudioSync() {
    this.isListening = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.audioCtx) this.audioCtx.close().catch(() => {});
  }

  runLoop() {
    if (!this.analyser) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / (data.length * 255);

    this.setJaw(avg * (parseFloat(this.getAttribute('jaw-multiplier')) || 1.5));
    this.rafId = requestAnimationFrame(() => this.runLoop());
  }

  setJaw(amount) {
    this.jawOpen = Math.min(1.0, Math.max(0, amount));
    const jawEl = this.shadowRoot.getElementById('dragon-jaw');
    const beamEl = this.shadowRoot.getElementById('plasma-beam');
    if (jawEl) {
      const drop = this.jawOpen * 36;
      const rot = this.jawOpen * 14;
      jawEl.style.transform = \`translateY(\${drop}px) rotate(\${rot}deg)\`;
    }
    if (beamEl) {
      beamEl.style.opacity = this.jawOpen > 0.65 ? '1' : '0';
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = 0.8;
      u.rate = 0.95;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        this.setJaw(Math.sin(step * 0.8) * 0.4 + 0.4);
      }, 80);

      u.onend = () => {
        clearInterval(timer);
        this.setJaw(0);
      };
      window.speechSynthesis.speak(u);
    }
  }

  roar() {
    this.setJaw(1.0);
    setTimeout(() => this.setJaw(0), 1200);
  }
}

if (!customElements.get('cyber-dragon-avatar')) {
  customElements.define('cyber-dragon-avatar', CyberDragonAvatarElement);
}
`;
