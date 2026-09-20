import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Play,
  Square,
  Radio,
  Sliders,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  globalAudio432Pipeline,
  DRAGON_VOICE_PRESETS,
  PRESET_SCRIPT_LIBRARY,
  VoicePreset,
} from '../utils/audio432Processor';
import { AudioReactiveState, DragonTheme } from '../types';

interface ElevenLabs432PipelineProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
}

export const ElevenLabs432Pipeline: React.FC<ElevenLabs432PipelineProps> = ({
  theme,
  audioState,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(DRAGON_VOICE_PRESETS[0]);
  const [is432Tuned, setIs432Tuned] = useState(true);
  const [customPrompt, setCustomPrompt] = useState(DRAGON_VOICE_PRESETS[0].avatarVoicePrompt);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState(PRESET_SCRIPT_LIBRARY[0].id);

  // Toggle 432Hz vs 440Hz tuning
  const handleToggle432 = (enable: boolean) => {
    setIs432Tuned(enable);
    globalAudio432Pipeline.setTuning432(enable);
  };

  const handlePlayVoiceLine = (textToSpeak: string) => {
    if (isPlaying) {
      globalAudio432Pipeline.stopPlayback();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    globalAudio432Pipeline.speakVoiceLine(
      textToSpeak,
      selectedVoice,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  const handleSelectVoice = (voice: VoicePreset) => {
    setSelectedVoice(voice);
    setCustomPrompt(voice.avatarVoicePrompt);
  };

  const handleSelectScript = (scriptText: string, scriptId: string) => {
    setSelectedScriptId(scriptId);
    setCustomPrompt(scriptText);
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* 432Hz Master Tuning Bar */}
      <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg border text-xs"
              style={{
                backgroundColor: `${theme.primary}20`,
                borderColor: theme.primary,
                color: theme.energy,
              }}
            >
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="font-orbitron font-bold text-xs text-zinc-100 flex items-center gap-2">
                <span>ELEVENLABS // 432Hz HARMONIC PIPELINE</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-all ${
                    is432Tuned
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {is432Tuned ? '432Hz GOLDEN TUNING' : '440Hz STANDARD'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Real-time harmonic retuner (A4 = 432Hz ratio 0.9818) & voice processor
              </p>
            </div>
          </div>

          {/* 432Hz vs 440Hz Toggle Switch */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
            <button
              onClick={() => handleToggle432(true)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                is432Tuned
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              432Hz
            </button>
            <button
              onClick={() => handleToggle432(false)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                !is432Tuned
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              440Hz
            </button>
          </div>
        </div>

        {/* 432Hz Harmonic Frequency Peaks & Spectral Tri-Band Monitor */}
        <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-850 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              SOLFEGGIO HARMONIC NODES (DSP RESONANCE)
            </span>
            <span className="text-amber-300">
              {is432Tuned ? 'LOCKED AT 432.00 Hz' : 'STANDARD 440.00 Hz'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800/80">
              <span className="text-zinc-500">SUB-HARMONIC</span>
              <div className="font-bold text-amber-300">216.0 Hz</div>
              <div className="text-[9px] text-zinc-500">+3.5 dB Q=2.5</div>
            </div>

            <div className="p-1.5 rounded bg-amber-950/40 border border-amber-800/60 shadow-inner">
              <span className="text-amber-400 font-bold">CARRIER FUNDAMENTAL</span>
              <div className="font-bold text-amber-200 text-xs">432.0 Hz</div>
              <div className="text-[9px] text-amber-400">+6.0 dB Q=3.8</div>
            </div>

            <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800/80">
              <span className="text-zinc-500">UPPER OVERTONE</span>
              <div className="font-bold text-amber-300">864.0 Hz</div>
              <div className="text-[9px] text-zinc-500">+2.5 dB Q=3.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Character Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Select Cyber Voice Preset
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DRAGON_VOICE_PRESETS.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelectVoice(v)}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                selectedVoice.id === v.id
                  ? 'bg-zinc-900 border-cyan-500/80 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-orbitron font-bold text-xs text-zinc-100">
                  {v.name}
                </span>
                {selectedVoice.id === v.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">{v.title}</div>
              <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2">
                {v.character}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Script Library & E-Book Lines */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Preloaded Dragon 9 & Fluid Media Scripts
        </span>

        <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {PRESET_SCRIPT_LIBRARY.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScript(s.text, s.id)}
              className={`p-2 rounded-lg text-left border transition-all cursor-pointer flex items-center justify-between ${
                selectedScriptId === s.id
                  ? 'bg-zinc-850 border-amber-500/60 text-zinc-100'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold font-mono text-zinc-200">
                  {s.title}
                </span>
                <span className="text-[9px] text-amber-400/80 uppercase">
                  {s.category}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Load &gt;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Textarea & 432Hz Speak Trigger */}
      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            Voice Synthesizer Input
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Routes to Web Audio + Jaw Animation
          </span>
        </div>

        <textarea
          rows={3}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter custom narration or dragon voice line..."
          className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-all resize-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlayVoiceLine(customPrompt)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer uppercase ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>HALT 432Hz SYNTHESIS</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>SYNTHESIZE & SPEAK (432Hz)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
