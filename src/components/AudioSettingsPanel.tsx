import { useEffect, useRef } from 'react';
import { AudioConfig, AudioReactiveState } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Flame,
  Zap,
  Radio,
  Waves,
  Music,
} from 'lucide-react';

interface AudioSettingsPanelProps {
  config: AudioConfig;
  audioState: AudioReactiveState;
  devices: MediaDeviceInfo[];
  permissionError: string | null;
  isTestAudioPlaying: boolean;
  testAudioMode: 'voice-synth' | 'dragon-roar' | 'cyber-beat';
  onUpdateConfig: (newConfig: Partial<AudioConfig>) => void;
  onStartListening: (deviceId?: string) => void;
  onStopListening: () => void;
  onPlayTestAudio: (mode: 'voice-synth' | 'dragon-roar' | 'cyber-beat') => void;
  onStopTestAudio: () => void;
  onRefreshDevices: () => void;
}

export function AudioSettingsPanel({
  config,
  audioState,
  devices,
  permissionError,
  isTestAudioPlaying,
  testAudioMode,
  onUpdateConfig,
  onStartListening,
  onStopListening,
  onPlayTestAudio,
  onStopTestAudio,
  onRefreshDevices,
}: AudioSettingsPanelProps) {
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw real-time mini oscilloscope
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(39, 39, 42, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw waveform
    const wave = audioState.waveform;
    if (wave && wave.length > 0) {
      ctx.strokeStyle = audioState.isRoaring ? '#f43f5e' : audioState.isSpeaking ? '#06b6d4' : '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sliceWidth = width / (wave.length - 1);
      for (let i = 0; i < wave.length; i++) {
        const x = i * sliceWidth;
        const y = (wave[i] * 0.5 + 0.5) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [audioState.waveform, audioState.isSpeaking, audioState.isRoaring]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header & Mic Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-5 h-5 ${audioState.isListening ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Audio Input Sync
          </h3>
        </div>

        {audioState.isListening ? (
          <button
            onClick={onStopListening}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer"
          >
            <MicOff className="w-3.5 h-3.5" />
            <span>MUTE MIC</span>
          </button>
        ) : (
          <button
            onClick={() => onStartListening(config.selectedDeviceId)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>CONNECT MIC</span>
          </button>
        )}
      </div>

      {/* Permission warning */}
      {permissionError && (
        <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
          {permissionError} (Check browser microphone permission in address bar)
        </div>
      )}

      {/* 2. Live Audio Meters & Oscilloscope */}
      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        {/* VU Meter & Peak Level */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-rajdhani font-semibold text-zinc-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              VOICE INTENSITY
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              {Math.round(audioState.volume * 100)}%
              {audioState.isRoaring && (
                <span className="ml-1.5 px-1 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded text-[9px] font-bold animate-pulse">
                  ROAR PEAK
                </span>
              )}
            </span>
          </div>

          <div className="relative h-4 w-full bg-zinc-950 rounded-md overflow-hidden border border-zinc-800 p-0.5 flex items-center">
            {/* Noise Gate threshold line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/80 z-20 shadow-[0_0_4px_#facc15]"
              style={{ left: `${config.noiseGate * 100}%` }}
              title="Noise Gate Threshold"
            />

            {/* Roar threshold line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-20 shadow-[0_0_4px_#f43f5e]"
              style={{ left: `${config.roarThreshold * 100}%` }}
              title="Roar Plasma Breath Threshold"
            />

            {/* Active Volume Bar */}
            <div
              className={`h-full rounded-sm transition-all duration-75 ${
                audioState.isRoaring
                  ? 'bg-gradient-to-r from-cyan-500 via-yellow-400 to-rose-500'
                  : audioState.isSpeaking
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                  : 'bg-zinc-700'
              }`}
              style={{ width: `${Math.min(100, audioState.volume * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
            <span>0%</span>
            <span className="text-yellow-400/80">GATE ({Math.round(config.noiseGate * 100)}%)</span>
            <span className="text-rose-400/80">ROAR ({Math.round(config.roarThreshold * 100)}%)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Oscilloscope & Frequency Bands */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Oscilloscope canvas */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">WAVEFORM MONITOR</span>
            <div className="h-14 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center">
              <canvas
                ref={oscCanvasRef}
                width={180}
                height={56}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Tri-Band Equalizer (Bass, Mid, Treble) */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">SPECTRAL BANDS</span>
            <div className="h-14 bg-zinc-950 rounded-lg border border-zinc-800 p-2 flex items-center justify-around gap-2">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full h-7 bg-zinc-900 rounded overflow-hidden flex items-end">
                  <div className="w-full bg-cyan-400 rounded transition-all duration-75" style={{ height: `${audioState.bass * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">BASS</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full h-7 bg-zinc-900 rounded overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-400 rounded transition-all duration-75" style={{ height: `${audioState.mid * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">VOICE</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full h-7 bg-zinc-900 rounded overflow-hidden flex items-end">
                  <div className="w-full bg-purple-400 rounded transition-all duration-75" style={{ height: `${audioState.treble * 100}%` }} />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">TREBLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Audio Device Selector */}
      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-rajdhani font-semibold text-zinc-300">
            Microphone Device
          </label>
          <button
            onClick={onRefreshDevices}
            className="text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh Devices"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
        <select
          value={config.selectedDeviceId}
          onChange={(e) => {
            onUpdateConfig({ selectedDeviceId: e.target.value });
            if (audioState.isListening) {
              onStartListening(e.target.value);
            }
          }}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="">Default System Microphone</option>
          {devices.map((d, i) => (
            <option key={d.deviceId || i} value={d.deviceId}>
              {d.label || `Microphone ${i + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Background Ambient Soundscape & Dynamic Voice Ducking */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h4 className="font-orbitron text-xs font-semibold text-zinc-100 tracking-wider">
              AMBIENT SOUNDSCAPE (432Hz)
            </h4>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.ambientSoundscapeEnabled ?? true}
              onChange={(e) => onUpdateConfig({ ambientSoundscapeEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Generates soft harmonic drones (108Hz, 216Hz, 432Hz) that dynamically duck when microphone input is detected.
        </p>

        {/* Live Ducking Telemetry & Gain Bar */}
        <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Music className="w-3 h-3 text-cyan-400" />
              DRONE DUCKING STATUS:
            </span>
            {!(config.ambientSoundscapeEnabled ?? true) ? (
              <span className="text-zinc-500 font-bold">DISABLED</span>
            ) : audioState.isListening && (audioState.volume > config.noiseGate || audioState.isSpeaking) ? (
              <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 animate-pulse">
                DUCKED (-85% MIC ACTIVE)
              </span>
            ) : (
              <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                ACTIVE AMBIANCE
              </span>
            )}
          </div>

          {/* Dynamic Bar showing effective output level */}
          <div className="relative h-2 w-full bg-zinc-900 rounded overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-200 ${
                !(config.ambientSoundscapeEnabled ?? true)
                  ? 'bg-zinc-700'
                  : audioState.isListening && (audioState.volume > config.noiseGate || audioState.isSpeaking)
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{
                width: `${
                  !(config.ambientSoundscapeEnabled ?? true)
                    ? 0
                    : audioState.isListening && (audioState.volume > config.noiseGate || audioState.isSpeaking)
                    ? Math.round((config.ambientSoundscapeVolume ?? 0.18) * 0.15 * 100 * 2)
                    : Math.round((config.ambientSoundscapeVolume ?? 0.18) * 100 * 2)
                }%`,
              }}
            />
          </div>
        </div>

        {/* Master Soundscape Level Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Drone Master Level</span>
            <span className="font-mono text-zinc-400">
              {Math.round((config.ambientSoundscapeVolume ?? 0.18) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.50"
            step="0.01"
            value={config.ambientSoundscapeVolume ?? 0.18}
            onChange={(e) => onUpdateConfig({ ambientSoundscapeVolume: parseFloat(e.target.value) })}
            disabled={!(config.ambientSoundscapeEnabled ?? true)}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* 5. Fine-Tuning Sliders */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>REACTIVITY TUNING</span>
        </div>

        {/* Mic Sensitivity / Gain */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Microphone Gain</span>
            <span className="font-mono text-zinc-400">{config.gain.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={config.gain}
            onChange={(e) => onUpdateConfig({ gain: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Noise Gate */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Noise Gate (Threshold)</span>
            <span className="font-mono text-zinc-400">{(config.noiseGate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.4"
            step="0.01"
            value={config.noiseGate}
            onChange={(e) => onUpdateConfig({ noiseGate: parseFloat(e.target.value) })}
            className="w-full accent-yellow-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Jaw Articulation Multiplier */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Jaw Opening Sensitivity</span>
            <span className="font-mono text-zinc-400">{config.jawMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={config.jawMultiplier}
            onChange={(e) => onUpdateConfig({ jawMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Roar Threshold */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Roar Plasma Threshold</span>
            <span className="font-mono text-zinc-400">{(config.roarThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={config.roarThreshold}
            onChange={(e) => onUpdateConfig({ roarThreshold: parseFloat(e.target.value) })}
            className="w-full accent-rose-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Toggle Plasma Breath */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-rajdhani font-medium text-zinc-200">Plasma Breath Laser</span>
          </div>
          <input
            type="checkbox"
            checked={config.beamEnabled}
            onChange={(e) => onUpdateConfig({ beamEnabled: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 5. Built-in Test Sound Player (Offline/Demo Sync Testing) */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>TEST AUDIO GENERATOR</span>
          </div>
          {isTestAudioPlaying && (
            <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/30 animate-pulse">
              PLAYING TEST SYNC
            </span>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Simulate voice cadence and audio pulses to verify lip-sync and roar reactions instantly:
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'voice-synth') onStopTestAudio();
              else onPlayTestAudio('voice-synth');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'voice-synth'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'voice-synth' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Voice Synth</span>
          </button>

          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'dragon-roar') onStopTestAudio();
              else onPlayTestAudio('dragon-roar');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'dragon-roar'
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'dragon-roar' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Dragon Roar</span>
          </button>

          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'cyber-beat') onStopTestAudio();
              else onPlayTestAudio('cyber-beat');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'cyber-beat'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'cyber-beat' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Cyber Beat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
