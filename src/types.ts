export type ExpressionMode = 'idle' | 'talk' | 'roar' | 'shield' | 'alert' | 'hypersync';

export type AvatarFlightMode = 'docked' | 'cocoon' | 'flight' | 'reassembling';

export type FlightPatternType = 'infinity' | 'cursor' | 'lissajous';

export interface FlightPhysicsConfig {
  velocity: number;      // Cruise speed multiplier (0.2 - 3.0, default 1.0)
  acceleration: number;  // Steering torque / thrust response (0.2 - 3.0, default 1.0)
  drag: number;          // Air resistance / inertia damping (0.80 - 0.99, default 0.92)
}

export type OverlayMode = 'app' | 'clean' | 'chroma' | 'transparent' | 'pip';

export type ChromaColorType = 'green' | 'blue' | 'magenta' | 'custom';

export type InfinityFlowPresetType = 'vortex' | 'nebula' | 'crystalline' | 'lemniscate';

export interface DragonTheme {
  id: string;
  name: string;
  badge: string;
  description: string;
  primary: string;       // Main armor & scales cyan/emerald/etc
  secondary: string;     // Secondary plates & circuitry
  accent: string;        // Horn accents & highlights
  energy: string;        // Beam, breath & particle flow
  eyeGlow: string;       // Cyber ocular lens glow
  mouthGlow: string;     // Internal dragon maw plasma
  hornsGlow: string;     // Horn tips energy
  auraColor: string;     // Ambient infinity aura
  gridColor: string;     // HUD & holo grid
  tagline: string;
}

export interface AudioReactiveState {
  isListening: boolean;
  volume: number;          // Smoothed volume 0..1
  rawVolume: number;       // Unsmoothed RMS
  ambientNoiseFloor: number; // 0..1 tracked ambient background noise floor
  bass: number;            // 0..1 low frequency energy
  mid: number;             // 0..1 mid frequencies (voice formant)
  treble: number;          // 0..1 high frequencies
  pitchCentroid: number;   // Spectral centroid normalized
  isSpeaking: boolean;     // Above noise gate
  isRoaring: boolean;      // Speaking at high energy
  jawOpen: number;         // 0..1 dynamic jaw opening for mouth sync
  beamIntensity: number;   // 0..1 for plasma breath
  energyPulse: number;     // 0..1 overall cyber pulse
  frequencyData: number[]; // For visualizers
  waveform: number[];      // Oscilloscope data
}

export interface AudioConfig {
  gain: number;            // Mic sensitivity 0.5 - 5.0
  noiseGate: number;       // Noise floor cutoff 0.01 - 0.4
  smoothing: number;       // Audio smoothing 0.1 - 0.95
  jawMultiplier: number;   // How wide mouth opens on voice 0.5 - 2.5
  roarThreshold: number;   // Threshold to trigger roar beam 0.5 - 0.95
  beamEnabled: boolean;    // Render energy breath beam
  frequencyReactivity: number; // 0.5 - 2.0
  selectedDeviceId: string;
  ambientSoundscapeEnabled?: boolean; // Background generative harmonic drone toggle
  ambientSoundscapeVolume?: number;  // Base volume 0.05 - 0.5
}

export interface StreamConfig {
  overlayMode: OverlayMode;
  chromaType: ChromaColorType;
  customChromaHex: string;
  showStreamHud: boolean;
  showAudioMeters: boolean;
  showChatSim: boolean;
  showDragonInfo: boolean;
  showRunes: boolean;
  showInfinityAura: boolean;
  streamerName: string;
  guardianTag: string;
  syncRateHz: number;
  avatarScale: number;
  avatarX: number;
  avatarY: number;
  flipHorizontal: boolean;
  webcamActive: boolean;
  glitchBurstOnRoar: boolean;
  showEnergyDust?: boolean;
  energyDustIntensity?: number;
  autoHideControls?: boolean;
  autoHideDurationSec?: number;
  wingbeatVisualizer?: boolean;
  showDragonBreath?: boolean;
  dragonBreathIntensity?: number;
  flightMode?: AvatarFlightMode;
  flightPattern?: FlightPatternType;
  flightSpeed?: number;
  flightPhysics?: FlightPhysicsConfig;
  infinityFlowPreset?: InfinityFlowPresetType;
  infinityFlowNoiseFloorSensitivity?: number;
  showHolographicPedestal?: boolean;
  showMatrixCodeRain?: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  color: string;
  message: string;
  time: string;
  isDragonVoice?: boolean;
}
