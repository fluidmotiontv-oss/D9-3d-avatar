import { useState, useRef, useEffect } from 'react';
import { StreamConfig, DragonTheme, AudioReactiveState, ChatMessage, InfinityFlowPresetType } from '../types';
import {
  Tv,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  MessageSquare,
  Shield,
  HelpCircle,
  Video,
  Send,
  EyeOff,
  Clock,
  Wind,
  CloudFog,
  Snowflake,
  RotateCw,
  Gem,
  Infinity as InfinityIcon,
  Activity,
  Gauge,
  Volume2,
  Terminal,
} from 'lucide-react';

interface StreamOverlayHUDProps {
  streamConfig: StreamConfig;
  theme: DragonTheme;
  audioState: AudioReactiveState;
  onUpdateStreamConfig: (newConfig: Partial<StreamConfig>) => void;
  onOpenObsGuide: () => void;
}

const INFINITY_FLOW_PRESETS: {
  id: InfinityFlowPresetType;
  title: string;
  badge: string;
  icon: typeof RotateCw;
  description: string;
  noiseEffect: string;
}[] = [
  {
    id: 'vortex',
    title: 'Centripetal Vortex',
    badge: 'CYCLONIC',
    icon: RotateCw,
    description: 'Dual-lobe cyclonic singularities with centripetal inward spiral suction and velocity streaks.',
    noiseEffect: 'Accelerates vortex spin velocity, tightens cyclonic core radius, and flares accretion rings.',
  },
  {
    id: 'nebula',
    title: 'Cosmic Nebula',
    badge: 'VOLUMETRIC',
    icon: CloudFog,
    description: 'Soft volumetric interstellar plasma clouds with glowing starlight clusters and Brownian orbital drift.',
    noiseEffect: 'Swells interstellar gas cloud radius, thickens cosmic dust opacity, and triggers stellar flares.',
  },
  {
    id: 'crystalline',
    title: 'Crystalline Flow',
    badge: 'GEOMETRIC',
    icon: Gem,
    description: 'Sharp faceted diamond and hexagonal crystal shards linked by dynamic proximity laser lattice struts.',
    noiseEffect: 'Multiplies lattice strut bond links, accelerates faceted shard spin, and intensifies prismatic glints.',
  },
  {
    id: 'lemniscate',
    title: 'Harmonic Ribbon',
    badge: 'LAMINAR 8-FLOW',
    icon: InfinityIcon,
    description: 'Symmetrical dual-loop cyber ribbon with counter-rotating holographic dials and orbital guide stream.',
    noiseEffect: 'Expands ribbon flow width, accelerates dial tick rotation, and elevates baseline aura glow.',
  },
];

