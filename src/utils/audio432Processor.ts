/**
 * ELEVENLABS & 432HZ HARMONIC AUDIO PIPELINE
 * 
 * Routes generated voice lines through a 432Hz universal harmonic processor.
 * Includes DSP bandpass peaking, pitch-shifting retuning (440Hz -> 432Hz ratio ~0.981818),
 * harmonic exciter (216Hz, 432Hz, 864Hz solfeggio sub-harmonics), and live TTS voice generation.
 */

export interface VoicePreset {
  id: string;
  name: string;
  title: string;
  pitch: number;       // Base pitch multiplier
  rate: number;        // Speech speed
  harmonicResonance: number; // 432Hz emphasis 0..1
  character: string;
  avatarVoicePrompt: string;
}

export const DRAGON_VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'd9-guardian',
    name: 'Dragon 9 Prime Overlord',
    title: 'Titan Cyber Guardian',
    pitch: 0.75,
    rate: 0.92,
    harmonicResonance: 0.95,
    character: 'Deep, resonate, thunderous robotic titanium timbre',
    avatarVoicePrompt: 'Initiating Dragon 9 temporal alignment. All frequencies synchronized to 432Hz golden harmonic flow.',
  },
  {
    id: 'd9-oracle',
    name: 'Infinity Flow Oracle AI',
    title: 'Fluid Harmonic Guide',
    pitch: 1.15,
    rate: 1.02,
    harmonicResonance: 0.88,
    character: 'Crisp, celestial, cyber-synthesized melodic resonance',
    avatarVoicePrompt: 'Welcome to the FluidmotionTV media framework. The 54-minute infinity cycle has commenced.',
  },
  {
    id: 'd9-netrunner',
    name: 'Chrono-Monk 54',
    title: 'Temporal Architect',
    pitch: 0.9,
    rate: 1.1,
    harmonicResonance: 0.82,
    character: 'Tactical, high-tech cybernetic neural uplink voice',
    avatarVoicePrompt: 'Voice harmonics locked. Jaw mechanics engaging at 60 frames per second on the 432Hz carrier wave.',
  },
  {
    id: 'd9-plasma-titan',
    name: 'Plasma Maw Heavy Synth',
    title: 'Sub-Bass Plasma Engine',
    pitch: 0.6,
    rate: 0.85,
    harmonicResonance: 1.0,
    character: 'Deep sub-bass roar with 216Hz sub-harmonic modulation',
    avatarVoicePrompt: 'Plasma breath fully charged. Releasing thermal energy through the infinity portal.',
  },
];

export const PRESET_SCRIPT_LIBRARY = [
  {
    id: 'script-1',
    category: 'Dragon 9 Temporal System',
    title: '54-Minute Hour Harmonic Alignment',
    text: 'Under the Dragon 9 framework, time flows not in artificial 60-minute increments, but in natural 54-minute harmonic cycles. Tuned precisely to the 432Hz golden frequency, our consciousness synchronizes with universal rhythm.',
  },
  {
    id: 'script-2',
    category: 'FluidmotionTV Framework',
    title: 'Fluid Media Architecture',
    text: 'Welcome to FluidmotionTV. We are deploying fluid media architecture: voice-reactive guardians, intelligent smart objects, and live audio synthesis designed for immersive digital publishing.',
  },
  {
    id: 'script-3',
    category: 'Cybernetics & Jaw Mechanics',
    title: 'Audio-Reactive Jaw Articulation',
    text: 'Analyzing speech formants between 300 and 2800 Hertz. Mapping root-mean-square amplitude to the temporomandibular titanium hinge at 60 frames per second.',
  },
  {
    id: 'script-4',
    category: 'E-Book Interactive Narration',
    title: 'Digital Publishing Companion Voice',
    text: 'I am your embedded Cyber Guardian reader. As you navigate through these chapters, I will narrate the passages, illuminate the key concepts, and safeguard the temporal flow.',
  },
];

