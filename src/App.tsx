import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DragonTheme,
  ExpressionMode,
  AudioConfig,
  StreamConfig,
  AvatarFlightMode,
  FlightPatternType,
  FlightPhysicsConfig,
} from './types';
import { PRESET_THEMES, CHROMA_KEY_COLORS } from './constants/themes';
import { useAudioReactive } from './hooks/useAudioReactive';
import { CyberDragonAvatar } from './components/CyberDragonAvatar';
import { ThemeSelector } from './components/ThemeSelector';
import { AudioSettingsPanel } from './components/AudioSettingsPanel';
import { StreamOverlayHUD } from './components/StreamOverlayHUD';
import { ExpressionController } from './components/ExpressionController';
import { RecordingToolbar } from './components/RecordingToolbar';
import { ObsSetupGuideModal } from './components/ObsSetupGuideModal';
import { JawMechanicsInspector } from './components/JawMechanicsInspector';
import { ElevenLabs432Pipeline } from './components/ElevenLabs432Pipeline';
import { SmartObjectWrapper } from './components/SmartObjectWrapper';
import { CompanionFlightStudio } from './components/CompanionFlightStudio';
import { BlenderExportPanel } from './components/BlenderExportPanel';
import { AmbientSoundscapeEngine } from './components/AmbientSoundscapeEngine';
import {
  Shield,
  Radio,
  Tv,
  Palette,
  Volume2,
  Sparkles,
  Zap,
  Activity,
  Maximize,
  HelpCircle,
  Clock,
  Sliders,
  Code2,
  Waves,
  Layers,
  Compass,
  Box,
} from 'lucide-react';

