import { useEffect, useRef } from 'react';
import { AudioConfig, AudioReactiveState } from '../types';

interface AmbientSoundscapeEngineProps {
  config: AudioConfig;
  audioState: AudioReactiveState;
}

export function AmbientSoundscapeEngine({
  config,
  audioState,
}: AmbientSoundscapeEngineProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const enabled = config.ambientSoundscapeEnabled ?? true;
  const baseVolume = config.ambientSoundscapeVolume ?? 0.18;

  // 1. Initialize or Tear Down Synthesizer
  useEffect(() => {
    if (!enabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      oscillatorsRef.current = [];
      masterGainRef.current = null;
      filterRef.current = null;
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain for Ducking & Volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime); // Fade in
      masterGainRef.current = masterGain;

      // Warm Lowpass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);
      filterRef.current = filter;

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // 432Hz Harmonic Tuning Scale
      // 108Hz (A2 sub), 162Hz (E3 5th), 216Hz (A3 octave), 432Hz (A4 resonance)
      const freqs = [
        { freq: 108, type: 'sine' as OscillatorType, gain: 0.35 },
        { freq: 162, type: 'triangle' as OscillatorType, gain: 0.22 },
        { freq: 216, type: 'sine' as OscillatorType, gain: 0.25 },
        { freq: 432, type: 'sine' as OscillatorType, gain: 0.18 },
      ];

      const oscs: OscillatorNode[] = [];

      freqs.forEach(({ freq, type, gain }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        oscGain.gain.setValueAtTime(gain, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;

      // Organic Slow LFO Tremolo & Filter Modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // Slow 0.18Hz pulse
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoRef.current = lfo;

      // Attempt resume if suspended
      if (ctx.state === 'suspended') {
        const resumeCtx = () => {
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          window.removeEventListener('click', resumeCtx);
          window.removeEventListener('keydown', resumeCtx);
        };
        window.addEventListener('click', resumeCtx);
        window.addEventListener('keydown', resumeCtx);
      }
    } catch (e) {
      console.warn('Could not initialize Ambient Soundscape Web Audio synth:', e);
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      oscillatorsRef.current = [];
      masterGainRef.current = null;
      filterRef.current = null;
    };
  }, [enabled]);

  // 2. Continuous Auto-Ducking Logic
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || !enabled) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const isMicActive =
      audioState.isListening &&
      (audioState.volume > (config.noiseGate || 0.04) || audioState.isSpeaking);

    // Dynamic Ducking: When voice input is active, duck background soundscape down by ~85%
    const duckingFactor = isMicActive ? 0.15 : 1.0;
    const targetVolume = Math.max(0, baseVolume * duckingFactor);

    const now = ctx.currentTime;
    masterGain.gain.setTargetAtTime(targetVolume, now, 0.12); // Smooth 120ms exponential transition
  }, [
    audioState.isListening,
    audioState.volume,
    audioState.isSpeaking,
    config.noiseGate,
    baseVolume,
    enabled,
  ]);

  return null; // Headless Web Audio engine component
}