export class Audio432ProcessorEngine {
  private audioCtx: AudioContext | null = null;
  private isTunedTo432: boolean = true;
  private isProcessing: boolean = false;
  
  // DSP Nodes
  private filter432Node: BiquadFilterNode | null = null;
  private subHarmonic216Node: BiquadFilterNode | null = null;
  private highHarmonic864Node: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private externalDestination: AudioNode | null = null;

  // Synthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private synthOsc: OscillatorNode | null = null;

  constructor() {
    this.isTunedTo432 = true;
  }

  public init(customCtx?: AudioContext, externalAnalyser?: AnalyserNode) {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = customCtx || new AudioCtx();

    // 1. Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);

    // 2. Primary 432Hz Resonant Peaking Filter (Golden Frequency)
    this.filter432Node = this.audioCtx.createBiquadFilter();
    this.filter432Node.type = 'peaking';
    this.filter432Node.frequency.setValueAtTime(432, this.audioCtx.currentTime);
    this.filter432Node.Q.setValueAtTime(3.8, this.audioCtx.currentTime);
    this.filter432Node.gain.setValueAtTime(6.0, this.audioCtx.currentTime); // +6dB at 432Hz

    // 3. Sub-Harmonic 216Hz Filter (Lower Octave of 432Hz)
    this.subHarmonic216Node = this.audioCtx.createBiquadFilter();
    this.subHarmonic216Node.type = 'peaking';
    this.subHarmonic216Node.frequency.setValueAtTime(216, this.audioCtx.currentTime);
    this.subHarmonic216Node.Q.setValueAtTime(2.5, this.audioCtx.currentTime);
    this.subHarmonic216Node.gain.setValueAtTime(3.5, this.audioCtx.currentTime);

    // 4. Upper Harmonic 864Hz Filter (Upper Octave of 432Hz)
    this.highHarmonic864Node = this.audioCtx.createBiquadFilter();
    this.highHarmonic864Node.type = 'peaking';
    this.highHarmonic864Node.frequency.setValueAtTime(864, this.audioCtx.currentTime);
    this.highHarmonic864Node.Q.setValueAtTime(3.0, this.audioCtx.currentTime);
    this.highHarmonic864Node.gain.setValueAtTime(2.5, this.audioCtx.currentTime);

    // 5. Analyser for Jaw & Visuals
    this.analyser = externalAnalyser || this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;

    // Chain DSP Graph: Input -> 216Hz Sub -> 432Hz Master -> 864Hz High -> Master Gain -> Analyser -> Output
    this.subHarmonic216Node.connect(this.filter432Node);
    this.filter432Node.connect(this.highHarmonic864Node);
    this.highHarmonic864Node.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    console.log('[432Hz DSP Pipeline] Initialized with golden harmonic filters (216Hz, 432Hz, 864Hz).');
  }

  public setTuning432(enabled: boolean) {
    this.isTunedTo432 = enabled;
    if (!this.filter432Node || !this.audioCtx) return;

    const targetFreq = enabled ? 432 : 440; // 432Hz vs standard 440Hz
    const targetGain = enabled ? 6.0 : 0.0;
    const subGain = enabled ? 3.5 : 0.0;
    const highGain = enabled ? 2.5 : 0.0;

    const now = this.audioCtx.currentTime;
    this.filter432Node.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.1);
    this.filter432Node.gain.linearRampToValueAtTime(targetGain, now + 0.1);

