import { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface HolographicPedestalBaseProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  scale?: number;
}

export function HolographicPedestalBase({
  theme,
  audioState,
  scale = 1.0,
}: HolographicPedestalBaseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rot1 = 0;
    let rot2 = 0;

    const render = () => {
      rot1 += 0.008 + audioState.volume * 0.02;
      rot2 -= 0.012 + audioState.volume * 0.02;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.78; // Position at bottom base

      ctx.clearRect(0, 0, w, h);

      const vol = audioState.volume;
      const bass = audioState.bass;
      const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
      const ambientFactor = Math.max(0.2, noiseFloor * 3.0);

      // Primary Pedestal Radius
      const rx = w * 0.38 * scale * (1 + vol * 0.08 + bass * 0.1);
      const ry = h * 0.12 * scale * (1 + vol * 0.08 + bass * 0.1);

      ctx.save();

      // 1. Vertical Holographic Projection Cylinder Beam Upward
      const beamGrad = ctx.createLinearGradient(cx, cy, cx, cy - ry * 3.8);
      beamGrad.addColorStop(0, theme.energy);
      beamGrad.addColorStop(0.4, theme.primary);
      beamGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = 0.12 + vol * 0.25 + ambientFactor * 0.1;
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.9, cy);
      ctx.lineTo(cx - rx * 0.5, cy - ry * 3.5);
      ctx.lineTo(cx + rx * 0.5, cy - ry * 3.5);
      ctx.lineTo(cx + rx * 0.9, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Base Radial Outer Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot1);

      ctx.shadowBlur = 18 + vol * 24;
      ctx.shadowColor = theme.energy;

      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = theme.energy;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Ticks around pedestal outer rim
      const ticks = 32;
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2;
        const tx1 = Math.cos(a) * (rx - 4);
        const ty1 = Math.sin(a) * (ry - 2);
        const tx2 = Math.cos(a) * (rx + 8);
        const ty2 = Math.sin(a) * (ry + 4);

        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.strokeStyle = i % 8 === 0 ? theme.energy : theme.primary;
        ctx.lineWidth = i % 8 === 0 ? 2 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Counter-Rotating Inner Dial Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot2);

      const irx = rx * 0.72;
      const iry = ry * 0.72;

      ctx.beginPath();
      ctx.ellipse(0, 0, irx, iry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = theme.secondary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14, 2, 14]);
      ctx.stroke();

      // Core Singularity Ring
      ctx.beginPath();
      ctx.ellipse(0, 0, irx * 0.45, iry * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme.energy;
      ctx.globalAlpha = 0.25 + vol * 0.4;
      ctx.fill();

      ctx.restore();

      // 4. Concentric Holographic Base Plates
      ctx.save();
      ctx.translate(cx, cy);
      const prx = rx * 1.15;
      const pry = ry * 1.15;

      ctx.beginPath();
      ctx.ellipse(0, 0, prx, pry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([4, 18]);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, audioState, scale]);

  return (
    <canvas
      ref={canvasRef}
      id="holographic-pedestal-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