function MiniInfinityFlowRadar({
  preset,
  theme,
  audioState,
  sensitivity = 1.0,
}: {
  preset: InfinityFlowPresetType;
  theme: DragonTheme;
  audioState: AudioReactiveState;
  sensitivity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
      const shift = Math.max(0.1, Math.min(2.5, noiseFloor * 3.2 * sensitivity));
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.translate(cx, cy);

      const scaleX = w * 0.38;
      const scaleY = h * 0.34;

      if (preset === 'vortex') {
        [-scaleX * 0.52, scaleX * 0.52].forEach((vx, idx) => {
          ctx.save();
          ctx.translate(vx, 0);
          ctx.rotate(time * (idx === 0 ? 1.4 : -1.4) * (1 + shift * 0.8));
          ctx.strokeStyle = theme.energy;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.55 + shift * 0.3;
          for (let s = 0; s < 3; s++) {
            ctx.beginPath();
            const startA = (s * Math.PI * 2) / 3;
            for (let r = 2; r < 18; r += 2) {
              const a = startA + r * 0.28;
              const px = Math.cos(a) * r;
              const py = Math.sin(a) * (r * 0.7);
              if (r === 2) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          ctx.restore();
        });
      } else if (preset === 'nebula') {
        for (let i = 0; i < 7; i++) {
          const u = (i / 7) * Math.PI * 2 + time * 0.4;
          const px = scaleX * Math.sin(u);
          const py = scaleY * Math.sin(2 * u);
          const radius = (9 + i * 2) * (0.8 + shift * 0.5);
          const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
          grad.addColorStop(0, i % 2 === 0 ? theme.energy : theme.primary);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.4 + shift * 0.25;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (preset === 'crystalline') {
        const nodes: { x: number; y: number }[] = [];
        for (let i = 0; i < 8; i++) {
          const u = (i / 8) * Math.PI * 2 + time * 0.5;
          const px = scaleX * Math.sin(u) + Math.cos(u * 3) * 5;
          const py = scaleY * Math.sin(2 * u) + Math.sin(u * 2) * 4;
          nodes.push({ x: px, y: py });
        }
        ctx.strokeStyle = theme.energy;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.35 + shift * 0.4;
        ctx.beginPath();
        for (let i = 0; i < nodes.length; i++) {
          const next = nodes[(i + 1) % nodes.length];
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(next.x, next.y);
        }
        ctx.stroke();

        ctx.fillStyle = theme.primary;
        ctx.globalAlpha = 0.85;
        nodes.forEach((n, idx) => {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(time * 2 + idx);
          const s = 3.5 + shift * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.7, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.7, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      } else {
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) {
          const u = (i / 50) * Math.PI * 2;
          const px = scaleX * Math.sin(u + time * 0.7);
          const py = scaleY * Math.sin(2 * (u + time * 0.7));
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = theme.energy;
        ctx.lineWidth = 1.8 + shift * 1.2;
        ctx.globalAlpha = 0.65 + shift * 0.3;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [preset, theme, audioState.ambientNoiseFloor, sensitivity]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={56}
      className="w-full h-14 bg-zinc-950/90 rounded-lg border border-zinc-800"
    />
  );
}

export function StreamOverlayHUD({
  streamConfig,
  theme,
  audioState,
  onUpdateStreamConfig,
  onOpenObsGuide,
}: StreamOverlayHUDProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'CyberRider', color: '#38bdf8', message: 'The Dragon Guardian looks insane on stream!', time: '12:01' },
    { id: '2', user: 'NeonValkyrie', color: '#ec4899', message: 'Dragon9 chrono sync locked in 🔥', time: '12:02' },
    { id: '3', user: 'VoidWalker', color: '#a855f7', message: 'Roar on mic test is next level', time: '12:03' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'Streamer',
      color: theme.primary,
      message: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev.slice(-6), newMsg]);
    setInputMsg('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header & OBS Guide Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Broadcast & OBS Setup
          </h3>
        </div>
        <button
          onClick={onOpenObsGuide}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>OBS Guide</span>
        </button>
      </div>

      {/* 2. Stream Display Modes */}
      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <span className="text-[11px] font-mono text-zinc-400 uppercase">
          BACKGROUND / KEYING MODE
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'app' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'app'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Cyber Dark</span>
          </button>

          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'transparent' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'transparent'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Transparent</span>
          </button>

          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'chroma', chromaType: 'green' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'chroma' && streamConfig.chromaType === 'green'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#00FF00] shadow-sm" />
            <span>Chroma Green</span>
          </button>

          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'chroma', chromaType: 'magenta' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'chroma' && streamConfig.chromaType === 'magenta'
                ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#FF00FF] shadow-sm" />
            <span>Chroma Magenta</span>
          </button>
        </div>
      </div>

      {/* 3. Streamer Overlay Customization */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>AVATAR STAGE & HUD CONTROLS</span>
        </div>

        {/* Streamer Name Tag */}
        <div>
          <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
            Streamer / Guardian Display Name
          </label>
          <input
            type="text"
            value={streamConfig.streamerName}
            onChange={(e) => onUpdateStreamConfig({ streamerName: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 font-mono focus:border-cyan-500 focus:outline-none"
            placeholder="CYBER DRAGON GUARDIAN"
          />
        </div>

        {/* Avatar Scale Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-rajdhani font-medium">Avatar Scale</span>
            <span className="font-mono text-zinc-400">{Math.round(streamConfig.avatarScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.05"
            value={streamConfig.avatarScale}
            onChange={(e) => onUpdateStreamConfig({ avatarScale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Position Offsets */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400 text-[11px]">Offset X</span>
              <span className="font-mono text-[10px] text-zinc-500">{streamConfig.avatarX}px</span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={streamConfig.avatarX}
              onChange={(e) => onUpdateStreamConfig({ avatarX: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400 text-[11px]">Offset Y</span>
              <span className="font-mono text-[10px] text-zinc-500">{streamConfig.avatarY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={streamConfig.avatarY}
              onChange={(e) => onUpdateStreamConfig({ avatarY: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-300 text-[11px] font-bold">✨ Energy Dust Density</span>
              <span className="font-mono text-[10px] text-cyan-400">
                {Math.round((streamConfig.energyDustIntensity ?? 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={streamConfig.energyDustIntensity ?? 1.0}
              onChange={(e) => onUpdateStreamConfig({ energyDustIntensity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showStreamHud}
              onChange={(e) => onUpdateStreamConfig({ showStreamHud: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Broadcast HUD</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showInfinityAura}
              onChange={(e) => onUpdateStreamConfig({ showInfinityAura: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Infinity Flow Aura</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showRunes}
              onChange={(e) => onUpdateStreamConfig({ showRunes: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Dragon9 Runes</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.flipHorizontal}
              onChange={(e) => onUpdateStreamConfig({ flipHorizontal: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Mirror Flip</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showEnergyDust !== false}
              onChange={(e) => onUpdateStreamConfig({ showEnergyDust: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span className="text-cyan-300 font-bold">✨ Energy Dust</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.glitchBurstOnRoar}
              onChange={(e) => onUpdateStreamConfig({ glitchBurstOnRoar: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Glitch on Roar</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showChatSim}
              onChange={(e) => onUpdateStreamConfig({ showChatSim: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span>Live Chat Box</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 col-span-2 pt-1 border-t border-zinc-800/60">
            <input
              type="checkbox"
              checked={streamConfig.wingbeatVisualizer !== false}
              onChange={(e) => onUpdateStreamConfig({ wingbeatVisualizer: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Wingbeat Visualizer (3D Peak Flap)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 col-span-2 pt-1 border-t border-zinc-800/60">
            <input
              type="checkbox"
              checked={streamConfig.showDragonBreath !== false}
              onChange={(e) => onUpdateStreamConfig({ showDragonBreath: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <CloudFog className="w-3.5 h-3.5 text-cyan-400" />
              Dragon Breath Burst Overlay
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 col-span-2 pt-1 border-t border-zinc-800/60">
            <input
              type="checkbox"
              checked={streamConfig.showHolographicPedestal !== false}
              onChange={(e) => onUpdateStreamConfig({ showHolographicPedestal: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Holographic Pedestal Stage Base
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 col-span-2 pt-1 border-t border-zinc-800/60">
            <input
              type="checkbox"
              checked={streamConfig.showMatrixCodeRain !== false}
              onChange={(e) => onUpdateStreamConfig({ showMatrixCodeRain: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Matrix Code Stream & Binary Rain
            </span>
          </label>
        </div>
      </div>

      {/* 3.5. Infinity Flow Particle Presets & Ambient Noise-Floor Engine */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Infinity Flow Particle Presets</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStreamConfig({ showInfinityAura: !streamConfig.showInfinityAura })}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-all cursor-pointer ${
                streamConfig.showInfinityAura
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {streamConfig.showInfinityAura ? 'AURA ACTIVE' : 'AURA MUTED'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Toggle mathematical particle geometry presets behind the Guardian Dragon. Particle velocity, density, and atmospheric luminance dynamically scale based on real-time ambient noise floor.
        </p>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 gap-2">
          {INFINITY_FLOW_PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = (streamConfig.infinityFlowPreset || 'vortex') === p.id;
            return (
              <button
                key={p.id}
                onClick={() =>
                  onUpdateStreamConfig({
                    infinityFlowPreset: p.id,
                    showInfinityAura: true,
                  })
                }
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-200' : 'text-zinc-300'}`}>
                      {p.title}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                    isSelected ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                  {p.description}
                </p>
                <div className="text-[9px] text-cyan-400/90 font-mono mt-0.5">
                  ✦ {p.noiseEffect}
                </div>
              </button>
            );
          })}
        </div>

        {/* Ambient Noise Floor Telemetry & Dynamic Intensity Meter */}
        {(() => {
          const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
          const sensitivity = streamConfig.infinityFlowNoiseFloorSensitivity ?? 1.0;
          const ambientShift = Math.max(0.1, Math.min(2.5, noiseFloor * 3.2 * sensitivity));
          const shiftPct = Math.round((ambientShift - 1) * 100);

          let classification = 'Studio Silent';
          let badgeColor = 'text-emerald-400 border-emerald-800/80 bg-emerald-950/60';
          if (noiseFloor > 0.25) {
            classification = 'High Ambient Hum';
            badgeColor = 'text-amber-300 border-amber-800/80 bg-amber-950/60';
          } else if (noiseFloor > 0.12) {
            classification = 'Moderate Room Noise';
            badgeColor = 'text-cyan-300 border-cyan-800/80 bg-cyan-950/60';
          } else if (noiseFloor > 0.05) {
            classification = 'Low Ambient Whisper';
            badgeColor = 'text-cyan-400 border-cyan-900/80 bg-cyan-950/40';
          }

          return (
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/90 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Ambient Noise Floor</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold ${badgeColor}`}>
                  {classification} ({(noiseFloor * 100).toFixed(1)}%)
                </span>
              </div>

              {/* Noise Floor Progress Track */}
              <div className="flex flex-col gap-1">
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.min(100, Math.max(2, noiseFloor * 100 * 2))}%` }}
                  />
                  {/* Gate marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-400"
                    style={{ left: '20%' }}
                    title="Noise Gate Threshold (0.10)"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                  <span>Base: {(noiseFloor * 100).toFixed(1)}%</span>
                  <span className={shiftPct >= 0 ? 'text-cyan-300 font-bold' : 'text-zinc-400'}>
                    Intensity Shift: {shiftPct >= 0 ? `+${shiftPct}%` : `${shiftPct}%`} ({ambientShift.toFixed(2)}x)
                  </span>
                </div>
              </div>

              {/* Sensitivity Calibration Slider */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-cyan-400" />
                    <span>Noise Floor Sensitivity</span>
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {sensitivity.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={sensitivity}
                  onChange={(e) =>
                    onUpdateStreamConfig({
                      infinityFlowNoiseFloorSensitivity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>0.2x (Subtle)</span>
                  <span>1.0x (Standard)</span>
                  <span>2.5x (Hyper-Swirl)</span>
                </div>
              </div>

              {/* Live Mini Particle Radar */}
              <div className="flex flex-col gap-1 pt-1 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Live Geometry Preview</span>
                  </span>
                  <span className="text-cyan-400 uppercase font-semibold">
                    {streamConfig.infinityFlowPreset || 'vortex'}
                  </span>
                </div>
                <MiniInfinityFlowRadar
                  preset={streamConfig.infinityFlowPreset || 'vortex'}
                  theme={theme}
                  audioState={audioState}
                  sensitivity={sensitivity}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. Wingbeat Visualizer 3D-CSS Mode Card */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Wingbeat 3D Visualizer</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
              streamConfig.wingbeatVisualizer !== false
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {streamConfig.wingbeatVisualizer !== false ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Procedurally articulates cyber dragon wings in 3D-CSS depth. Frequency peak detection triggers dynamic downstrokes, harmonic hover sweeps, and laser blade photon flares.
        </p>

        <label className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer text-xs font-medium text-zinc-200 hover:border-zinc-700 transition-all">
          <input
            type="checkbox"
            checked={streamConfig.wingbeatVisualizer !== false}
            onChange={(e) => onUpdateStreamConfig({ wingbeatVisualizer: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 rounded"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">Enable 3D Wingbeat Kinetics</span>
            <span className="text-[10px] text-zinc-500 font-mono">Reacts to FFT frequency peaks, bass kicks & volume spikes</span>
          </div>
        </label>
      </div>

      {/* 5. Dragon Breath Particle System Card */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <CloudFog className="w-4 h-4 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Dragon Breath Particles</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
              streamConfig.showDragonBreath !== false
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {streamConfig.showDragonBreath !== false ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Renders frosty, semi-transparent smoke plumes billowing from the nostrils during &apos;idle&apos; and &apos;talk&apos; states. Density, ejection velocity, and cloud expansion dynamically scale to your microphone audio volume.
        </p>

        <label className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer text-xs font-medium text-zinc-200 hover:border-zinc-700 transition-all">
          <input
            type="checkbox"
            checked={streamConfig.showDragonBreath !== false}
            onChange={(e) => onUpdateStreamConfig({ showDragonBreath: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 rounded"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">Enable Nostril Smoke Plumes</span>
            <span className="text-[10px] text-zinc-500 font-mono">Active in &apos;idle&apos; &amp; &apos;talk&apos; states</span>
          </div>
        </label>

        {streamConfig.showDragonBreath !== false && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Snowflake className="w-3 h-3 text-cyan-400" />
                Vapor Intensity
              </span>
              <span className="text-cyan-300 font-bold">{((streamConfig.dragonBreathIntensity ?? 1.0) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={streamConfig.dragonBreathIntensity ?? 1.0}
              onChange={(e) => onUpdateStreamConfig({ dragonBreathIntensity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 5. Auto-Hide UI Controls On Inactivity (Clean Overlay Mode) */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">Auto-Hide UI Controls</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
              streamConfig.autoHideControls
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {streamConfig.autoHideControls ? 'ENABLED' : 'OFF'}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Automatically hide the studio top bar, sidebar, and HUD controls after inactivity, forcing a distraction-free clean overlay until mouse movement is detected.
        </p>

        <label className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer text-xs font-medium text-zinc-200 hover:border-zinc-700 transition-all">
          <input
            type="checkbox"
            checked={!!streamConfig.autoHideControls}
            onChange={(e) => onUpdateStreamConfig({ autoHideControls: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
          />
          <span className="flex-1 font-rajdhani font-semibold">Enable Inactivity Auto-Hide</span>
        </label>

        {streamConfig.autoHideControls && (
          <div className="flex flex-col gap-2 p-2.5 bg-zinc-950/80 rounded-lg border border-cyan-950/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                Inactivity Timeout Duration
              </span>
              <span className="font-mono text-xs font-bold text-cyan-300">
                {streamConfig.autoHideDurationSec ?? 5} seconds
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={streamConfig.autoHideDurationSec ?? 5}
              onChange={(e) => onUpdateStreamConfig({ autoHideDurationSec: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>2s (Fast)</span>
              <span>10s (Standard)</span>
              <span>30s (Slow)</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Stream Chat Simulator (Optional floating overlay on stream) */}
      {streamConfig.showChatSim && (
        <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>LIVE CHAT PREVIEW</span>
          </div>

          <div className="h-28 bg-zinc-950 rounded-lg p-2 overflow-y-auto flex flex-col gap-1.5 border border-zinc-850">
            {messages.map((m) => (
              <div key={m.id} className="text-xs leading-snug flex items-start gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">{m.time}</span>
                <span className="font-bold text-[11px]" style={{ color: m.color }}>
                  {m.user}:
                </span>
                <span className="text-zinc-200 text-[11px]">{m.message}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type test chat message..."
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-1.5 bg-cyan-500 text-zinc-950 rounded-lg hover:bg-cyan-400 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
