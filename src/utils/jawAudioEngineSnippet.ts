/**
 * JAW MECHANICS JAVASCRIPT SNIPPET & ENGINE
 * 
 * Standalone, lightweight Web Audio API snippet for real-time voice amplitude
 * analysis and direct mapping to jaw animation frames (SVG, Canvas, or CSS transforms).
 */

export const JAW_MECHANICS_STANDALONE_SNIPPET = `/**
 * =======================================================================
 * D9 CYBER DRAGON: AUDIO-REACTIVE JAW MECHANICS (Web Audio API)
 * Direct frequency & amplitude mapping to 60FPS jaw animation frames
 * =======================================================================
 */
class AudioReactiveJawController {
  constructor(options = {}) {
    this.options = {
      fftSize: options.fftSize || 512,
      smoothing: options.smoothing || 0.75,
      noiseGate: options.noiseGate || 0.08,
      gain: options.gain || 1.8,
      jawMultiplier: options.jawMultiplier || 1.4,
      maxJawDropPx: options.maxJawDropPx || 42,
      maxJawAngleDeg: options.maxJawAngleDeg || 18,
      speechFormantWeight: options.speechFormantWeight || 0.65, // Weight on 300Hz-2800Hz voice band
      targetElement: options.targetElement || '#cyber-dragon-jaw',
      onFrame: options.onFrame || null,
      ...options
    };

    this.audioCtx = null;
    this.analyser = null;
    this.stream = null;
    this.rafId = null;
    this.currentJawOpen = 0; // Smoothed 0.0 to 1.0
  }

  // 1. Initialize Microphone & Web Audio Graph
  async start() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioCtx();
    
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });

    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = this.options.fftSize;
    this.analyser.smoothingTimeConstant = 0.5;

    source.connect(this.analyser);

    // Start 60FPS animation loop
    this.loop();
    console.log('[D9 Jaw Mechanics] Audio analysis active.');
  }

  // 2. Continuous 60FPS Analysis & Transform Mapping Loop
  loop() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);

    // Calculate RMS Volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const norm = (timeData[i] - 128) / 128;
      sum += norm * norm;
    }
    const rms = Math.sqrt(sum / bufferLength);
    const amplifiedRms = Math.min(1.0, rms * this.options.gain);

    // Calculate Speech Formant Band Energy (300Hz - 2800Hz)
    const sampleRate = this.audioCtx.sampleRate || 44100;
    const binHz = (sampleRate / 2) / bufferLength;
    let midSum = 0, midCount = 0;

    for (let i = 0; i < bufferLength; i++) {
      const freq = i * binHz;
      if (freq >= 300 && freq <= 2800) {
        midSum += freqData[i] / 255;
        midCount++;
      }
    }
    const speechFormant = midCount > 0 ? (midSum / midCount) : 0;

    // Apply Noise Gate
    const effectiveVol = amplifiedRms < this.options.noiseGate ? 0 : amplifiedRms;
    const isSpeaking = effectiveVol > 0 || speechFormant > 0.12;

    // Target Jaw Amplitude (combines vocal formants + raw volume)
    const targetJaw = isSpeaking
      ? Math.min(1.0, (effectiveVol * (1 - this.options.speechFormantWeight) + speechFormant * this.options.speechFormantWeight) * this.options.jawMultiplier)
      : 0;

    // Asymmetric Spring Lerp: Fast jaw drop on onset (0.45), smooth spring recovery on release (0.22)
    const lerpSpeed = targetJaw > this.currentJawOpen ? 0.45 : 0.22;
    this.currentJawOpen += (targetJaw - this.currentJawOpen) * lerpSpeed;

    // 3. Map to Transformation Matrix
    const jawDropPx = this.currentJawOpen * this.options.maxJawDropPx;
    const jawRotateDeg = this.currentJawOpen * this.options.maxJawAngleDeg;

    // Apply directly to target DOM / SVG Element
    const el = typeof this.options.targetElement === 'string'
      ? document.querySelector(this.options.targetElement)
      : this.options.targetElement;

    if (el) {
      el.style.transform = \`translate3d(0, \${jawDropPx.toFixed(2)}px, 0) rotate(\${jawRotateDeg.toFixed(2)}deg)\`;
      el.style.transformOrigin = '220px 290px'; // Dragon temporomandibular hinge coordinate
    }

    // Optional callback for custom canvas or WebGL renderers
    if (typeof this.options.onFrame === 'function') {
      this.options.onFrame({
        jawOpen: this.currentJawOpen,
        jawDropPx,
        jawRotateDeg,
        rms: amplifiedRms,
        speechFormant,
        isSpeaking
      });
    }

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  // Stop analysis and release microphone
  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') this.audioCtx.close();
    console.log('[D9 Jaw Mechanics] Stopped.');
  }
}

// Usage Example:
// const jaw = new AudioReactiveJawController({ targetElement: '#dragon-lower-jaw' });
// document.getElementById('start-btn').addEventListener('click', () => jaw.start());
`;

export interface JawPhysicsTelemetry {
  jawOpen: number;         // 0..1
  jawDropPx: number;       // Calculated pixels
  jawRotateDeg: number;     // Calculated rotation
  vocalEnergy: number;     // Speech formant 300-2800Hz
  rawRms: number;          // Unfiltered RMS
  hingeX: number;
  hingeY: number;
  fps: number;
}
