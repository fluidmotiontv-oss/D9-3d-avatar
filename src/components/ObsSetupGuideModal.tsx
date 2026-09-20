import { X, Tv, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ObsSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObsSetupGuideModal({ isOpen, onClose }: ObsSetupGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold text-zinc-100">
              OBS & Streaming Setup Guide
            </h2>
            <p className="text-xs text-zinc-400">
              How to integrate the Cyber Dragon Guardian into OBS Studio, Streamlabs, Twitch, or Discord
            </p>
          </div>
        </div>

        {/* Copy App URL box */}
        <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2">
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            DIRECT BROWSER SOURCE URL
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-zinc-900 border border-zinc-750 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-2 bg-cyan-500 text-zinc-950 font-semibold text-xs rounded-lg hover:bg-cyan-400 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* 3 Methods */}
        <div className="flex flex-col gap-4 text-xs text-zinc-300">
          {/* Method 1: Transparent Browser Source */}
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col gap-2">
            <h3 className="font-rajdhani font-bold text-sm text-cyan-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center border border-cyan-500/40">
                1
              </span>
              Method 1: Direct OBS Browser Source (Alpha Transparency)
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300 pl-1 leading-relaxed">
              <li>In OBS Studio, click the <strong>+</strong> button in the <strong>Sources</strong> dock.</li>
              <li>Select <strong>Browser</strong> (give it a name like <em>Cyber Dragon Avatar</em>).</li>
              <li>Paste the URL above into the <strong>URL</strong> field.</li>
              <li>Set <strong>Width: 1920</strong> and <strong>Height: 1080</strong> (or your stream resolution).</li>
              <li>Check <strong>"Control audio via OBS"</strong> if you want direct stream audio routing.</li>
              <li>Click <strong>OK</strong>. The Dragon will float seamlessly over your game/desktop!</li>
            </ol>
          </div>

          {/* Method 2: Window Capture + Chroma Key Filter */}
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 flex flex-col gap-2">
            <h3 className="font-rajdhani font-bold text-sm text-emerald-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center border border-emerald-500/40">
                2
              </span>
              Method 2: Window Capture + Chroma Key Filter
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300 pl-1 leading-relaxed">
              <li>In this app, set Background Mode to <strong>Chroma Green</strong> or <strong>Chroma Magenta</strong>.</li>
              <li>Press <strong>H</strong> to switch to Clean Fullscreen mode.</li>
              <li>In OBS, add a <strong>Window Capture</strong> source and select your browser window.</li>
              <li>Right-click the Window Capture source in OBS &rarr; <strong>Filters</strong> &rarr; <strong>Add (+)</strong> &rarr; <strong>Chroma Key</strong>.</li>
              <li>Select <strong>Green</strong> (or Magenta), and tweak <em>Similarity</em> to 400. Perfect transparent background!</li>
            </ol>
          </div>

          {/* Hotkeys */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <h4 className="font-mono text-[11px] text-zinc-400 font-semibold mb-2">
              STREAMER SHORTCUTS & HOTKEYS
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-cyan-300 font-mono text-[10px] rounded border border-zinc-700">F</kbd>
                <div className="text-[11px] text-zinc-400 mt-1">Fullscreen</div>
              </div>
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-cyan-300 font-mono text-[10px] rounded border border-zinc-700">H</kbd>
                <div className="text-[11px] text-zinc-400 mt-1">Clean Stream View</div>
              </div>
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-cyan-300 font-mono text-[10px] rounded border border-zinc-700">Space</kbd>
                <div className="text-[11px] text-zinc-400 mt-1">Push-to-Roar</div>
              </div>
              <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 text-cyan-300 font-mono text-[10px] rounded border border-zinc-700">1 - 6</kbd>
                <div className="text-[11px] text-zinc-400 mt-1">Change Theme</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-medium text-xs transition-all cursor-pointer"
          >
            Got it, Let's Stream!
          </button>
        </div>
      </div>
    </div>
  );
}
