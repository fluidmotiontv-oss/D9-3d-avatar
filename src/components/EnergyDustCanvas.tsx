import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface EnergyDustCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  intensity?: number;
  density?: number;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  type: 'dust' | 'glyph' | 'mote' | 'spark';
  glyphText?: string;
  phase: number;
  orbitDist: number;
  orbitSpeed: number;
  orbitAngle: number;
  zDepth: number; // 0.3 (background) to 1.5 (foreground)
}

const GLYPH_SET = ['0', '1', '432', 'Δ', '9', '⟡', '✦', '::', '◈', 'λ', 'φ', '≈'];

export const EnergyDustCanvas: React.FC<EnergyDustCanvasProps> = ({
  theme,
  audioState,
  intensity = 1.0,
  density = 65,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const animFrameRef = useRef<number | null>(null);

  // Audio reactive smoothed values
  const smoothedAudioRef = useRef({
    volume: 0,
    noiseFloor: 0.02,
    pulseEnergy: 0,
    treblePulse: 0,
  });

  // Track mouse
  useEffect(() => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  // Initialize Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 700;
    const count = Math.floor(density * intensity);
    const newParticles: Particle[] = [];

    const palette = [
      theme.energy,
      theme.primary,
      theme.accent,
      theme.eyeGlow,
      '#ffffff',
    ];

    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      let type: Particle['type'] = 'dust';
      let glyphText: string | undefined = undefined;

      if (typeRand < 0.55) {
        type = 'dust';
      } else if (typeRand < 0.78) {
        type = 'mote';
      } else if (typeRand < 0.92) {
        type = 'glyph';
        glyphText = GLYPH_SET[Math.floor(Math.random() * GLYPH_SET.length)];
      } else {
        type = 'spark';
      }

      const zDepth = 0.4 + Math.random() * 0.9;
      const baseRadius = type === 'glyph' ? 9 * zDepth : type === 'spark' ? 2.5 * zDepth : (1 + Math.random() * 2.8) * zDepth;
      const baseAlpha = 0.2 + Math.random() * 0.55;

      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * (Math.min(width, height) * 0.48);

      newParticles.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4 * zDepth,
        vy: -0.2 - Math.random() * 0.5 * zDepth, // subtle upward drift like ember dust
        baseRadius,
        radius: baseRadius,
        alpha: baseAlpha,
        baseAlpha,
        color: palette[Math.floor(Math.random() * palette.length)],
        type,
        glyphText,
        phase: Math.random() * Math.PI * 2,
        orbitDist: dist,
        orbitSpeed: (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: angle,
        zDepth,
      });
    }

    particlesRef.current = newParticles;
  }, [theme, density, intensity]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;

      // Handle DPI and sizing
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Smooth audio dynamics
      const targetVol = audioState.volume || 0;
      const rawVol = audioState.rawVolume || 0;
      const treble = audioState.treble || 0;
      const isSpeaking = audioState.isSpeaking;

      // Track ambient noise floor (continuous subtle alive pulse even at rest)
      const ambientNoise = Math.max(0.06, rawVol * 1.8 + Math.sin(time * 1.5) * 0.03 + 0.04);
      
      const s = smoothedAudioRef.current;
      s.volume += (targetVol - s.volume) * 0.2;
      s.pulseEnergy += (ambientNoise - s.pulseEnergy) * 0.15;
      s.treblePulse += (treble - s.treblePulse) * 0.3;

      const centerX = displayWidth / 2;
      const centerY = displayHeight / 2;

      // Subtle ambient chromatic aura ring synced with noise floor
      const ringRadius = 140 + s.pulseEnergy * 60 + Math.sin(time * 0.8) * 10;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = theme.energy;
      ctx.globalAlpha = 0.04 + s.pulseEnergy * 0.08;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.restore();

      // Particles layer
      ctx.globalCompositeOperation = 'screen';

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Harmonic 432Hz orbital physics
        p.orbitAngle += p.orbitSpeed * (1 + s.pulseEnergy * 2.2);
        p.phase += 0.03 + s.pulseEnergy * 0.05;

        // Drift motion
        p.x += p.vx + Math.cos(p.phase) * 0.3;
        p.y += p.vy + Math.sin(p.phase * 0.7) * 0.25;

        // Centripetal magnetic pull towards dragon core
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const distToCenter = Math.hypot(dx, dy);

        // Keep within bounds
        if (p.x < -40 || p.x > displayWidth + 40 || p.y < -40 || p.y > displayHeight + 40) {
          p.x = centerX + (Math.random() - 0.5) * 120;
          p.y = displayHeight + 20;
          p.orbitDist = 80 + Math.random() * 200;
        }

        // Mouse interactive soft repulsion / attraction
        if (mousePosRef.current.active) {
          const mdx = mousePosRef.current.x - p.x;
          const mdy = mousePosRef.current.y - p.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < 120 && mdist > 0) {
            const force = (1 - mdist / 120) * 1.5;
            p.x -= (mdx / mdist) * force;
            p.y -= (mdy / mdist) * force;
          }
        }

        // Noise floor pulse modulation
        const pulseMod = Math.sin(p.phase + time * 2) * 0.25;
        const audioBoost = s.pulseEnergy * 1.4 + (isSpeaking ? s.volume * 0.8 : 0);
        
        p.alpha = Math.min(1.0, Math.max(0.08, (p.baseAlpha + pulseMod + audioBoost * 0.6) * p.zDepth));
        p.radius = p.baseRadius * (1 + audioBoost * 0.8 + Math.sin(p.phase) * 0.2);

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'glyph' && p.glyphText) {
          // Digital Glyphs / Binary Dust
          ctx.font = `${Math.round(p.radius * 1.6)}px "Courier New", monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = (4 + audioBoost * 8) * p.zDepth;
          ctx.fillText(p.glyphText, p.x, p.y);
        } else if (p.type === 'spark') {
          // Cross Sparkle Flares
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2 * p.zDepth;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          
          const sparkSize = p.radius * 2.2;
          ctx.beginPath();
          ctx.moveTo(p.x - sparkSize, p.y);
          ctx.lineTo(p.x + sparkSize, p.y);
          ctx.moveTo(p.x, p.y - sparkSize);
          ctx.lineTo(p.x, p.y + sparkSize);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'mote') {
          // Soft Luminous Bokeh Dust Orb
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.3, p.color);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard Crisp Energy Dust Dot
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = (3 + s.pulseEnergy * 6) * p.zDepth;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, audioState]);

  return (
    <canvas
      ref={canvasRef}
      id="dragon-energy-dust-layer"
      className="absolute inset-0 w-full h-full pointer-events-none z-[12]"
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
};