export default function App() {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<DragonTheme>(PRESET_THEMES[0]);

  // Expression Stance State
  const [manualExpression, setManualExpression] = useState<ExpressionMode>('idle');
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Stream Configuration State
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    overlayMode: 'app',
    chromaType: 'green',
    customChromaHex: '#00FF00',
    showStreamHud: true,
    showAudioMeters: true,
    showChatSim: false,
    showDragonInfo: true,
    showRunes: true,
    showInfinityAura: true,
    streamerName: 'DRAGON GUARDIAN',
    guardianTag: 'INFINITY FLOW // SYNC MK-IX',
    syncRateHz: 60,
    avatarScale: 1.0,
    avatarX: 0,
    avatarY: 0,
    flipHorizontal: false,
    webcamActive: false,
    glitchBurstOnRoar: true,
    showEnergyDust: true,
    energyDustIntensity: 1.0,
    autoHideControls: false,
    autoHideDurationSec: 5,
    wingbeatVisualizer: true,
    showDragonBreath: true,
    dragonBreathIntensity: 1.0,
    infinityFlowPreset: 'vortex',
    infinityFlowNoiseFloorSensitivity: 1.0,
    showHolographicPedestal: true,
    showMatrixCodeRain: true,
  });

  // Audio Config State
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    gain: 1.8,
    noiseGate: 0.08,
    smoothing: 0.75,
    jawMultiplier: 1.4,
    roarThreshold: 0.75,
    beamEnabled: true,
    frequencyReactivity: 1.2,
    selectedDeviceId: '',
    ambientSoundscapeEnabled: false,
    ambientSoundscapeVolume: 0.18,
  });

  // UI Navigation Tabs (for studio sidebar)
  const [activeTab, setActiveTab] = useState<'companion' | 'blender' | 'pipeline432' | 'jaw' | 'smartobject' | 'audio' | 'themes' | 'stream'>('blender');
  const [isObsGuideOpen, setIsObsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Avatar Autonomous Flight State ('docked' | 'cocoon' | 'flight' | 'reassembling')
  const [flightMode, setFlightMode] = useState<AvatarFlightMode>('docked');
  const [flightPattern, setFlightPattern] = useState<FlightPatternType>('infinity');
  const [flightSpeed, setFlightSpeed] = useState<number>(1.0);
  const [flightPhysics, setFlightPhysics] = useState<FlightPhysicsConfig>({
    velocity: 1.0,
    acceleration: 1.0,
    drag: 0.92,
  });

  // Web Audio hook
  const {
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
  } = useAudioReactive(audioConfig);

  // Compute active expression based on audio & manual overrides
  const effectiveExpression: ExpressionMode = spaceHeld
    ? 'roar'
    : audioState.isRoaring
    ? 'roar'
    : audioState.isSpeaking && manualExpression === 'idle'
    ? 'talk'
    : manualExpression;

  // Partial config update helpers
  const handleUpdateAudioConfig = (newCfg: Partial<AudioConfig>) => {
    setAudioConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const handleUpdateStreamConfig = (newCfg: Partial<StreamConfig>) => {
    setStreamConfig((prev) => ({ ...prev, ...newCfg }));
  };

  // 54-Minute Dragon9 Chrono clock simulation
  const [chronoTime, setChronoTime] = useState({ minute: 0, second: 0, cycle: 'D9-SOLAR' });
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const totalSec = d.getMinutes() * 60 + d.getSeconds();
      const d9Sec = totalSec % (54 * 60);
      const min = Math.floor(d9Sec / 60);
      const sec = d9Sec % 60;
      setChronoTime({
        minute: min,
        second: sec,
        cycle: `D9-CYCLE ${(d.getHours() % 9) + 1}`,
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Inactivity Auto-Hide Engine (Forces clean view after inactivity period until mouse movement)
  const [isInactiveHidden, setIsInactiveHidden] = useState(false);

  useEffect(() => {
    if (!streamConfig.autoHideControls) {
      setIsInactiveHidden(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;
    const durationMs = Math.max(1000, (streamConfig.autoHideDurationSec ?? 5) * 1000);

    const resetInactivity = () => {
      setIsInactiveHidden(false);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsInactiveHidden(true);
      }, durationMs);
    };

    const handleMouseLeave = () => {
      // Accelerate or trigger auto-hide when mouse leaves browser viewport
      if (streamConfig.autoHideControls) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setIsInactiveHidden(true);
        }, 600);
      }
    };

    // Initial timer
    timer = setTimeout(() => {
      setIsInactiveHidden(true);
    }, durationMs);

    window.addEventListener('mousemove', resetInactivity, { passive: true });
    window.addEventListener('mousedown', resetInactivity, { passive: true });
    window.addEventListener('touchstart', resetInactivity, { passive: true });
    window.addEventListener('keydown', resetInactivity, { passive: true });
    window.addEventListener('pointermove', resetInactivity, { passive: true });
    window.addEventListener('mouseenter', resetInactivity, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('mousedown', resetInactivity);
      window.removeEventListener('touchstart', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
      window.removeEventListener('pointermove', resetInactivity);
      window.removeEventListener('mouseenter', resetInactivity);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [streamConfig.autoHideControls, streamConfig.autoHideDurationSec]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        setStreamConfig((prev) => ({
          ...prev,
          overlayMode: prev.overlayMode === 'clean' ? 'app' : 'clean',
        }));
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        setManualExpression((prev) => (prev === 'shield' ? 'idle' : 'shield'));
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        setFlightMode((prev) => (prev === 'flight' ? 'docked' : 'flight'));
      } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
      } else if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key) - 1;
        if (PRESET_THEMES[idx]) {
          setCurrentTheme(PRESET_THEMES[idx]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Take high-res transparent snapshot of the dragon avatar
  const handleTakeSnapshot = useCallback(() => {
    const svgEl = document.getElementById('cyber-dragon-svg-avatar');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = window.URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, 1200, 1400);
      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = `cyber-dragon-${currentTheme.id}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  }, [currentTheme.id]);

  // Background style based on overlay mode
  const getBackgroundStyle = () => {
    if (streamConfig.overlayMode === 'chroma') {
      return {
        backgroundColor:
          streamConfig.chromaType === 'custom'
            ? streamConfig.customChromaHex
            : CHROMA_KEY_COLORS[streamConfig.chromaType],
      };
    }
    if (streamConfig.overlayMode === 'transparent') {
      return { backgroundColor: 'transparent' };
    }
    return {};
  };

  const isClean = streamConfig.overlayMode === 'clean' || streamConfig.overlayMode === 'transparent' || streamConfig.overlayMode === 'chroma';

  return (
    <div
      id="cyber-dragon-app-root"
      style={getBackgroundStyle()}
      className={`min-h-screen w-full flex flex-col relative overflow-hidden font-sans ${
        streamConfig.overlayMode === 'app'
          ? 'bg-zinc-950 text-zinc-100 cyber-grid-bg cyber-scanlines'
          : ''
      }`}
    >
      {/* ========================================================
          TOP HEADER / BROADCAST STATUS BAR
          ======================================================== */}
      {streamConfig.overlayMode === 'app' && (
        <header
          className={`relative z-30 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between transition-all duration-500 ease-in-out ${
            isInactiveHidden
              ? '-translate-y-full opacity-0 pointer-events-none absolute top-0 left-0 right-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Brand & Dragon Guardian Identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border font-bold font-orbitron text-xs shadow-lg"
              style={{
                backgroundColor: `${currentTheme.primary}20`,
                borderColor: currentTheme.primary,
                color: currentTheme.energy,
              }}
            >
              龍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-zinc-100">
                  CYBER DRAGON
                </h1>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentTheme.primary}25`,
                    color: currentTheme.accent,
                    border: `1px solid ${currentTheme.primary}50`,
                  }}
                >
                  {currentTheme.badge}
                </span>
              </div>
              <p className="text-[11px] font-rajdhani text-zinc-400 hidden sm:block">
                Voice Reactive Guardian Avatar // Infinity Flow Engine
              </p>
            </div>
          </div>

          {/* Center: Live Dragon9 Chronometer, 432Hz Status & Audio State */}
          <div className="hidden md:flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{chronoTime.cycle}:</span>
              <span className="text-cyan-300 font-bold">
                {String(chronoTime.minute).padStart(2, '0')}:{String(chronoTime.second).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500">/54m</span>
            </div>

            <div className="h-3 w-px bg-zinc-700" />

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-[11px] text-amber-300">
              <Waves className="w-3 h-3 text-amber-400" />
              <span className="font-bold">432Hz SYNC</span>
            </div>

            <div className="h-3 w-px bg-zinc-700" />

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  audioState.isListening
                    ? audioState.isSpeaking
                      ? 'bg-cyan-400 animate-ping'
                      : 'bg-emerald-400'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-[11px] text-zinc-400 font-rajdhani uppercase font-semibold">
                {audioState.isListening
                  ? audioState.isRoaring
                    ? 'PLASMA ROAR'
                    : audioState.isSpeaking
                    ? 'VOICE SYNC (432Hz)'
                    : 'LISTENING'
                  : 'MIC STANDBY'}
              </span>
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsObsGuideOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 hover:border-cyan-500/50 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>OBS Studio</span>
            </button>

            <RecordingToolbar
              isFullscreen={isFullscreen}
              isCleanMode={false}
              onToggleFullscreen={toggleFullscreen}
              onToggleCleanMode={() =>
                setStreamConfig((prev) => ({ ...prev, overlayMode: 'clean' }))
              }
              onTakeSnapshot={handleTakeSnapshot}
            />
          </div>
        </header>
      )}

      {/* ========================================================
          MAIN VIEWPORT: DUAL COLUMN (AVATAR STAGE + STUDIO CONTROLS)
          ======================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full overflow-hidden">
        {/* LEFT / CENTER: THE CYBER DRAGON AVATAR STAGE */}
        <main
          className={`flex-1 relative flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden ${
            streamConfig.overlayMode === 'chroma' ? '' : 'bg-transparent'
          }`}
        >
          {/* Headless Background Generative Audio Soundscape with Voice Auto-Ducking */}
          <AmbientSoundscapeEngine config={audioConfig} audioState={audioState} />
          {/* Floating Streamer HUD Badge (Top Left of Stage) */}
          {streamConfig.showStreamHud && (
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-1 pointer-events-none select-none">
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-md border text-xs font-orbitron font-bold"
                style={{
                  backgroundColor: 'rgba(9, 9, 11, 0.75)',
                  borderColor: `${currentTheme.primary}60`,
                  color: currentTheme.energy,
                  boxShadow: `0 0 16px ${currentTheme.primary}25`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: currentTheme.energy }}
                />
                <span>{streamConfig.streamerName}</span>
                <span className="text-[9px] font-mono text-zinc-400 font-normal">
                  [{currentTheme.badge}]
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pl-1">
                {currentTheme.tagline}
              </div>
            </div>
          )}

          {/* Floating Audio VU Meter HUD (Bottom Left of Stage) */}
          {streamConfig.showAudioMeters && (
            <div
              className={`absolute bottom-4 left-4 z-30 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-2.5 rounded-xl flex items-center gap-3 pointer-events-auto transition-all duration-500 ease-in-out ${
                isInactiveHidden
                  ? 'opacity-0 translate-y-8 pointer-events-none'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Volume2
                  className="w-4 h-4"
                  style={{ color: audioState.isSpeaking ? currentTheme.energy : '#71717a' }}
                />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-zinc-400">AUDIO INPUT</span>
                  <span className="text-[11px] font-mono font-bold text-zinc-200">
                    {Math.round(audioState.volume * 100)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Mini EQ Bars */}
              <div className="flex items-end gap-1 h-6 w-16 bg-zinc-900 rounded p-1">
                {audioState.frequencyData.slice(0, 6).map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-sm transition-all duration-75"
                    style={{
                      height: `${Math.max(15, val * 100)}%`,
                      backgroundColor: audioState.isRoaring
                        ? '#f43f5e'
                        : audioState.isSpeaking
                        ? currentTheme.energy
                        : '#52525b',
                    }}
                  />
                ))}
              </div>

              {/* Push to talk indicator / button */}
              <button
                onMouseDown={() => setSpaceHeld(true)}
                onMouseUp={() => setSpaceHeld(false)}
                onTouchStart={() => setSpaceHeld(true)}
                onTouchEnd={() => setSpaceHeld(false)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  spaceHeld
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                    : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750'
                }`}
                title="Hold Space or Click to Roar"
              >
                {spaceHeld ? 'ROARING' : 'HOLD ROAR'}
              </button>
            </div>
          )}

          {/* Floating Stance / Expression Pill (Bottom Center of Stage) */}
          <div
            className={`absolute bottom-4 z-30 hidden sm:flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 p-1.5 rounded-full shadow-2xl transition-all duration-500 ease-in-out ${
              isInactiveHidden
                ? 'opacity-0 translate-y-8 pointer-events-none'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {(['idle', 'talk', 'roar', 'shield', 'alert', 'hypersync'] as ExpressionMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setManualExpression(mode)}
                className={`px-3 py-1 rounded-full text-xs font-rajdhani font-bold transition-all cursor-pointer uppercase ${
                  effectiveExpression === mode
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {mode}
              </button>
            ))}

            <div className="w-px h-4 bg-zinc-800 mx-0.5" />

            {/* Flight Mode Toggle: Morph into Infinity Flow Flying Dragon */}
            <button
              onClick={() => setFlightMode((prev) => (prev === 'flight' ? 'docked' : 'flight'))}
              className={`px-3 py-1 rounded-full text-xs font-rajdhani font-bold transition-all cursor-pointer uppercase flex items-center gap-1.5 ${
                flightMode === 'flight'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 shadow-md shadow-emerald-500/40 ring-1 ring-emerald-300'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-950/50 border border-amber-500/40'
              }`}
              title="Transform into Infinity Flow Flying Dragon (Hotkey: P)"
            >
              <Compass className={`w-3.5 h-3.5 ${flightMode === 'flight' ? 'animate-spin text-zinc-950' : 'text-amber-400'}`} />
              <span>{flightMode === 'flight' ? 'AIRBORNE' : 'PATROL FLIGHT'}</span>
            </button>
          </div>

          {/* Clean Overlay Inactivity Indicator */}
          {isInactiveHidden && streamConfig.autoHideControls && (
            <div className="absolute top-4 right-4 z-40 px-3 py-1.5 rounded-full bg-zinc-950/70 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-2 pointer-events-none shadow-lg animate-pulse">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CLEAN OVERLAY ACTIVE // MOVE MOUSE TO REVEAL</span>
            </div>
          )}

          {/* Floating Clean Mode Exit Button (Top Right when in clean/chroma view) */}
          {isClean && (
            <div className="absolute top-4 right-4 z-40">
              <RecordingToolbar
                isFullscreen={isFullscreen}
                isCleanMode={true}
                onToggleFullscreen={toggleFullscreen}
                onToggleCleanMode={() =>
                  setStreamConfig((prev) => ({ ...prev, overlayMode: 'app' }))
                }
                onTakeSnapshot={handleTakeSnapshot}
              />
            </div>
          )}

          {/* 3. The Core Cyber Dragon Avatar Component */}
          <CyberDragonAvatar
            theme={currentTheme}
            audioState={audioState}
            expression={effectiveExpression}
            streamConfig={streamConfig}
            isInteractive={true}
            flightMode={flightMode}
            flightPattern={flightPattern}
            flightSpeed={flightSpeed}
            flightPhysics={flightPhysics}
            onRecall={() => setFlightMode('docked')}
          />
        </main>

        {/* RIGHT: STUDIO CONTROL PANEL (Only visible in 'app' mode) */}
        {streamConfig.overlayMode === 'app' && (
          <aside
            id="cyber-dragon-studio-sidebar"
            className={`border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex flex-col max-h-[50vh] lg:max-h-full overflow-hidden transition-all duration-500 ease-in-out ${
              isInactiveHidden
                ? 'w-0 lg:w-0 opacity-0 pointer-events-none border-transparent max-h-0'
                : 'w-full lg:w-[420px] xl:w-[460px] opacity-100 max-h-[50vh] lg:max-h-full'
            }`}
          >
            {/* Tab Navigation */}
            <div className="grid grid-cols-4 gap-1 border-b border-zinc-800 bg-zinc-900/70 p-1.5">
              <button
                onClick={() => setActiveTab('blender')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'blender'
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-600 shadow-sm shadow-amber-900/30'
                    : 'text-zinc-400 hover:text-amber-200'
                }`}
                title="Export to Blender (3D Rig, Materials & Keyframes)"
              >
                <Box className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Blender 3D</span>
              </button>

              <button
                onClick={() => setActiveTab('companion')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'companion'
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Companion</span>
              </button>

              <button
                onClick={() => setActiveTab('pipeline432')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'pipeline432'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">432Hz</span>
              </button>

              <button
                onClick={() => setActiveTab('jaw')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'jaw'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Jaw Sync</span>
              </button>

              <button
                onClick={() => setActiveTab('smartobject')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'smartobject'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Smart Obj</span>
              </button>

              <button
                onClick={() => setActiveTab('themes')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'themes'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Themes</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'audio'
                    ? 'bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Mic / VU</span>
              </button>

              <button
                onClick={() => setActiveTab('stream')}
                className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-rajdhani font-bold tracking-wider transition-all cursor-pointer uppercase ${
                  activeTab === 'stream'
                    ? 'bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Stream / OBS</span>
              </button>
            </div>

            {/* Scrollable Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
              {/* Guardian Expression Stances (Always visible at top of sidebar) */}
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <ExpressionController
                  currentExpression={manualExpression}
                  onSetExpression={setManualExpression}
                  theme={currentTheme}
                  isRoaring={audioState.isRoaring || spaceHeld}
                />
              </div>

              {/* Tab: Export to Blender (3D Rig, Materials & Keyframes) */}
              {activeTab === 'blender' && (
                <BlenderExportPanel
                  theme={currentTheme}
                  audioState={audioState}
                  expression={effectiveExpression}
                  audioConfig={audioConfig}
                  streamConfig={streamConfig}
                />
              )}

              {/* Tab: Companion & Patrol Flight Studio */}
              {activeTab === 'companion' && (
                <CompanionFlightStudio
                  theme={currentTheme}
                  audioState={audioState}
                  flightMode={flightMode}
                  onFlightModeChange={setFlightMode}
                  flightPattern={flightPattern}
                  onFlightPatternChange={setFlightPattern}
                  flightSpeed={flightSpeed}
                  onFlightSpeedChange={setFlightSpeed}
                  flightPhysics={flightPhysics}
                  onFlightPhysicsChange={setFlightPhysics}
                />
              )}

              {/* Tab: ElevenLabs & 432Hz Pipeline */}
              {activeTab === 'pipeline432' && (
                <ElevenLabs432Pipeline
                  theme={currentTheme}
                  audioState={audioState}
                />
              )}

              {/* Tab: Audio-Reactive Jaw Mechanics Snippet & Inspector */}
              {activeTab === 'jaw' && (
                <JawMechanicsInspector
                  theme={currentTheme}
                  audioState={audioState}
                  onUpdateJawMultiplier={(val) => handleUpdateAudioConfig({ jawMultiplier: val })}
                />
              )}

              {/* Tab: Smart Object Web Component Wrapper */}
              {activeTab === 'smartobject' && (
                <SmartObjectWrapper
                  theme={currentTheme}
                  audioState={audioState}
                />
              )}

              {/* Tab: Themes & Chroma Customizer */}
              {activeTab === 'themes' && (
                <ThemeSelector
                  currentTheme={currentTheme}
                  onSelectTheme={setCurrentTheme}
                  onCustomThemeUpdate={setCurrentTheme}
                />
              )}

              {/* Tab: Web Audio API Reactivity & Device Settings */}
              {activeTab === 'audio' && (
                <AudioSettingsPanel
                  config={audioConfig}
                  audioState={audioState}
                  devices={devices}
                  permissionError={permissionError}
                  isTestAudioPlaying={isTestAudioPlaying}
                  testAudioMode={testAudioMode}
                  onUpdateConfig={handleUpdateAudioConfig}
                  onStartListening={startListening}
                  onStopListening={stopListening}
                  onPlayTestAudio={playTestAudio}
                  onStopTestAudio={stopTestAudio}
                  onRefreshDevices={refreshDevices}
                />
              )}

              {/* Tab: OBS Broadcast & Overlay Controls */}
              {activeTab === 'stream' && (
                <StreamOverlayHUD
                  streamConfig={streamConfig}
                  theme={currentTheme}
                  audioState={audioState}
                  onUpdateStreamConfig={handleUpdateStreamConfig}
                  onOpenObsGuide={() => setIsObsGuideOpen(true)}
                />
              )}
            </div>

            {/* Bottom Quick Status Bar in Sidebar */}
            <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>STATUS:</span>
                <span className="text-zinc-200 font-bold">
                  {audioState.isListening ? 'VOICE SYNC ON' : 'STANDBY'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">PRESS 'H' FOR CLEAN VIEW</span>
            </div>
          </aside>
        )}
      </div>

      {/* ========================================================
          OBS STUDIO / STREAMLABS SETUP GUIDE MODAL
          ======================================================== */}
      <ObsSetupGuideModal
        isOpen={isObsGuideOpen}
        onClose={() => setIsObsGuideOpen(false)}
      />
    </div>
  );
}
