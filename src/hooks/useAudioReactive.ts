import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioConfig, AudioReactiveState } from '../types';

const DEFAULT_AUDIO_STATE: AudioReactiveState = {
  isListening: false,
  volume: 0,
  rawVolume: 0,
  ambientNoiseFloor: 0.05,
  bass: 0,
  mid: 0,
  treble: 0,
  pitchCentroid: 0.5,
  isSpeaking: false,
  isRoaring: false,
  jawOpen: 0,
  beamIntensity: 0,
  energyPulse: 0,
  frequencyData: new Array(32).fill(0),
  waveform: new Array(64).fill(0),
};

export function useAudioReactive(config: AudioConfig) {
  const [audioState, setAudioState] = useState<AudioReactiveState>(DEFAULT_AUDIO_STATE);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isTestAudioPlaying, setIsTestAudioPlaying] = useState(false);
  const [testAudioMode, setTestAudioMode] = useState<'voice-synth' | 'dragon-roar' | 'cyber-beat'>('voice-synth');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const smoothedVolRef = useRef(0);
  const smoothedJawRef = useRef(0);
  const smoothedBeamRef = useRef(0);
  const smoothedPulseRef = useRef(0);
  const ambientFloorRef = useRef(0.04);

  // Test oscillator refs
  const testOscRef = useRef<OscillatorNode | null>(null);
  const testGainRef = useRef<GainNode | null>(null);
  const testTimerRef = useRef<number | null>(null);

  // Load available audio input devices
  const refreshDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devList.filter((d) => d.kind === 'audioinput');
        setDevices(audioInputs);
      }
    } catch (e) {
      console.warn('Could not enumerate audio devices', e);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Clean up audio context & stream
  const stopListening = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    stopTestAudio();
    setAudioState((prev) => ({
      ...prev,
      isListening: false,
      volume: 0,
      rawVolume: 0,
      ambientNoiseFloor: 0.04,
      isSpeaking: false,
      isRoaring: false,
      jawOpen: 0,
      beamIntensity: 0,
      energyPulse: 0,
    }));
  }, []);

  // Stop test audio
  const stopTestAudio = useCallback(() => {
    if (testTimerRef.current) {
      window.clearInterval(testTimerRef.current);
      testTimerRef.current = null;
    }
    if (testOscRef.current) {
      try {
        testOscRef.current.stop();
        testOscRef.current.disconnect();
      } catch {
        // ignore
      }
      testOscRef.current = null;
    }
    if (testGainRef.current) {
      try {
        testGainRef.current.disconnect();
      } catch {
        // ignore
      }
      testGainRef.current = null;
    }
    setIsTestAudioPlaying(false);
  }, []);

  // Analysis Loop
  const runAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    // 1. Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Apply gain multiplier
    const amplifiedVol = Math.min(1, rms * config.gain);

    // Track continuous ambient background noise floor
    // Background room noise floor tracks downward when quiet, but creeps upward slowly so voice peaks don't inflate it
    if (amplifiedVol < ambientFloorRef.current) {
      ambientFloorRef.current += (amplifiedVol - ambientFloorRef.current) * 0.05;
    } else {
      ambientFloorRef.current += (amplifiedVol - ambientFloorRef.current) * 0.003;
    }
    const ambientNoiseFloor = Math.max(0.01, Math.min(1.0, ambientFloorRef.current));

    // Noise gate
    const gatedVol = amplifiedVol < config.noiseGate ? 0 : amplifiedVol;

    // Smooth volume with lerp
    const alpha = 1 - config.smoothing;
    smoothedVolRef.current += (gatedVol - smoothedVolRef.current) * alpha;
    const currentVol = smoothedVolRef.current;

    // 2. Frequency bands
    // Standard bin calculation: sampleRate / 2 / bufferLength per bin
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binHz = (sampleRate / 2) / bufferLength;

    let bassSum = 0;
    let bassCount = 0;
    let midSum = 0;
    let midCount = 0;
    let trebleSum = 0;
    let trebleCount = 0;

    let spectralSum = 0;
    let weightSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const freq = i * binHz;
      const mag = freqData[i] / 255;

      if (freq >= 40 && freq <= 300) {
        bassSum += mag;
        bassCount++;
      } else if (freq > 300 && freq <= 2800) {
        midSum += mag;
        midCount++;
      } else if (freq > 2800 && freq <= 10000) {
        trebleSum += mag;
        trebleCount++;
      }

      spectralSum += freq * mag;
      weightSum += mag;
    }

    const bass = bassCount > 0 ? (bassSum / bassCount) * config.frequencyReactivity : 0;
    const mid = midCount > 0 ? (midSum / midCount) * config.frequencyReactivity : 0;
    const treble = trebleCount > 0 ? (trebleSum / trebleCount) * config.frequencyReactivity : 0;

    const pitchCentroid = weightSum > 0 ? Math.min(1, Math.max(0, (spectralSum / weightSum) / 5000)) : 0.5;

    const isSpeaking = currentVol > config.noiseGate * 0.8 || mid > 0.15;
    const isRoaring = currentVol >= config.roarThreshold || (bass > 0.7 && currentVol > 0.45);

    // 3. Dynamic Jaw Articulation
    // Voice vowel/syllable modulation: combines mid-frequency speech formants and volume
    const targetJaw = isSpeaking 
      ? Math.min(1, (currentVol * 0.6 + mid * 0.4) * config.jawMultiplier)
      : 0;

    // Quick open, smooth spring release
    const jawSpeed = targetJaw > smoothedJawRef.current ? 0.45 : 0.25;
    smoothedJawRef.current += (targetJaw - smoothedJawRef.current) * jawSpeed;

    // 4. Beam / Energy breath intensity
    const targetBeam = (isRoaring || (config.beamEnabled && isSpeaking && currentVol > 0.35))
      ? Math.min(1, Math.max(0, (currentVol - 0.2) / (1 - 0.2)))
      : 0;
    smoothedBeamRef.current += (targetBeam - smoothedBeamRef.current) * 0.2;

    // 5. Energy Pulse for glow & infinity flow acceleration
    const targetPulse = Math.min(1, currentVol * 1.5 + bass * 0.8 + (isRoaring ? 0.6 : 0));
    smoothedPulseRef.current += (targetPulse - smoothedPulseRef.current) * 0.2;

    // Sub-sample frequency for UI visualizers (32 bins)
    const sampledFreq: number[] = [];
    const step = Math.floor(bufferLength / 32);
    for (let i = 0; i < 32; i++) {
      sampledFreq.push((freqData[i * step] || 0) / 255);
    }

    // Sub-sample waveform (64 points)
    const sampledWave: number[] = [];
    const waveStep = Math.floor(bufferLength / 64);
    for (let i = 0; i < 64; i++) {
      sampledWave.push(((timeData[i * waveStep] || 128) - 128) / 128);
    }

    setAudioState({
      isListening: true,
      volume: Math.min(1, currentVol),
      rawVolume: Math.min(1, amplifiedVol),
      ambientNoiseFloor,
      bass: Math.min(1, bass),
      mid: Math.min(1, mid),
      treble: Math.min(1, treble),
      pitchCentroid,
      isSpeaking,
      isRoaring,
      jawOpen: Math.max(0, Math.min(1, smoothedJawRef.current)),
      beamIntensity: Math.max(0, Math.min(1, smoothedBeamRef.current)),
      energyPulse: Math.max(0, Math.min(1, smoothedPulseRef.current)),
      frequencyData: sampledFreq,
      waveform: sampledWave,
    });

    rafIdRef.current = requestAnimationFrame(runAnalysis);
  }, [config]);

  // Start microphone
  const startListening = useCallback(async (deviceId?: string) => {
    try {
      setPermissionError(null);
      stopTestAudio();

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      source.connect(analyser);

      await refreshDevices();

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(runAnalysis);
    } catch (err: unknown) {
      console.error('Audio capture error:', err);
      const msg = err instanceof Error ? err.message : 'Microphone access denied or unavailable.';
      setPermissionError(msg);
      stopListening();
    }
  }, [config, refreshDevices, runAnalysis, stopListening, stopTestAudio]);

  // Test sound simulator
  const playTestAudio = useCallback((mode: 'voice-synth' | 'dragon-roar' | 'cyber-beat') => {
    stopListening();
    stopTestAudio();
    setTestAudioMode(mode);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      masterGain.connect(analyser);
      // Connect to speakers so user can hear the test cadence
      masterGain.connect(audioCtx.destination);
      testGainRef.current = masterGain;

      setIsTestAudioPlaying(true);

      let step = 0;
      const intervalMs = mode === 'dragon-roar' ? 120 : mode === 'cyber-beat' ? 150 : 200;

      testTimerRef.current = window.setInterval(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const now = audioContextRef.current.currentTime;

        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        if (mode === 'voice-synth') {
          // Human voice cadence simulation (syllabic rises and falls)
          const vowelFreqs = [220, 330, 440, 260, 520, 180, 390, 0, 310, 490, 0];
          const freq = vowelFreqs[step % vowelFreqs.length];
          step++;

          if (freq > 0) {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.15);

            noteGain.gain.setValueAtTime(0.01, now);
            noteGain.gain.linearRampToValueAtTime(0.4, now + 0.04);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(noteGain);
            noteGain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.19);
          }
        } else if (mode === 'dragon-roar') {
          // Deep roaring sub-bass sweep + plasma resonance
          step++;
          const phase = step % 24;
          if (phase < 16) {
            osc.type = 'sawtooth';
            const baseFreq = 80 + Math.sin(phase * 0.4) * 40;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.12);

            noteGain.gain.setValueAtTime(0.1, now);
            noteGain.gain.linearRampToValueAtTime(0.6, now + 0.05);
            noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.connect(noteGain);
            noteGain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.13);
          }
        } else if (mode === 'cyber-beat') {
          // 4/4 Cyber Kick & Snare synth
          step++;
          const isKick = step % 4 === 0;
          osc.type = isKick ? 'triangle' : 'square';
          const freq = isKick ? 120 : 600;
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

          noteGain.gain.setValueAtTime(0.5, now);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.13);
        }
      }, intervalMs);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(runAnalysis);
    } catch (e) {
      console.error('Test audio error:', e);
    }
  }, [runAnalysis, stopListening, stopTestAudio]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    audioState,
    devices,
    permissionError,
    isTestAudioPlaying,
    testAudioMode,
    startListening,
    stopListening,
    playTestAudio,
    stopTestAudio,
    refreshDevices,
  };
}
