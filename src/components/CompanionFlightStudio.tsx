import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Code,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  Zap,
  Activity,
  Maximize2,
  Tv,
  Navigation,
  Wind,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { DragonTheme, AudioReactiveState, AvatarFlightMode, FlightPatternType, FlightPhysicsConfig } from '../types';

export const PHYSICS_PRESETS: {
  id: string;
  name: string;
  badge: string;
  desc: string;
  config: FlightPhysicsConfig;
}[] = [
  {
    id: 'balanced',
    name: 'Balanced Aero',
    badge: 'DEFAULT',
    desc: 'Harmonic cruise velocity, responsive steering, and standard air resistance.',
    config: { velocity: 1.0, acceleration: 1.0, drag: 0.92 },
  },
  {
    id: 'drift',
    name: 'Quantum Drift',
    badge: 'ZERO-G',
    desc: 'High velocity with minimal drag (0.98), producing massive kinetic inertia and sweeping arcs.',
    config: { velocity: 1.4, acceleration: 0.6, drag: 0.98 },
  },
  {
    id: 'interceptor',
    name: 'Apex Interceptor',
    badge: 'HIGH-G',
    desc: 'Hypersonic thrust with instant steering torque and aggressive airbrakes (0.85) for razor-sharp dock transitions.',
    config: { velocity: 1.8, acceleration: 2.3, drag: 0.85 },
  },
  {
    id: 'glider',
    name: 'Harmonic Glider',
    badge: 'MEDITATION',
    desc: 'Relaxed sub-sonic float, gentle banking acceleration, and silky fluid damping.',
    config: { velocity: 0.6, acceleration: 0.7, drag: 0.95 },
  },
];

interface CompanionFlightStudioProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  flightMode?: AvatarFlightMode;
  onFlightModeChange?: (mode: AvatarFlightMode) => void;
  flightPattern?: FlightPatternType;
  onFlightPatternChange?: (pattern: FlightPatternType) => void;
  flightSpeed?: number;
  onFlightSpeedChange?: (speed: number) => void;
  flightPhysics?: FlightPhysicsConfig;
  onFlightPhysicsChange?: (physics: FlightPhysicsConfig) => void;
}

