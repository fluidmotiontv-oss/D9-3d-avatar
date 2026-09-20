import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  BookOpen,
  Tv,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  Globe,
  Smartphone,
} from 'lucide-react';
import { WEB_COMPONENT_SOURCE_CODE } from '../web-component/cyber-dragon-avatar';
import { DragonTheme, AudioReactiveState } from '../types';

interface SmartObjectWrapperProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
}

export const SmartObjectWrapper: React.FC<SmartObjectWrapperProps> = ({
  theme,
  audioState,
}) => {
  const [copied, setCopied] = useState(false);
  const [embedMode, setEmbedMode] = useState<'ebook' | 'mediahub' | 'code'>('ebook');
  const [selectedThemeAttr, setSelectedThemeAttr] = useState('cyber-neon');
  const [freqAttr, setFreqAttr] = useState('432');
  const [autoSyncAttr, setAutoSyncAttr] = useState(true);

  const embedHtmlSnippet = `<!-- 1. Include the Standalone Cyber Dragon Web Component Script -->
<script src="https://fluidmotion.tv/cdn/cyber-dragon-avatar.js"></script>

<!-- 2. Drop the Smart Object into your E-Book Reader, Payhip Store, or Media Hub -->
<cyber-dragon-avatar 
  theme="${selectedThemeAttr}" 
  freq="${freqAttr}" 
  auto-sync="${autoSyncAttr}"
  jaw-multiplier="1.5"
  width="100%"
  height="420px">
</cyber-dragon-avatar>

<!-- 3. Optional JavaScript Control API -->
<script>
  const dragon = document.querySelector('cyber-dragon-avatar');
  // Trigger speech or animations directly from your reader chapters:
  // dragon.speak('Welcome to Chapter 1 of the Dragon 9 Temporal System.');
  // dragon.roar();
</script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedHtmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBundle = () => {
    const blob = new Blob([WEB_COMPONENT_SOURCE_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyber-dragon-avatar.webcomponent.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header Bar */}
      <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg border text-xs"
            style={{
              backgroundColor: `${theme.primary}20`,
              borderColor: theme.primary,
              color: theme.energy,
            }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs text-zinc-100 flex items-center gap-2">
              <span>SMART OBJECT WEB COMPONENT WRAPPER</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded font-mono">
                &lt;cyber-dragon-avatar&gt;
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Self-contained Shadow DOM custom element for E-Books & Media Hubs
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadBundle}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-mono transition-all cursor-pointer border border-zinc-700"
          title="Download Standalone Web Component Bundle"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">.JS Bundle</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-rajdhani font-bold">
        <button
          onClick={() => setEmbedMode('ebook')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
            embedMode === 'ebook'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>E-Book Reader Embed</span>
        </button>

        <button
          onClick={() => setEmbedMode('mediahub')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
            embedMode === 'mediahub'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>FluidmotionTV Hub</span>
        </button>

        <button
          onClick={() => setEmbedMode('code')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
            embedMode === 'code'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>HTML/JS Code</span>
        </button>
      </div>

      {/* VIEW 1: E-BOOK READER EMBED SIMULATION */}
      {embedMode === 'ebook' && (
        <div className="flex flex-col gap-3 font-sans">
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                SIMULATED DIGITAL E-BOOK READER (PAYHIP / GUMROAD)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                ● SMART OBJECT ACTIVE
              </span>
            </div>

            {/* Ebook Page Layout */}
            <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 text-zinc-300 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>CHAPTER 03: THE 54-MINUTE INFINITY HOUR</span>
                <span>PAGE 42 / 108</span>
              </div>

              <h3 className="font-orbitron font-extrabold text-sm text-cyan-300">
                Temporal Fluidity & Harmonic Synchronicity
              </h3>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                "When temporal frameworks shift from mechanical 60-minute structures to the Dragon 9 54-minute harmonic hour, biological and neural rhythms realign with the natural 432Hz golden frequency resonance."
              </p>

              {/* Embedded Mini Smart Object Avatar Widget inside E-Book */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/10 flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center border text-xs font-orbitron font-bold relative overflow-hidden"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    borderColor: theme.primary,
                    color: theme.energy,
                  }}
                >
                  <span className="text-xl">龍</span>
                  {audioState.isSpeaking && (
                    <div
                      className="absolute inset-0 animate-ping opacity-30"
                      style={{ backgroundColor: theme.energy }}
                    />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-orbitron text-zinc-100">
                      CYBER GUARDIAN // EBOOK NARRATOR
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      432Hz SYNC
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {audioState.isSpeaking
                      ? 'Speaking passage through 432Hz harmonic processor...'
                      : 'Standby. Click below to narrate chapter.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FLUIDMOTIONTV MEDIA HUB EMBED */}
      {embedMode === 'mediahub' && (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                FLUIDMOTIONTV MEDIA HUB DASHBOARD
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                PORTAL MK-IX
              </span>
            </div>

            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-zinc-200">
                  LIVE STREAM CHRONOMETER WIDGET
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  D9-SOLAR CYCLE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">VOICE HARMONICS</div>
                  <div className="text-sm font-bold text-amber-300">432.0 Hz</div>
                </div>
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">JAW MECHANICS</div>
                  <div className="text-sm font-bold text-cyan-300">60 FPS AUTO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HTML / JAVASCRIPT EMBED CODE */}
      {embedMode === 'code' && (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-t-xl border border-zinc-800">
            <span className="text-zinc-300 text-[11px]">
              &lt;cyber-dragon-avatar&gt; Drop-in Embed Code
            </span>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded font-bold transition-all cursor-pointer text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY EMBED'}</span>
            </button>
          </div>

          <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-b-xl border-x border-b border-zinc-800 text-[11px] leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre font-mono">
            {embedHtmlSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
