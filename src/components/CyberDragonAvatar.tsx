import React, { useState, useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode, StreamConfig, AvatarFlightMode, FlightPatternType, FlightPhysicsConfig } from '../types';
import { InfinityFlowCanvas } from './InfinityFlowCanvas';
import { DragonFaceSvg } from './DragonFaceSvg';
import { EnergyDustCanvas } from './EnergyDustCanvas';
import { ProceduralShieldSvg } from './ProceduralShieldSvg';
import { CyberWingsVisualizer } from './CyberWingsVisualizer';
import { DragonBreath } from './DragonBreath';
import { InfinityFlightDragonCanvas } from './InfinityFlightDragonCanvas';
import { HolographicPedestalBase } from './HolographicPedestalBase';
import { MatrixCodeRainOverlay } from './MatrixCodeRainOverlay';

interface CyberDragonAvatarProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  streamConfig: StreamConfig;
  isInteractive?: boolean;
  flightMode?: AvatarFlightMode;
  flightPattern?: FlightPatternType;
  flightSpeed?: number;
  flightPhysics?: FlightPhysicsConfig;
  onRecall?: () => void;
}

export function CyberDragonAvatar({
  theme,
  audioState,
  expression,
  streamConfig,
  isInteractive = true,
  flightMode = 'docked',
  flightPattern = 'infinity',
  flightSpeed = 1.0,
  flightPhysics,
  onRecall,
}: CyberDragonAvatarProps) {
  const [lookPos, setLookPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isAirborne = flightMode === 'flight';

  // Mouse / gaze tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setLookPos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setLookPos({ x: 0, y: 0 });
  };

  // Trigger brief cyber glitch on sudden roar / volume burst
  useEffect(() => {
    if (streamConfig.glitchBurstOnRoar && audioState.isRoaring) {
      setIsGlitching(true);
      const timer = window.setTimeout(() => setIsGlitching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [audioState.isRoaring, streamConfig.glitchBurstOnRoar]);

  // Subtle breathing idle head-bob
  const [idleBobY, setIdleBobY] = useState(0);
  useEffect(() => {
    let animId: number;
    const updateBob = () => {
      const now = Date.now() * 0.002;
      const bob = Math.sin(now) * 4 + audioState.volume * 8;
      setIdleBobY(bob);
      animId = requestAnimationFrame(updateBob);
    };
    animId = requestAnimationFrame(updateBob);
    return () => cancelAnimationFrame(animId);
  }, [audioState.volume]);

  // Dynamic Scale and Tilt
  const avatarScale = streamConfig.avatarScale || 1.0;
  const flip = streamConfig.flipHorizontal ? 'scale-x-[-1]' : '';

  return (
    <div
      ref={containerRef}
      id="cyber-dragon-avatar-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 select-none ${
        isGlitching ? 'filter invert-[0.08] contrast-125' : ''
      }`}
    >
      {/* ========================================================
          MODE A: AIRBORNE INFINITY FLOW DRAGON FLIGHT
          ======================================================== */}
      {isAirborne ? (
        <div className="absolute inset-0 w-full h-full animate-fadeIn">
          <InfinityFlightDragonCanvas
            theme={theme}
            audioState={audioState}
            expression={expression}
            flightPattern={flightPattern}
            flightSpeed={flightSpeed}
            flightPhysics={flightPhysics}
            onRecall={onRecall}
            interactive={isInteractive}
          />
        </div>
      ) : (
        /* ========================================================
           MODE B: DOCKED GUARDIAN DRAGON (HEAD & ARTICULATED FACE)
           ======================================================== */
        <>
          {/* 1. Infinity Flow Engine Canvas (Behind dragon) */}
          {streamConfig.showInfinityAura && (
            <InfinityFlowCanvas
              theme={theme}
              audioState={audioState}
              expression={expression}
              isGlitching={isGlitching}
              preset={streamConfig.infinityFlowPreset || 'vortex'}
              noiseFloorSensitivity={streamConfig.infinityFlowNoiseFloorSensitivity ?? 1.0}
            />
          )}

          {/* Matrix Binary Code Rain Stream Overlay (Reference video alignment) */}
          {streamConfig.showMatrixCodeRain !== false && (
            <MatrixCodeRainOverlay
              theme={theme}
              audioState={audioState}
            />
          )}

          {/* Holographic Projection Pedestal Base (Reference image alignment) */}
          {streamConfig.showHolographicPedestal !== false && (
            <HolographicPedestalBase
              theme={theme}
              audioState={audioState}
              scale={avatarScale}
            />
          )}

          {/* 2. Floating Data Particles & Ambient Energy Dust Layer */}
          {streamConfig.showEnergyDust !== false && (
            <EnergyDustCanvas
              theme={theme}
              audioState={audioState}
              intensity={streamConfig.energyDustIntensity ?? 1.0}
              density={70}
              interactive={isInteractive}
            />
          )}

          {/* 3. Dragon Head & Articulated Face Layer */}
          <div
            id="dragon-head-wrapper"
            className={`relative z-10 w-full max-w-[620px] aspect-[6/7] flex items-center justify-center transition-transform duration-100 ${flip}`}
            style={{
              transform: `translate(${streamConfig.avatarX + lookPos.x * 12}px, ${
                streamConfig.avatarY + idleBobY + lookPos.y * 8
              }px) scale(${avatarScale * (1 + audioState.volume * 0.04)})`,
            }}
          >
            {/* 3D-CSS Wingbeat Visualizer (Audio Frequency Peak Animated Wings) */}
            {streamConfig.wingbeatVisualizer !== false && (
              <CyberWingsVisualizer
                theme={theme}
                audioState={audioState}
                expression={expression}
                flipHorizontal={streamConfig.flipHorizontal}
              />
            )}

            <DragonFaceSvg
              theme={theme}
              audioState={audioState}
              expression={expression}
              lookX={lookPos.x}
              lookY={lookPos.y}
              showRunes={streamConfig.showRunes}
            />

            {/* Dragon Breath Particle Effect Overlay (Triggers blast when audio intensity exceeds roar threshold) */}
            {streamConfig.showDragonBreath !== false && (
              <DragonBreath
                theme={theme}
                audioState={audioState}
                expression={expression}
                lookX={lookPos.x}
                lookY={lookPos.y}
                enabled={true}
                intensityMultiplier={streamConfig.dragonBreathIntensity ?? 1.0}
              />
            )}

            {/* Procedural SVG Energy Shield (Active on 'shield' expression) */}
            <ProceduralShieldSvg
              theme={theme}
              audioState={audioState}
              isActive={expression === 'shield'}
            />
          </div>

          {/* 4. Ambient Dynamic Color Aura Glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full opacity-30 blur-3xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${theme.energy} 0%, transparent 65%)`,
              transform: `scale(${1 + audioState.volume * 0.8})`,
            }}
          />
        </>
      )}
    </div>
  );
}