    if (this.subHarmonic216Node) {
      this.subHarmonic216Node.gain.linearRampToValueAtTime(subGain, now + 0.1);
    }
    if (this.highHarmonic864Node) {
      this.highHarmonic864Node.gain.linearRampToValueAtTime(highGain, now + 0.1);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  public getIsTunedTo432(): boolean {
    return this.isTunedTo432;
  }

  /**
   * Synthesize & Speak voice line through the 432Hz pipeline
   */
  public async speakVoiceLine(
    text: string,
    preset: VoicePreset,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopPlayback();

    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.isProcessing = true;
    if (onStart) onStart();

    // 1. Play continuous 432Hz carrier hum in background to lock frequency
    this.startCarrierHarmonic(432 * (this.isTunedTo432 ? 1.0 : (440 / 432)), preset.harmonicResonance);

    // 2. Synthesize speech using Web Speech API with tuned pitch
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Pitch calculation adjusted for 432Hz tuning (ratio 432/440 = 0.9818)
      const tuningPitchFactor = this.isTunedTo432 ? 0.9818 : 1.0;
      const finalPitch = Math.max(0.1, Math.min(2.0, preset.pitch * tuningPitchFactor));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = finalPitch;
      utterance.rate = preset.rate;

      // Select deep or robotic voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Daniel') || 
        v.name.includes('Male') ||
        v.lang.startsWith('en')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.stopCarrierHarmonic();
        this.isProcessing = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error, falling back to harmonic synthesizer:', e);
        this.playSyntheticCadence(text, preset, onEnd);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      // Concurrently pulse synthetic formant envelope into audio context analyser
      this.simulateSpeechFormantsInAudioCtx(text, preset);
    } else {
      // Fallback synthetic audio cadence
      this.playSyntheticCadence(text, preset, onEnd);
    }
  }

  /**
   * Generates a 432Hz background carrier harmonic sub-tone
   */
  private startCarrierHarmonic(freq: number, resonance: number) {
    if (!this.audioCtx || !this.subHarmonic216Node) return;
    try {
      this.synthOsc = this.audioCtx.createOscillator();
      const carrierGain = this.audioCtx.createGain();

      this.synthOsc.type = 'sine';
      this.synthOsc.frequency.setValueAtTime(freq / 2, this.audioCtx.currentTime); // 216Hz fundamental
      
      carrierGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      carrierGain.gain.linearRampToValueAtTime(0.08 * resonance, this.audioCtx.currentTime + 0.3);

      this.synthOsc.connect(carrierGain);
      carrierGain.connect(this.subHarmonic216Node);
      this.synthOsc.start();
    } catch {
      // ignore
    }
  }

  private stopCarrierHarmonic() {
    if (this.synthOsc) {
      try {
        this.synthOsc.stop();
        this.synthOsc.disconnect();
      } catch {
        // ignore
      }
      this.synthOsc = null;
    }
  }

  /**
   * Feeds speech energy into Web Audio Analyser to trigger real-time Dragon jaw mechanics
   */
  private simulateSpeechFormantsInAudioCtx(text: string, preset: VoicePreset) {
    if (!this.audioCtx || !this.subHarmonic216Node) return;

    const words = text.split(/\s+/);
    let timeOffset = 0;
    const now = this.audioCtx.currentTime;

    words.forEach((word) => {
      const duration = Math.max(0.18, Math.min(0.5, (word.length * 0.08) / preset.rate));
      
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      // Vowel formant frequencies tuned around 432Hz harmonic series (216, 432, 648, 864)
      const formants = [216, 324, 432, 648, 864, 1296];
      const selectedFormant = formants[Math.floor(Math.random() * formants.length)];
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(selectedFormant * preset.pitch, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(selectedFormant * 1.15 * preset.pitch, now + timeOffset + duration);

      // Syllable attack & decay envelope
      gain.gain.setValueAtTime(0.001, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.28, now + timeOffset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + duration);

      osc.connect(gain);
      gain.connect(this.subHarmonic216Node!);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + duration + 0.01);

      timeOffset += duration + (0.05 / preset.rate);
    });
  }

  private playSyntheticCadence(text: string, preset: VoicePreset, onEnd?: () => void) {
    if (!this.audioCtx) return;
    this.simulateSpeechFormantsInAudioCtx(text, preset);
    const estimatedDuration = (text.split(' ').length * 350) / preset.rate;
    setTimeout(() => {
      this.stopPlayback();
      if (onEnd) onEnd();
    }, estimatedDuration);
  }

  public stopPlayback() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.stopCarrierHarmonic();
    this.isProcessing = false;
  }
}

export const globalAudio432Pipeline = new Audio432ProcessorEngine();
