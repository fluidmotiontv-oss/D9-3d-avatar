import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode } from '../types';

export interface DragonBreathProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  lookX?: number;
  lookY?: number;
  enabled?: boolean;
  intensityMultiplier?: number;
  roarThreshold?: number;
}

interface BreathParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'flame' | 'ember' | 'plasma' | 'smoke';
  rotation: number;
  rotSpeed: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  lineWidth: number;
}

const NOSTRIL_LEFT = { x: 285, y: 325 };
const NOSTRIL_RIGHT = { x: 315, y: 325 };

export const DragonBreath: React.FC<DragonBreathProps> = ({
  theme,
  audioState,
  expression,
  lookX = 0,
  lookY = 0,
  enabled = true,
  intensityMultiplier = 1.0,
  roarThreshold = 0.55,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<BreathParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Sync latest props into stabilized refs
  const audioStateRef = useRef(audioState);
  audioStateRef.current = audioState;

  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const lookRef = useRef({ lookX, lookY });
  lookRef.current = { lookX, lookY };

  const intensityRef = useRef(intensityMultiplier);
  intensityRef.current = intensityMultiplier;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const roarThresholdRef = useRef(roarThreshold);
  roarThresholdRef.current = roarThreshold;

  // Audio dynamics smoothing
  const dynamicsRef = useRef({
    volume: 0,
    bass: 0,
    spawnPool: 0,
    shockwaveTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Handle high-DPI scaling for crisp 600x700 render stage
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const baseWidth = 600;
      const baseHeight = 700;
      const targetWidth = baseWidth * dpr;
      const targetHeight = baseHeight * dpr;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, baseWidth, baseHeight);

      // Extract current state
      const currentAudio = audioStateRef.current;
      const currentExpr = expressionRef.current;
      const currentTheme = themeRef.current;
      const { lookX: curLookX, lookY: curLookY } = lookRef.current;
      const currentIntensity = intensityRef.current;
      const isEnabled = enabledRef.current;
      const currentRoarThresh = roarThresholdRef.current;

      if (!isEnabled) {
        particlesRef.current = [];
        shockwavesRef.current = [];
        ctx.restore();
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Audio smoothers
      const targetVol = Math.max(0, currentAudio.volume || 0);
      const targetBass = Math.max(0, currentAudio.bass || 0);
      const dyn = dynamicsRef.current;
      dyn.volume += (targetVol - dyn.volume) * 0.3;
      dyn.bass += (targetBass - dyn.bass) * 0.25;

      // Determine if audio intensity exceeds roar threshold or roar expression is active
      const isRoaring =
        currentAudio.isRoaring ||
        currentExpr === 'roar' ||
        targetVol >= currentRoarThresh ||
        (currentAudio.beamIntensity || 0) > 0.15;

      // Color scheme using theme energy color
      const energyColor = currentTheme.energy || '#06b6d4';
      const primaryColor = currentTheme.primary || '#3b82f6';
      const accentColor = currentTheme.accent || '#a855f7';

      // -------------------------------------------------------------
      // 1. ROAR THRESHOLD EXCEEDED: HIGH-ENERGY DRAGON BREATH BLAST
      // -------------------------------------------------------------
      if (isRoaring) {
        const mouthX = 300 + curLookX * 4;
        const mouthY = 365 + curLookY * 3 + (currentAudio.jawOpen || 0) * 16;
        const roarPower = Math.min(2.5, 0.8 + (targetVol / Math.max(0.1, currentRoarThresh)) * 1.2 + (currentAudio.beamIntensity || 0) * 1.5) * currentIntensity;

        // Spawn plasma flame particles & embers
        const spawnCount = Math.min(90, Math.floor(12 + roarPower * 35));
        dyn.spawnPool += spawnCount * dt * 60;

        while (dyn.spawnPool >= 1 && particlesRef.current.length < 250) {
          dyn.spawnPool -= 1;

          const isEmber = Math.random() < 0.35;
          const isPlasma = Math.random() < 0.25;

          const angle = (Math.random() - 0.5) * (Math.PI * 0.55); // Downward cone spread
          const speed = (isEmber ? 4.5 : 2.5) + Math.random() * 5.0 + roarPower * 3.5;
          const vx = Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5;
          const vy = Math.cos(angle) * speed + 1.5;

          const initialRadius = isEmber ? 1.5 + Math.random() * 2 : 4 + Math.random() * 6;
          const maxRadius = isEmber ? initialRadius * 1.5 : (22 + Math.random() * 28) * (0.8 + roarPower * 0.4);

          let particleColor = energyColor;
          if (isPlasma) particleColor = '#ffffff';
          else if (Math.random() < 0.3) particleColor = primaryColor;
          else if (Math.random() < 0.2) particleColor = accentColor;

          particlesRef.current.push({
            x: mouthX + (Math.random() - 0.5) * 12,
            y: mouthY + (Math.random() - 0.5) * 8,
            vx,
            vy,
            radius: initialRadius,
            maxRadius,
            alpha: 0,
            maxAlpha: isPlasma ? 0.95 : Math.min(0.85, 0.4 + roarPower * 0.3),
            life: 0,
            maxLife: 0.6 + Math.random() * 0.7 + roarPower * 0.3,
            color: particleColor,
            type: isEmber ? 'ember' : isPlasma ? 'plasma' : 'flame',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 3,
          });
        }

        // Spawn expanding shockwave blast rings
        dyn.shockwaveTimer += dt;
        if (dyn.shockwaveTimer > 0.12 && shockwavesRef.current.length < 8) {
          dyn.shockwaveTimer = 0;
          shockwavesRef.current.push({
            x: mouthX,
            y: mouthY,
            radius: 8,
            maxRadius: 140 + roarPower * 50,
            alpha: 0.8,
            lineWidth: 3 + roarPower * 2,
          });
        }
      } else if (currentExpr === 'idle' || currentExpr === 'talk') {
        // -------------------------------------------------------------
        // 2. AMBIENT NOSTRIL BREATH / VAPOR (BELOW ROAR THRESHOLD)
        // -------------------------------------------------------------
        const effectiveIntensity = (currentExpr === 'talk' ? 0.2 + dyn.volume * 2.5 : 0.15 + dyn.volume * 1.2) * currentIntensity;

        if (effectiveIntensity > 0.05) {
          const spawnRate = Math.min(45, 4 + effectiveIntensity * 30);
          dyn.spawnPool += spawnRate * dt;

          const leftX = NOSTRIL_LEFT.x + curLookX * 4;
          const leftY = NOSTRIL_LEFT.y + curLookY * 3;
          const rightX = NOSTRIL_RIGHT.x + curLookX * 4;
          const rightY = NOSTRIL_RIGHT.y + curLookY * 3;

          while (dyn.spawnPool >= 1 && particlesRef.current.length < 120) {
            dyn.spawnPool -= 1;
            const isLeft = Math.random() < 0.5;
            const originX = isLeft ? leftX : rightX;
            const originY = isLeft ? leftY : rightY;

            const lateralDir = isLeft ? -1 : 1;
            const vx = lateralDir * (0.3 + Math.random() * 0.7) + (Math.random() - 0.5) * 0.2;
            const vy = 0.8 + Math.random() * 1.2 + effectiveIntensity * 1.2;

            const initialRadius = 3 + Math.random() * 2.5;
            const maxRadius = (16 + Math.random() * 18 + effectiveIntensity * 12);

            particlesRef.current.push({
              x: originX,
              y: originY,
              vx,
              vy,
              radius: initialRadius,
              maxRadius,
              alpha: 0,
              maxAlpha: Math.min(0.45, 0.15 + effectiveIntensity * 0.2),
              life: 0,
              maxLife: 1.0 + Math.random() * 0.7,
              color: energyColor,
              type: 'smoke',
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 1.0,
            });
          }
        }
      }

      // -------------------------------------------------------------
      // 3. DRAW SHOCKWAVE BLAST RINGS
      // -------------------------------------------------------------
      const activeShockwaves: ShockwaveRing[] = [];
      for (let i = 0; i < shockwavesRef.current.length; i++) {
        const sw = shockwavesRef.current[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 2;
        sw.alpha *= 0.91;

        if (sw.alpha > 0.01 && sw.radius < sw.maxRadius) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = energyColor;
          ctx.lineWidth = sw.lineWidth * (sw.alpha);
          ctx.globalAlpha = sw.alpha;
          ctx.shadowBlur = 16;
          ctx.shadowColor = energyColor;
          ctx.stroke();
          ctx.restore();

          activeShockwaves.push(sw);
        }
      }
      shockwavesRef.current = activeShockwaves;

      // -------------------------------------------------------------
      // 4. DRAW AND UPDATE PARTICLES
      // -------------------------------------------------------------
      const activeParticles: BreathParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life += dt;

        if (p.life >= p.maxLife) continue;

        const progress = p.life / p.maxLife;

        // Alpha envelope
        if (progress < 0.15) {
          p.alpha = p.maxAlpha * (progress / 0.15);
        } else {
          p.alpha = p.maxAlpha * Math.pow(1 - (progress - 0.15) / 0.85, 1.2);
        }

        // Radius growth
        p.radius += (p.maxRadius - p.radius) * (dt * 3.5);

        // Movement & Physics
        p.x += p.vx * (60 * dt);
        p.y += p.vy * (60 * dt);
        p.rotation += p.rotSpeed * dt;

        p.vx *= 0.96;
        p.vy *= 0.98;

        if (p.alpha > 0.005) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.type === 'ember') {
            // High-energy glowing spark ember
            ctx.shadowBlur = 12;
            ctx.shadowColor = energyColor;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Diamond spark shine
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, -p.radius * 1.5);
            ctx.lineTo(p.radius * 0.5, 0);
            ctx.lineTo(0, p.radius * 1.5);
            ctx.lineTo(-p.radius * 0.5, 0);
            ctx.closePath();
            ctx.fill();
          } else if (p.type === 'plasma') {
            // Bright intense core plasma bolt
            ctx.shadowBlur = 18;
            ctx.shadowColor = energyColor;
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = energyColor;
            ctx.globalAlpha = p.alpha * 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Energy flame / smoke plume gradient
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
            grad.addColorStop(0, p.color);
            grad.addColorStop(0.4, energyColor);
            grad.addColorStop(1, 'transparent');

            ctx.shadowBlur = p.type === 'flame' ? 14 : 4;
            ctx.shadowColor = energyColor;
            ctx.fillStyle = grad;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        activeParticles.push(p);
      }

      particlesRef.current = activeParticles;
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="dragon-breath-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible select-none"
      style={{
        transform: 'translateZ(25px)',
      }}
    />
  );
};
