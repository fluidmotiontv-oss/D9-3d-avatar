import { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, InfinityFlowPresetType } from '../types';

interface InfinityFlowCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: string;
  isGlitching?: boolean;
  preset?: InfinityFlowPresetType;
  noiseFloorSensitivity?: number;
}

interface Particle {
  t: number;           // Parametric progress (0 .. 2*PI)
  speed: number;       // Base speed
  size: number;        // Base size
  offsetAngle: number; // Radial offset angle
  distance: number;    // Radius distance from flow center
  alpha: number;       // Base alpha
  spin: number;        // Rotation angle
  spinSpeed: number;   // Spin velocity
  colorType: 'primary' | 'secondary' | 'energy' | 'accent';
  vortexCore: 0 | 1;   // For vortex mode: left (0) or right (1) lobe core
  vortexRadius: number; // Radius in vortex spiral
  vortexAngle: number;  // Angle in vortex spiral
  shardSides: 3 | 4 | 6; // For crystalline shards: triangle, diamond, hexagon
  nebulaRadius: number; // For nebula volumetric puff
}

export function InfinityFlowCanvas({
  theme,
  audioState,
  expression,
  isGlitching = false,
  preset = 'vortex',
  noiseFloorSensitivity = 1.0,
}: InfinityFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef<number>(0);
  const ringRotationRef = useRef<number>(0);

  // Initialize particle pool (200 particles)
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 200;
    const colorTypes: ('primary' | 'secondary' | 'energy' | 'accent')[] = [
      'primary', 'energy', 'energy', 'accent', 'secondary',
    ];
    const shardTypes: (3 | 4 | 6)[] = [3, 4, 4, 6];

    for (let i = 0; i < count; i++) {
      particles.push({
        t: (i / count) * Math.PI * 2,
        speed: 0.0025 + Math.random() * 0.005,
        size: 1.5 + Math.random() * 3.5,
        offsetAngle: Math.random() * Math.PI * 2,
        distance: (Math.random() - 0.5) * 48,
        alpha: 0.35 + Math.random() * 0.65,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.05,
        colorType: colorTypes[Math.floor(Math.random() * colorTypes.length)],
        vortexCore: i % 2 === 0 ? 0 : 1,
        vortexRadius: 15 + Math.random() * 120,
        vortexAngle: Math.random() * Math.PI * 2,
        shardSides: shardTypes[Math.floor(Math.random() * shardTypes.length)],
        nebulaRadius: 12 + Math.random() * 26,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.015;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Audio & Ambient Noise Floor Factors
      const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
      const sensitivity = noiseFloorSensitivity ?? 1.0;
      // Ambient noise floor shifts the baseline intensity of glow, turbulence, velocity, and size
      const ambientShift = Math.max(0.1, Math.min(2.5, noiseFloor * 3.2 * sensitivity));
      
      const vol = audioState.volume;
      const bass = audioState.bass;
      const treble = audioState.treble;
      const isRoar = audioState.isRoaring || expression === 'roar';

      // Combined speed multiplier: ambient floor sets base cruising flow, speech volume provides bursts
      const speedMultiplier = (0.7 + ambientShift * 0.8) * (1 + vol * 3.0 + (isRoar ? 2.8 : 0));
      const loopScaleX = width * 0.42 * (1 + vol * 0.08 + ambientShift * 0.04);
      const loopScaleY = height * 0.28 * (1 + vol * 0.08 + ambientShift * 0.04);

      // Glitch offset
      const glitchX = (isGlitching || (isRoar && Math.random() > 0.65)) ? (Math.random() - 0.5) * 16 : 0;
      const glitchY = (isGlitching || (isRoar && Math.random() > 0.65)) ? (Math.random() - 0.5) * 8 : 0;

      ctx.save();
      ctx.translate(centerX + glitchX, centerY + glitchY);

      // -------------------------------------------------------------
      // 1. BACKGROUND RINGS & DIALS
      // -------------------------------------------------------------
      ringRotationRef.current += 0.004 * (1 + ambientShift * 0.6 + vol * 1.8);
      const ringRot = ringRotationRef.current;
      const baseRadius = Math.min(width, height) * 0.38;
      const ringRadius = baseRadius * (1 + bass * 0.12 + ambientShift * 0.06);

      // Outer Holo Ring
      ctx.save();
      ctx.rotate(ringRot);
      ctx.strokeStyle = theme.gridColor || 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.2 + ambientShift * 0.6;
      ctx.setLineDash([8, 12, 2, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Cyber Ticks
      const tickCount = 24;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2;
        const innerR = ringRadius - (i % 6 === 0 ? 12 : 6);
        const outerR = ringRadius + (i % 6 === 0 ? 6 : 2);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.strokeStyle = i % 6 === 0 ? theme.energy : theme.primary;
        ctx.lineWidth = i % 6 === 0 ? 1.8 : 0.9;
        ctx.stroke();
      }
      ctx.restore();

      // Counter-rotating inner ring
      ctx.save();
      ctx.rotate(-ringRot * 1.4);
      ctx.strokeStyle = theme.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Helper function to resolve particle color
      const resolveColor = (colorType: 'primary' | 'secondary' | 'energy' | 'accent') => {
        if (colorType === 'energy') return theme.energy;
        if (colorType === 'secondary') return theme.secondary;
        if (colorType === 'accent') return theme.accent;
        return theme.primary;
      };

      const particles = particlesRef.current;

      // -------------------------------------------------------------
      // 2. PRESET SPECIFIC RENDERING PIPELINE
      // -------------------------------------------------------------

      if (preset === 'vortex') {
        // =========================================================
        // PRESET A: VORTEX (Centripetal Cyclonic Vortex)
        // =========================================================
        // Two cyclone singularity centers positioned at the infinity lobe centers
        const vortexCenterX1 = -loopScaleX * 0.62;
        const vortexCenterX2 = loopScaleX * 0.62;
        const vortexCenterY = 0;

        // Ambient noise floor expands vortex halo glow and cyclonic suction
        const vortexSpinSpeed = (0.02 + ambientShift * 0.035) * (1 + vol * 2.0);
        const vortexGlow = 14 + ambientShift * 18 + vol * 22;

        // Draw glowing singularity accretion rings around each vortex core
        [vortexCenterX1, vortexCenterX2].forEach((vx, idx) => {
          ctx.save();
          ctx.translate(vx, vortexCenterY);
          ctx.rotate(ringRot * (idx === 0 ? 2 : -2));

          // Singularity Event Horizon Core
          const eyeRadius = 16 * (1 + ambientShift * 0.35 + vol * 0.5);
          const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeRadius * 1.6);
          eyeGrad.addColorStop(0, theme.energy);
          eyeGrad.addColorStop(0.5, theme.primary);
          eyeGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = eyeGrad;
          ctx.globalAlpha = 0.5 + ambientShift * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, eyeRadius * 1.6, 0, Math.PI * 2);
          ctx.fill();

          // Accretion Disk Orbit Ring
          ctx.strokeStyle = theme.energy;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 8, 2, 8]);
          ctx.shadowBlur = vortexGlow;
          ctx.shadowColor = theme.energy;
          ctx.beginPath();
          ctx.arc(0, 0, eyeRadius * 1.8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        });

        // Lemniscate Underlying Guide Streamer
        ctx.save();
        ctx.beginPath();
        const ribbonSegs = 120;
        for (let i = 0; i <= ribbonSegs; i++) {
          const u = (i / ribbonSegs) * Math.PI * 2;
          const px = loopScaleX * Math.sin(u + t * 0.25);
          const py = loopScaleY * Math.sin(2 * (u + t * 0.25));
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = theme.secondary;
        ctx.lineWidth = 1.5 + ambientShift * 1.2;
        ctx.globalAlpha = 0.35 + ambientShift * 0.25;
        ctx.setLineDash([6, 12]);
        ctx.stroke();
        ctx.restore();

        // Render Cyclonic Vortex Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // Spiral inward and outward around assigned core
          p.vortexAngle += vortexSpinSpeed * (70 / Math.max(25, p.vortexRadius));
          
          // Radius oscillates or cycles inward towards singularity then bursts out
          p.vortexRadius -= 0.35 * speedMultiplier;
          if (p.vortexRadius < 10) {
            p.vortexRadius = 110 + Math.random() * 40;
            p.vortexCore = p.vortexCore === 0 ? 1 : 0; // Cross over to the opposing vortex lobe
          }

          const coreX = p.vortexCore === 0 ? vortexCenterX1 : vortexCenterX2;
          const currentR = p.vortexRadius * (1 + ambientShift * 0.2);
          const px = coreX + Math.cos(p.vortexAngle) * currentR;
          const py = vortexCenterY + Math.sin(p.vortexAngle) * (currentR * 0.75);

          // Directional velocity tail (tangent vector)
          const tangentAngle = p.vortexAngle + Math.PI / 2;
          const tailLen = (6 + ambientShift * 8 + vol * 14);
          const tailX = px - Math.cos(tangentAngle) * tailLen;
          const tailY = py - Math.sin(tangentAngle) * tailLen;

          const dynamicSize = p.size * (0.8 + ambientShift * 0.5 + vol * 0.8);
          const dynamicAlpha = Math.min(1, p.alpha * (0.45 + ambientShift * 0.45 + vol * 0.5));
          const color = resolveColor(p.colorType);

          ctx.save();
          // Draw streak
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = color;
          ctx.lineWidth = dynamicSize * 0.8;
          ctx.globalAlpha = dynamicAlpha * 0.6;
          ctx.stroke();

          // Draw head
          ctx.beginPath();
          ctx.arc(px, py, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = dynamicAlpha;
          ctx.shadowBlur = 6 + ambientShift * 10;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.restore();
        }

      } else if (preset === 'nebula') {
        // =========================================================
        // PRESET B: NEBULA (Volumetric Plasma Clouds & Star Nodes)
        // =========================================================
        // Soft cosmic dust clouds drifting along the lemniscate path
        const cloudCount = 18;
        for (let c = 0; c < cloudCount; c++) {
          const u = ((c / cloudCount) * Math.PI * 2 + t * 0.08) % (Math.PI * 2);
          const cx = loopScaleX * Math.sin(u) + Math.sin(t * 0.6 + c) * 20;
          const cy = loopScaleY * Math.sin(2 * u) + Math.cos(t * 0.5 + c) * 15;
          
          // Ambient noise floor swells the cloud radius and luminosity
          const cloudRadius = (45 + c * 2) * (1 + ambientShift * 0.65 + vol * 0.4);
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudRadius);
          
          const cloudColor = c % 2 === 0 ? theme.energy : (c % 3 === 0 ? theme.secondary : theme.primary);
          grad.addColorStop(0, cloudColor);
          grad.addColorStop(0.4, theme.auraColor || cloudColor);
          grad.addColorStop(1, 'transparent');

          ctx.save();
          ctx.globalAlpha = Math.min(0.35, (0.08 + ambientShift * 0.12 + vol * 0.1));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, cloudRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Nebula Stardust Particles with Soft Glowing Orbs
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.t = (p.t + p.speed * speedMultiplier * 0.8) % (Math.PI * 2);

          // Base lemniscate position
          const basePx = loopScaleX * Math.sin(p.t);
          const basePy = loopScaleY * Math.sin(2 * p.t);

          // Turbulent Brownian orbital drift
          const driftAngle = p.offsetAngle + t * 0.3;
          const driftDist = p.distance * (1 + ambientShift * 0.5);
          const px = basePx + Math.cos(driftAngle) * driftDist;
          const py = basePy + Math.sin(driftAngle) * driftDist;

          // Stellar twinkling node or soft particle
          const isStellar = i % 5 === 0;
          const twinkle = isStellar ? (Math.sin(t * 4 + i) * 0.5 + 0.5) : 1;
          const dynamicSize = (isStellar ? p.size * 1.5 : p.size) * (1 + ambientShift * 0.45 + vol * 0.8) * (0.7 + twinkle * 0.5);
          const dynamicAlpha = Math.min(1, p.alpha * (0.4 + ambientShift * 0.45 + vol * 0.6));
          const color = resolveColor(p.colorType);

          ctx.save();
          if (isStellar) {
            // Draw stellar flare
            ctx.shadowBlur = 12 + ambientShift * 14 + vol * 16;
            ctx.shadowColor = theme.energy;
            ctx.fillStyle = theme.energy;
            ctx.globalAlpha = dynamicAlpha;
            ctx.beginPath();
            ctx.arc(px, py, dynamicSize, 0, Math.PI * 2);
            ctx.fill();

            // Subtle 4-point stellar diamond spikes
            const spikeLen = dynamicSize * (2.2 + ambientShift * 1.2);
            ctx.strokeStyle = theme.energy;
            ctx.lineWidth = 1;
            ctx.globalAlpha = dynamicAlpha * 0.7;
            ctx.beginPath();
            ctx.moveTo(px - spikeLen, py);
            ctx.lineTo(px + spikeLen, py);
            ctx.moveTo(px, py - spikeLen);
            ctx.lineTo(px, py + spikeLen);
            ctx.stroke();
          } else {
            // Soft gas particle
            ctx.shadowBlur = 8 + ambientShift * 8;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.globalAlpha = dynamicAlpha;
            ctx.beginPath();
            ctx.arc(px, py, dynamicSize, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

      } else if (preset === 'crystalline') {
        // =========================================================
        // PRESET C: CRYSTALLINE FLOW (Faceted Shards & Lattice Beams)
        // =========================================================
        // Step 1: Calculate all shard positions
        const shardPositions: { x: number; y: number; size: number; color: string; alpha: number; p: Particle }[] = [];

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.t = (p.t + p.speed * speedMultiplier) % (Math.PI * 2);
          p.spin += p.spinSpeed * (1 + ambientShift * 0.8);

          const basePx = loopScaleX * Math.sin(p.t);
          const basePy = loopScaleY * Math.sin(2 * p.t);

          // Crystalline angular offsets
          const dx = Math.cos(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.35));
          const dy = Math.sin(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.35));

          const px = basePx + dx;
          const py = basePy + dy;
          const dynamicSize = (p.size + 1.2) * (1 + ambientShift * 0.4 + vol * 0.8);
          const dynamicAlpha = Math.min(1, p.alpha * (0.5 + ambientShift * 0.45 + vol * 0.5));
          const color = resolveColor(p.colorType);

          shardPositions.push({ x: px, y: py, size: dynamicSize, color, alpha: dynamicAlpha, p });
        }

        // Step 2: Crystalline Interconnect Lattice Struts (Laser bonds between proximate nodes)
        // Ambient noise floor expands the strut link distance and bond brightness
        const maxLinkDist = 52 + ambientShift * 26 + (isRoar ? 20 : 0);
        ctx.save();
        ctx.lineWidth = 1.0;
        for (let i = 0; i < shardPositions.length; i += 2) {
          const s1 = shardPositions[i];
          for (let j = i + 1; j < Math.min(shardPositions.length, i + 8); j++) {
            const s2 = shardPositions[j];
            const distX = s1.x - s2.x;
            const distY = s1.y - s2.y;
            const dSq = distX * distX + distY * distY;
            if (dSq < maxLinkDist * maxLinkDist) {
              const dist = Math.sqrt(dSq);
              const bondAlpha = (1 - dist / maxLinkDist) * (0.2 + ambientShift * 0.35 + vol * 0.4);
              ctx.strokeStyle = s1.color;
              ctx.globalAlpha = Math.min(0.85, bondAlpha);
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();

        // Step 3: Draw Faceted Geometric Shards
        for (let i = 0; i < shardPositions.length; i++) {
          const s = shardPositions[i];
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.p.spin);

          ctx.shadowBlur = 8 + ambientShift * 12 + vol * 12;
          ctx.shadowColor = s.color;
          ctx.fillStyle = s.color;
          ctx.strokeStyle = theme.energy;
          ctx.lineWidth = 1;
          ctx.globalAlpha = s.alpha;

          if (s.p.shardSides === 4) {
            // Faceted Diamond Shard
            const halfW = s.size * 0.75;
            const halfH = s.size * 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -halfH);
            ctx.lineTo(halfW, 0);
            ctx.lineTo(0, halfH);
            ctx.lineTo(-halfW, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Specular reflection glint facet
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.moveTo(0, -halfH);
            ctx.lineTo(halfW * 0.5, 0);
            ctx.lineTo(0, halfH * 0.5);
            ctx.closePath();
            ctx.fill();
          } else if (s.p.shardSides === 6) {
            // Hexagonal Crystal Prism
            drawHexagon(ctx, 0, 0, s.size * 1.1);
            ctx.fill();
            ctx.stroke();
          } else {
            // Triangular Shard
            ctx.beginPath();
            ctx.moveTo(0, -s.size * 1.2);
            ctx.lineTo(s.size * 0.9, s.size * 0.8);
            ctx.lineTo(-s.size * 0.9, s.size * 0.8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        }

      } else {
        // =========================================================
        // PRESET D: LEMNISCATE (Harmonic 8-Flow Ribbon Classic)
        // =========================================================
        const ribbonSegments = 160;

        // Glow backdrop
        ctx.shadowBlur = 16 + ambientShift * 14 + vol * 22;
        ctx.shadowColor = theme.energy;

        // Primary Ribbon Stream
        ctx.beginPath();
        for (let i = 0; i <= ribbonSegments; i++) {
          const u = (i / ribbonSegments) * Math.PI * 2;
          const px = loopScaleX * Math.sin(u + t * 0.3);
          const py = loopScaleY * Math.sin(2 * (u + t * 0.3)) + Math.sin(u * 6 + t * 4) * (2 + ambientShift * 4 + vol * 6);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = theme.energy;
        ctx.lineWidth = 2.2 + ambientShift * 1.5 + vol * 3.0;
        ctx.stroke();

        // Secondary Parallel Flow Ribbon
        ctx.beginPath();
        for (let i = 0; i <= ribbonSegments; i++) {
          const u = (i / ribbonSegments) * Math.PI * 2;
          const px = (loopScaleX * 0.94) * Math.sin(u - t * 0.2);
          const py = (loopScaleY * 0.94) * Math.sin(2 * (u - t * 0.2)) + Math.cos(u * 5 + t * 3) * (2 + ambientShift * 3 + treble * 5);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = theme.secondary;
        ctx.lineWidth = 1.2 + ambientShift * 1.0 + vol * 2;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Infinity Flow Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.t = (p.t + p.speed * speedMultiplier) % (Math.PI * 2);

          const basePx = loopScaleX * Math.sin(p.t);
          const basePy = loopScaleY * Math.sin(2 * p.t);

          const dx = Math.cos(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.3 + vol * 0.4));
          const dy = Math.sin(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.3 + vol * 0.4));

          const finalX = basePx + dx;
          const finalY = basePy + dy;

          const dynamicSize = p.size * (1 + ambientShift * 0.35 + vol * 1.2 + (isRoar ? 0.8 : 0));
          const dynamicAlpha = Math.min(1, p.alpha * (0.55 + ambientShift * 0.35 + vol * 0.7));
          const color = resolveColor(p.colorType);

          ctx.save();
          ctx.beginPath();
          ctx.arc(finalX, finalY, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = dynamicAlpha;
          ctx.shadowBlur = 8 + ambientShift * 8 + vol * 10;
          ctx.shadowColor = color;
          ctx.fill();

          // Connected energy lightning sparks between adjacent particles during roar/burst
          if (isRoar && i % 4 === 0 && i < particles.length - 1) {
            const nextP = particles[i + 1];
            const nextX = loopScaleX * Math.sin(nextP.t) + Math.cos(nextP.offsetAngle) * nextP.distance;
            const nextY = loopScaleY * Math.sin(2 * nextP.t) + Math.sin(nextP.offsetAngle) * nextP.distance;
            
            ctx.beginPath();
            ctx.moveTo(finalX, finalY);
            const midX = (finalX + nextX) / 2 + (Math.random() - 0.5) * 20;
            const midY = (finalY + nextY) / 2 + (Math.random() - 0.5) * 20;
            ctx.lineTo(midX, midY);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = theme.energy;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = 0.75;
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // -------------------------------------------------------------
      // 3. HEXAGONAL GUARDIAN SHIELD GRID (When in 'shield' mode)
      // -------------------------------------------------------------
      if (expression === 'shield') {
        ctx.save();
        const hexSize = 28;
        const gridRadius = ringRadius * 0.9;
        ctx.strokeStyle = theme.energy;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.25;
        ctx.shadowBlur = 12;
        ctx.shadowColor = theme.energy;

        for (let q = -5; q <= 5; q++) {
          for (let r = -5; r <= 5; r++) {
            const hx = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
            const hy = hexSize * ((3 / 2) * r);
            const dist = Math.sqrt(hx * hx + hy * hy);
            if (dist < gridRadius) {
              drawHexagon(ctx, hx, hy, hexSize * 0.52);
            }
          }
        }
        ctx.restore();
      }

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
  }, [theme, audioState, expression, isGlitching, preset, noiseFloorSensitivity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + radius * Math.cos(angle);
    const hy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}