export const CompanionFlightStudio: React.FC<CompanionFlightStudioProps> = ({
  theme,
  audioState,
  flightMode = 'docked',
  onFlightModeChange,
  flightPattern = 'infinity',
  onFlightPatternChange,
  flightSpeed = 1.0,
  onFlightSpeedChange,
  flightPhysics = { velocity: 1.0, acceleration: 1.0, drag: 0.92 },
  onFlightPhysicsChange,
}) => {
  // Lifecycle States: 'DOCKED' | 'COCOON' | 'FLIGHT' | 'REASSEMBLING'
  const [companionState, setCompanionState] = useState<'DOCKED' | 'COCOON' | 'FLIGHT' | 'REASSEMBLING'>(
    flightMode === 'flight' ? 'FLIGHT' : 'DOCKED'
  );
  const [idleTimeoutSec, setIdleTimeoutSec] = useState(12);
  const [idleElapsedSec, setIdleElapsedSec] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [singleFileCode, setSingleFileCode] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'code' | 'specs'>('simulator');
  const [testClickCount, setTestClickCount] = useState(0);

  // Sync internal state when external flightMode changes
  useEffect(() => {
    if (flightMode === 'flight') {
      setCompanionState('FLIGHT');
    } else if (flightMode === 'docked' && companionState === 'FLIGHT') {
      setCompanionState('DOCKED');
    }
  }, [flightMode]);

  // Load single-file HTML code
  useEffect(() => {
    fetch('/dragon9-cyber-companion.html')
      .then((r) => r.text())
      .then((txt) => setSingleFileCode(txt))
      .catch(() => {});
  }, []);

  // Idle Timer Simulation
  useEffect(() => {
    if (companionState !== 'DOCKED') return;

    const interval = setInterval(() => {
      setIdleElapsedSec((prev) => {
        const next = prev + 0.5;
        if (next >= idleTimeoutSec) {
          triggerCocoonTransition();
          return 0;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [companionState, idleTimeoutSec]);

  // Transition Triggers
  const triggerCocoonTransition = () => {
    setCompanionState('COCOON');
    onFlightModeChange?.('cocoon');
    setTimeout(() => {
      setCompanionState('FLIGHT');
      onFlightModeChange?.('flight');
    }, 2000);
  };

  const triggerPatrolFlight = () => {
    setCompanionState('FLIGHT');
    onFlightModeChange?.('flight');
  };

  const triggerReassemble = () => {
    setCompanionState('REASSEMBLING');
    onFlightModeChange?.('reassembling');
    setTimeout(() => {
      setCompanionState('DOCKED');
      onFlightModeChange?.('docked');
      setIdleElapsedSec(0);
    }, 800);
  };

  const handleCopyCode = () => {
    if (singleFileCode) {
      navigator.clipboard.writeText(singleFileCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadHtml = () => {
    if (!singleFileCode) return;
    const blob = new Blob([singleFileCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dragon9-cyber-companion.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progressPercent = Math.min(100, (idleElapsedSec / idleTimeoutSec) * 100);

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Top Banner */}
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
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs text-zinc-100 flex items-center gap-2">
              <span>AUTONOMOUS COMPANION & PATROL FLIGHT</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  companionState === 'DOCKED'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : companionState === 'COCOON'
                    ? 'bg-pink-950 text-pink-300 border border-pink-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {companionState}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Glassmorphism Box ⇄ Inactive Cocoon ⇄ Transparent Patrol Flight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="/dragon9-cyber-companion.html"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-all border border-zinc-700 flex items-center gap-1"
            title="Open Standalone Single-File Application"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Launch App</span>
          </a>

          <button
            onClick={handleDownloadHtml}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
            title="Download Standalone Single-File HTML"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.HTML</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-rajdhani font-bold">
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase ${
            activeSubTab === 'simulator'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Lifecycle Simulator
        </button>
        <button
          onClick={() => setActiveSubTab('code')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
            activeSubTab === 'code'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Single-File Code</span>
        </button>
        <button
          onClick={() => setActiveSubTab('specs')}
          className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer uppercase ${
            activeSubTab === 'specs'
              ? 'bg-zinc-800 text-cyan-300 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Architecture Specs
        </button>
      </div>

      {/* VIEW 1: INTERACTIVE SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="flex flex-col gap-3">
          {/* State Controls Bar */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                AUTONOMOUS STATE CONTROLS
              </span>
              <span className="text-[10px] text-cyan-400">
                ACTIVE: {companionState}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setCompanionState('DOCKED');
                  onFlightModeChange?.('docked');
                  setIdleElapsedSec(0);
                }}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                  companionState === 'DOCKED'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                1. DOCKED BOX
              </button>

              <button
                onClick={triggerCocoonTransition}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                  companionState === 'COCOON'
                    ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                2. COCOON EGG
              </button>

              <button
                onClick={triggerPatrolFlight}
                className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                  companionState === 'FLIGHT'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                3. PATROL FLIGHT
              </button>
            </div>

            {/* Infinity Flow Flight Trajectory Selector */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-850">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span className="font-bold flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  INFINITY FLOW FLIGHT PATTERN:
                </span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">{flightPattern}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['infinity', 'cursor', 'lissajous'] as FlightPatternType[]).map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => onFlightPatternChange?.(pattern)}
                    className={`py-1.5 px-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer uppercase text-center ${
                      flightPattern === pattern
                        ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {pattern === 'infinity' ? '∞ 8-LOOP' : pattern === 'cursor' ? 'CURSOR CHASE' : 'ORBITAL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inactivity Slider */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-850">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Unattended Inactivity Trigger:</span>
                <span className="text-cyan-300 font-bold">{idleTimeoutSec}s</span>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                step="2"
                value={idleTimeoutSec}
                onChange={(e) => {
                  setIdleTimeoutSec(Number(e.target.value));
                  setIdleElapsedSec(0);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              {/* Progress countdown bar */}
              <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500">
                <span>IDLE TIMER:</span>
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-cyan-400 font-bold">
                  {Math.max(0, idleTimeoutSec - idleElapsedSec).toFixed(0)}s left
                </span>
              </div>
            </div>

            {/* Configurable Flight Physics Engine Parameters Card */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-300 border-b border-zinc-850 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  AERODYNAMIC FLIGHT PHYSICS ENGINE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  NEWTONIAN DYNAMICS
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Configure the physical parameters (drag, velocity, acceleration) that govern how the dragon travels between the stationary dock and autonomous flight patterns.
              </p>

              {/* Quick Preset Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Dynamics Profiles:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PHYSICS_PRESETS.map((preset) => {
                    const isSelected =
                      Math.abs(flightPhysics.velocity - preset.config.velocity) < 0.05 &&
                      Math.abs(flightPhysics.acceleration - preset.config.acceleration) < 0.05 &&
                      Math.abs(flightPhysics.drag - preset.config.drag) < 0.01;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onFlightPhysicsChange?.(preset.config)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400/80 text-cyan-200 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-zinc-200">{preset.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-850 text-cyan-400">
                            {preset.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-sans leading-tight">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 Configurable Physics Sliders */}
              <div className="space-y-3 pt-1 border-t border-zinc-850">
                {/* 1. Atmospheric Drag */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-300 font-bold flex items-center gap-1">
                      <Wind className="w-3 h-3 text-emerald-400" />
                      Atmospheric Drag (Kinetic Airbrake):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">
                        {flightPhysics.drag >= 0.96
                          ? 'Zero-G Drift'
                          : flightPhysics.drag <= 0.86
                          ? 'Heavy Airbrake'
                          : 'Standard Aero'}
                      </span>
                      <span className="font-mono text-emerald-300 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {flightPhysics.drag.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="0.99"
                    step="0.01"
                    value={flightPhysics.drag}
                    onChange={(e) =>
                      onFlightPhysicsChange?.({ ...flightPhysics, drag: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                    <span>0.80 (Crisp Dock Braking)</span>
                    <span>0.92 (Nominal Damping)</span>
                    <span>0.99 (Infinite Glide)</span>
                  </div>
                </div>

                {/* 2. Cruising Velocity */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-300 font-bold flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      Cruising Velocity (Airspeed Multiplier):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">
                        {flightPhysics.velocity >= 2.0
                          ? 'Hypersonic'
                          : flightPhysics.velocity <= 0.6
                          ? 'Subsonic Float'
                          : 'Cruise Speed'}
                      </span>
                      <span className="font-mono text-cyan-300 font-bold bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/60">
                        {flightPhysics.velocity.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={flightPhysics.velocity}
                    onChange={(e) =>
                      onFlightPhysicsChange?.({ ...flightPhysics, velocity: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                    <span>0.2x (Slow Motion)</span>
                    <span>1.0x (Standard)</span>
                    <span>3.0x (Hypersonic Dash)</span>
                  </div>
                </div>

                {/* 3. Steering & Thrust Acceleration */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-300 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-pink-400" />
                      Thrust & Steering Torque (Acceleration):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[10px]">
                        {flightPhysics.acceleration >= 2.0
                          ? 'Twitch Apex'
                          : flightPhysics.acceleration <= 0.6
                          ? 'High Inertia'
                          : 'Agile Banking'}
                      </span>
                      <span className="font-mono text-pink-300 font-bold bg-pink-950/50 px-1.5 py-0.5 rounded border border-pink-800/60">
                        {flightPhysics.acceleration.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={flightPhysics.acceleration}
                    onChange={(e) =>
                      onFlightPhysicsChange?.({
                        ...flightPhysics,
                        acceleration: Number(e.target.value),
                      })
                    }
                    className="w-full accent-pink-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                    <span>0.2x (Heavy Sweeping Arcs)</span>
                    <span>1.0x (Standard Agile)</span>
                    <span>3.0x (Instant Turn Torque)</span>
                  </div>
                </div>
              </div>

              {/* Transit Test Action */}
              <div className="pt-2 border-t border-zinc-850">
                <button
                  onClick={() => {
                    if (flightMode === 'flight') {
                      triggerReassemble();
                    } else {
                      triggerPatrolFlight();
                    }
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-[11px]"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {flightMode === 'flight'
                      ? 'TEST AIRBRAKE & DOCK RETURN'
                      : 'TEST ACCELERATION & LAUNCH FLIGHT'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Background Verification Bed (Shows pointer-events pass-through) */}
          <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                CLICK PASS-THROUGH TEST BED
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Clicks Handled: <strong className="text-emerald-300">{testClickCount}</strong>
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              In <strong>Patrol Flight Mode</strong>, the dragon canvas is set to{' '}
              <code className="text-cyan-300 font-mono">pointer-events: none</code>. Click the buttons below while the dragon is flying to physically verify pass-through events:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTestClickCount((c) => c + 1)}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-lg text-xs font-mono font-bold border border-zinc-700 cursor-pointer transition-all active:scale-95 text-center"
              >
                + TEST CLICK BUTTON #1
              </button>
              <button
                onClick={() => setTestClickCount((c) => c + 5)}
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg text-xs font-mono font-bold border border-zinc-700 cursor-pointer transition-all active:scale-95 text-center"
              >
                + ADD 5 BOOST #2
              </button>
            </div>

            {companionState === 'FLIGHT' && (
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-center font-mono text-xs text-emerald-300">
                ✨ Flying across screen. Hover over center or click below to trigger instant return!
                <button
                  onClick={triggerReassemble}
                  className="mt-1.5 block w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded cursor-pointer transition-all text-xs"
                >
                  ⚡ RE-ASSEMBLE TO DOCK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE FILE HTML CODE VIEWER */}
      {activeSubTab === 'code' && (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-t-xl border border-zinc-800">
            <span className="text-zinc-300 text-[11px]">
              dragon9-cyber-companion.html (Single-File Complete App)
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded font-bold transition-all cursor-pointer text-[11px]"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'COPIED!' : 'COPY ALL CODE'}</span>
            </button>
          </div>

          <pre className="p-3 bg-zinc-950 text-zinc-300 rounded-b-xl border-x border-b border-zinc-800 text-[11px] leading-relaxed max-h-[340px] overflow-y-auto whitespace-pre font-mono">
            {singleFileCode || 'Loading single-file code...'}
          </pre>
        </div>
      )}

      {/* VIEW 3: ARCHITECTURE SPECS */}
      {activeSubTab === 'specs' && (
        <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 font-mono text-xs flex flex-col gap-3 text-zinc-300">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>4-STAGE AUTONOMOUS COMPANION ARCHITECTURE</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <strong className="text-cyan-300">1. Glassmorphic Docked Window:</strong>
              <p className="text-zinc-400 mt-0.5">
                Centrally anchored UI box with CSS backdrop-filter blur, SVG articulated dragon head, and Web Audio API 432Hz harmonic peaking node.
              </p>
            </div>

            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <strong className="text-pink-300">2. Inactive Cocoon Phase:</strong>
              <p className="text-zinc-400 mt-0.5">
                Triggered by mouse/interaction idle monitor. Curls dragon inward, collapses box geometry into an oval egg, and activates counter-rotating holographic particle rings.
              </p>
            </div>

            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <strong className="text-emerald-300">3. Transparent Canvas Patrol Flight:</strong>
              <p className="text-zinc-400 mt-0.5">
                Hides host window, applies <code className="text-emerald-400">pointer-events: none</code>, and spawns a mini cyber dragon flying smooth Lissajous/spline orbital vectors with 32-node glowing plasma particle trails.
              </p>
            </div>

            <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
              <strong className="text-amber-300">4. Re-Assembly & Return:</strong>
              <p className="text-zinc-400 mt-0.5">
                Proximity sensor detects mouse activity near center docking zone, vector-interpolates the dragon back to host coordinates, and re-expands the glassmorphic window.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950 rounded border border-cyan-900/60 flex flex-col gap-1.5">
              <strong className="text-cyan-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                5. Aerodynamic Newtonian Flight Dynamics Model:
              </strong>
              <p className="text-zinc-400">
                Governs real-time physics vectors during autonomous pattern flight and dock transition maneuvers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mt-1 font-mono text-[10px]">
                <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800">
                  <span className="text-emerald-300 font-bold">Atmospheric Drag (δ):</span>
                  <div className="text-zinc-400 mt-0.5">v_(t+1) = v_t · δ_drag</div>
                  <div className="text-zinc-400 mt-0.5">Controls kinetic decay & airbraking</div>
                </div>
                <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800">
                  <span className="text-cyan-300 font-bold">Cruising Velocity (v):</span>
                  <div className="text-zinc-400 mt-0.5">v_cruise = v_base · v_mult</div>
                  <div className="text-zinc-400 mt-0.5">Governs airspeed & wingbeat timing</div>
                </div>
                <div className="p-1.5 bg-zinc-900 rounded border border-zinc-800">
                  <span className="text-pink-300 font-bold">Steering Torque (α):</span>
                  <div className="text-zinc-400 mt-0.5">θ_(t+1) = θ_t + Δθ · (0.045 + 0.08α)</div>
                  <div className="text-zinc-400 mt-0.5">Regulates banking agility & dock interception</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
