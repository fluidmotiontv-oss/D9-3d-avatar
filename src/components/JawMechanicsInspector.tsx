import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Download,
  Terminal,
} from 'lucide-react';
import { JAW_MECHANICS_STANDALONE_SNIPPET } from '../utils/jawAudioEngineSnippet';
import { AudioReactiveState, DragonTheme } from '../types';

interface JawMechanicsInspectorProps {
  audioState: AudioReactiveState;
  theme: DragonTheme;
  onUpdateJawMultiplier?: (val: number) => void;
}

export const JawMechanicsInspector: React.FC<JawMechanicsInspectorProps> = ({
  audioState,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const [maxJawDrop, setMaxJawDrop] = useState(42);
  const [maxJawAngle, setMaxJawAngle] = useState(18);
  const [formantWeight, setFormantWeight] = useState(65);
  const [springAttack, setSpringAttack] = useState(0.45);
  const [springDecay, setSpringDecay] = useState(0.22);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'snippet' | 'formula'>('visualizer');

  // Simulated animated jaw preview
  const simulatedDropPx = (audioState.jawOpen * maxJawDrop).toFixed(1);
  const simulatedAngleDeg = (audioState.jawOpen * maxJawAngle).toFixed(1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JAW_MECHANICS_STANDALONE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSnippet = () => {
    const blob = new Blob([JAW_MECHANICS_STANDALONE_SNIPPET], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dragon9-audio-reactive-jaw.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg border text-xs"
            style={{
              backgroundColor: `${theme.primary}20`,
              borderColor: theme.primary,
              color: theme.energy,
            }}
          >
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs text-zinc-100 flex items-center gap-1.5">
              <span>CYBERNETICS // JAW MECHANICS</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                60 FPS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Web Audio API frequency analysis → Jaw animation mapping
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadSnippet}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-mono transition-all cursor-pointer border border-zinc-700"
          title="Download JavaScript File"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">.JS Snippet</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-rajdhani font-bold">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase ${
            activeTab === 'visualizer'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Telemetry & Physics
        </button>
        <button
          onClick={() => setActiveTab('snippet')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
            activeTab === 'snippet'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>JS Snippet</span>
        </button>
        <button
          onClick={() => setActiveTab('formula')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase ${
            activeTab === 'formula'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Mapping Math
        </button>
      </div>

      {/* VIEW 1: TELEMETRY & PHYSICS TESTER */}
      {activeTab === 'visualizer' && (
        <div className="flex flex-col gap-3">
          {/* Live Telemetry Radar */}
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-850 pb-2">
              <span className="flex items-center gap-1.5 text-zinc-200 font-bold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                LIVE HINGE TELEMETRY
              </span>
              <span className="text-[10px] text-cyan-400">
                {audioState.isSpeaking ? '● SPEECH ACTIVE' : '○ IDLE HINGE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">JAW OPEN</div>
                <div className="text-sm font-bold text-cyan-300">
                  {(audioState.jawOpen * 100).toFixed(0)}%
                </div>
              </div>

              <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">TRANSLATE Y</div>
                <div className="text-sm font-bold text-amber-300">
                  +{simulatedDropPx}px
                </div>
              </div>

              <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">ROTATION</div>
                <div className="text-sm font-bold text-pink-300">
                  {simulatedAngleDeg}°
                </div>
              </div>

              <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-500">SPEECH FORMANT</div>
                <div className="text-sm font-bold text-emerald-300">
                  {(audioState.mid * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Visual Hinge Gauge */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Jaw Mandible Aperture (A0 → A_max)</span>
                <span>{simulatedDropPx}px / {maxJawDrop}px</span>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, audioState.jawOpen * 100)}%`,
                    backgroundColor: audioState.isRoaring
                      ? '#f43f5e'
                      : audioState.isSpeaking
                      ? theme.energy
                      : '#3f3f46',
                    boxShadow: `0 0 10px ${theme.energy}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Physics Tuners */}
          <div className="p-3 bg-zinc-900/70 rounded-xl border border-zinc-800 flex flex-col gap-3 font-mono text-xs">
            <div className="font-bold text-zinc-200 flex items-center justify-between">
              <span>MANDIBLE SPRING & DAMPING TUNING</span>
              <button
                onClick={() => {
                  setMaxJawDrop(42);
                  setMaxJawAngle(18);
                  setFormantWeight(65);
                  setSpringAttack(0.45);
                  setSpringDecay(0.22);
                }}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            {/* Max Jaw Drop */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Max Vertical Drop Distance:</span>
                <span className="text-cyan-300 font-bold">{maxJawDrop}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={maxJawDrop}
                onChange={(e) => setMaxJawDrop(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Max Jaw Angle */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Max Angular Rotation:</span>
                <span className="text-cyan-300 font-bold">{maxJawAngle}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={maxJawAngle}
                onChange={(e) => setMaxJawAngle(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Speech Formant Ratio */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Voice Formant Weight (300Hz-2800Hz):</span>
                <span className="text-cyan-300 font-bold">{formantWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={formantWeight}
                onChange={(e) => setFormantWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Attack & Decay Springs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>Attack Alpha:</span>
                  <span className="text-emerald-400 font-bold">{springAttack}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={springAttack}
                  onChange={(e) => setSpringAttack(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>Decay Alpha:</span>
                  <span className="text-amber-400 font-bold">{springDecay}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={springDecay}
                  onChange={(e) => setSpringDecay(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STANDALONE JS SNIPPET */}
      {activeTab === 'snippet' && (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-t-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>dragon9-audio-reactive-jaw.js</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded font-bold transition-all cursor-pointer text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
            </button>
          </div>

          <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-b-xl border-x border-b border-zinc-800 text-[11px] leading-relaxed max-h-[340px] overflow-y-auto overflow-x-auto whitespace-pre font-mono">
            {JAW_MECHANICS_STANDALONE_SNIPPET}
          </pre>
        </div>
      )}

      {/* VIEW 3: MATHEMATICAL FORMULA */}
      {activeTab === 'formula' && (
        <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 font-mono text-xs flex flex-col gap-3 text-zinc-300">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>DIRECT AMPLITUDE & FORMANT MAPPING EQUATIONS</span>
          </div>

          <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-[11px]">
            <p className="text-zinc-400">
              <strong className="text-zinc-200">1. RMS Volume Calculation:</strong>
              <br />
              <code className="text-cyan-400">RMS = sqrt( (1 / N) * sum((timeData[i] - 128) / 128)^2 )</code>
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-200">2. Speech Formant Band Energy (300Hz - 2800Hz):</strong>
              <br />
              <code className="text-emerald-400">E_vocal = (1 / K) * sum(freqData[k] / 255) for bin(k) in [300, 2800]Hz</code>
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-200">3. Target Mandible Aperture ($T_j$):</strong>
              <br />
              <code className="text-amber-400">T_j = min(1.0, ( (1 - w_vocal) * RMS + w_vocal * E_vocal ) * M_jaw)</code>
            </p>

            <p className="text-zinc-400">
              <strong className="text-zinc-200">4. Asymmetric Spring Interpolation:</strong>
              <br />
              <code className="text-pink-400">J_t = J_{`{t-1}`} + (T_j - J_{`{t-1}`}) * (T_j &gt; J_{`{t-1}`} ? α_attack : α_decay)</code>
            </p>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            This prevents flickering micro-jitters during sibilants (such as 's' and 'f') while opening rapidly on plosives and vowels ('a', 'o', 'u').
          </p>
        </div>
      )}
    </div>
  );
};
