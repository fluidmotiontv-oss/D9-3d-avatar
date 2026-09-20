import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode, FlightPatternType, FlightPhysicsConfig } from '../types';
import { Compass, RotateCcw, Zap, Sparkles, Navigation, Gauge, Wind } from 'lucide-react';

interface InfinityFlightDragonCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  flightPattern?: FlightPatternType;
  flightSpeed?: number;
  flightPhysics?: FlightPhysicsConfig;
  onRecall?: () => void;
  interactive?: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  angle: number;
  speed: number;
  time: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  glyph?: string;
}

export const InfinityFlightDragonCanvas: React.FC<InfinityFlightDragonCanvasProps> = ({
  theme,
  audioState,
  expression,
  flightPattern = 'infinity',
  flightSpeed = 1.0,
  flightPhysics = { velocity: 1.0, acceleration: 1.0, drag: 0.92 },
  onRecall,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activePattern, setActivePattern] = useState<FlightPatternType>(flightPattern);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(flightSpeed);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isDocking, setIsDocking] = useState(false);
  const [telemetry, setTelemetry] = useState({ speed: 0, drag: 0.92, accel: 1.0 });

  // Position & physics state ref
  const flightRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    targetX: 0,
    targetY: 0,
    time: 0,
    wingPhase: 0,
    jawFactor: 0,
    trail: [] as TrailPoint[],
    particles: [] as Particle[],
    cursorX: 0,
    cursorY: 0,
    isHovered: false,
    initialized: false,
  });

  // Keep activePattern in sync with prop
  useEffect(() => {
    setActivePattern(flightPattern);
  }, [flightPattern]);

  // Sync speedMultiplier with prop
  useEffect(() => {
    setSpeedMultiplier(flightSpeed);
  }, [flightSpeed]);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    flightRef.current.cursorX = e.clientX - rect.left;
    flightRef.current.cursorY = e.clientY - rect.top;
    flightRef.current.isHovered = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    flightRef.current.isHovered = false;
  }, []);

  const handleTriggerBoost = () => {
    setIsBoosting(true);
    setTimeout(() => setIsBoosting(false), 800);
  };

  const handleInitiateDocking = () => {
    if (isDocking) return;
    setIsDocking(true);
  };

  // Main Canvas Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      if (!flightRef.current.initialized) {
        flightRef.current.x = rect.width / 2;
        flightRef.current.y = rect.height / 2;
        flightRef.current.cursorX = rect.width / 2;
        flightRef.current.cursorY = rect.height / 2;
        flightRef.current.initialized = true;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const glyphs = ['0', '1', '432', 'Δ', '9', '⟡', '::', '◈', '∞'];

    const render = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const st = flightRef.current;
      const vol = audioState.volume;
      const bass = audioState.bass;
      const treble = audioState.treble;
      const isRoar = audioState.isRoaring || expression === 'roar' || isBoosting;

      // Jaw lerping
      const targetJaw = isRoar ? 1.0 : audioState.jawOpen;
      st.jawFactor += (targetJaw - st.jawFactor) * 0.25;

      // Effective flight speed & configurable physics parameters
      const physVelocity = flightPhysics.velocity;
      const physAccel = flightPhysics.acceleration;
      const physDrag = Math.min(0.995, Math.max(0.70, flightPhysics.drag));

      const boostMult = isBoosting ? 1.85 : 1.0;
      const targetCruiseSpeed = (3.4 + vol * 3.8 + (isRoar ? 4.2 : 0)) * speedMultiplier * physVelocity * boostMult;

      st.time += 0.02 * (0.6 + 0.4 * physVelocity) * (1 + vol * 1.5 + (isRoar ? 1.0 : 0)) * speedMultiplier;
      st.wingPhase += (0.18 + vol * 0.25 + (isRoar ? 0.35 : 0)) * (0.7 + 0.3 * physVelocity) * speedMultiplier;

      // Calculate Target Flight Trajectory based on Active Pattern or Docking sequence
      const centerX = width / 2;
      const centerY = height / 2;

      if (isDocking) {
        // Homing directly into the stationary Glassmorphic Dock Station
        st.targetX = centerX;
        st.targetY = centerY;
      } else if (activePattern === 'cursor' && st.isHovered) {
        // Chases Cursor smoothly with banking
        st.targetX = st.cursorX;
        st.targetY = st.cursorY;
      } else if (activePattern === 'lissajous') {
        // Complex Harmonic Orbital Patrol
        const spanX = width * 0.4;
        const spanY = height * 0.35;
        st.targetX = centerX + Math.sin(st.time * 0.7) * spanX;
        st.targetY = centerY + Math.sin(st.time * 1.1 + Math.PI / 4) * spanY;
      } else {
        // Default: Pure 3D Infinity Lemniscate Flow (∞ Figure-8)
        const loopScaleX = width * 0.38;
        const loopScaleY = height * 0.26;
        const u = st.time * 0.8;
        st.targetX = centerX + Math.sin(u) * loopScaleX;
        st.targetY = centerY + (Math.sin(2 * u) / 2) * loopScaleY + Math.sin(u * 3) * 15;
      }

      // Physics Interpolation toward Target
      const dx = st.targetX - st.x;
      const dy = st.targetY - st.y;
      const distToTarget = Math.hypot(dx, dy);
      const targetAngle = Math.atan2(dy, dx);

      // Smooth angle steering with torque governed by acceleration
      let angleDiff = targetAngle - st.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      const steeringTorque = Math.min(0.24, (0.045 + 0.08 * physAccel) * (1 + vol * 0.25));
      st.angle += angleDiff * steeringTorque;

      // Dynamic thrust and velocity integration
      let effectiveSpeed = targetCruiseSpeed;
      if (isDocking) {
        // Deceleration curve when docking: gentle magnetic approach
        effectiveSpeed = Math.min(targetCruiseSpeed, Math.max(0.4, distToTarget * 0.06 * physVelocity));
      }

      const alignment = Math.max(0.25, Math.cos(angleDiff));
      const thrustPower = (0.2 + 0.45 * physAccel) * (isBoosting ? 1.8 : 1.0);
      const desiredVx = Math.cos(st.angle) * effectiveSpeed * alignment;
      const desiredVy = Math.sin(st.angle) * effectiveSpeed * alignment;

      // Accelerate toward target velocity
      st.vx += (desiredVx - st.vx) * thrustPower * 0.35;
      st.vy += (desiredVy - st.vy) * thrustPower * 0.35;

      // Apply Aerodynamic Drag / Inertia Damping
      st.vx *= physDrag;
      st.vy *= physDrag;

      // Move along integrated velocity vector
      st.x += st.vx;
      st.y += st.vy;

      const currentSpeed = Math.hypot(st.vx, st.vy);

      // Check if docking completed (near center with decayed speed)
      if (isDocking && distToTarget < 22 && currentSpeed < 1.4) {
        setIsDocking(false);
        onRecall?.();
        return;
      }

      // Add to Spine Trail Buffer with instantaneous speed
      st.trail.unshift({
        x: st.x,
        y: st.y,
        angle: st.angle,
        speed: currentSpeed,
        time: st.time,
      });

      // Maintain trail points (approx 60 history nodes for 26 body segments)
      if (st.trail.length > 70) {
        st.trail.pop();
      }

      // -------------------------------------------------------------
      // 1. DRAW AMBIENT ORBITING INFINITY HALO & CYBER DIALS
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(centerX, centerY);

      // Faint reference infinity loop in the background
      ctx.save();
      ctx.beginPath();
      const ribbonPts = 120;
      const bgLoopX = width * 0.38;
      const bgLoopY = height * 0.26;
      for (let i = 0; i <= ribbonPts; i++) {
        const theta = (i / ribbonPts) * Math.PI * 2;
        const px = Math.sin(theta) * bgLoopX;
        const py = (Math.sin(2 * theta) / 2) * bgLoopY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `${theme.primary}25`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.restore();

      // Holographic Gyroscopic Rings around Center
      ctx.save();
      ctx.rotate(st.time * 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.36, 0, Math.PI * 2);
      ctx.strokeStyle = `${theme.energy}20`;
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 18, 2, 18]);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // restore center translate

      // -------------------------------------------------------------
      // 2. SPAWN & RENDER STARDUST & QUANTUM WAKE PARTICLES
      // -------------------------------------------------------------
      // Emit particle wake from dragon tail and wingtips
      if (Math.random() < 0.75 + vol * 0.5) {
        const pColor = Math.random() > 0.4 ? theme.energy : Math.random() > 0.5 ? theme.primary : theme.accent;
        st.particles.push({
          x: st.x - Math.cos(st.angle) * 35 + (Math.random() - 0.5) * 16,
          y: st.y - Math.sin(st.angle) * 35 + (Math.random() - 0.5) * 16,
          vx: -Math.cos(st.angle) * (1 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
          vy: -Math.sin(st.angle) * (1 + Math.random() * 2) + (Math.random() - 0.5) * 1.5,
          size: 1.5 + Math.random() * 3.5 + vol * 2.5,
          alpha: 0.8 + Math.random() * 0.2,
          color: pColor,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          glyph: Math.random() > 0.8 ? glyphs[Math.floor(Math.random() * glyphs.length)] : undefined,
        });
      }

      // Update and render particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0.01) {
          st.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.glyph) {
          ctx.font = `${Math.round(p.size * 2)}px monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 3. DRAW DUAL GLOWING INFINITY PLASMA RIBBON TRAILS
      // -------------------------------------------------------------
      if (st.trail.length > 8) {
        ctx.save();
        // Ribbon 1: Primary Energy Core
        ctx.beginPath();
        for (let i = 0; i < st.trail.length; i++) {
          const pt = st.trail[i];
          const progress = i / st.trail.length;
          const ribbonWidth = (1 - progress) * 14 * (1 + vol * 0.4);
          const normAngle = pt.angle + Math.PI / 2;
          const wave = Math.sin(st.time * 6 - i * 0.3) * (6 + vol * 12);
          const rx = pt.x + Math.cos(normAngle) * wave;
          const ry = pt.y + Math.sin(normAngle) * wave;

          if (i === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = `${theme.energy}80`;
        ctx.lineWidth = 3 + vol * 4;
        ctx.shadowColor = theme.energy;
        ctx.shadowBlur = 16 + vol * 15;
        ctx.stroke();

        // Ribbon 2: Secondary Counter Wave
        ctx.beginPath();
        for (let i = 0; i < st.trail.length; i++) {
          const pt = st.trail[i];
          const progress = i / st.trail.length;
          const normAngle = pt.angle - Math.PI / 2;
          const wave = Math.sin(st.time * 6 - i * 0.3 + Math.PI) * (6 + vol * 12);
          const rx = pt.x + Math.cos(normAngle) * wave;
          const ry = pt.y + Math.sin(normAngle) * wave;

          if (i === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = `${theme.primary}60`;
        ctx.lineWidth = 2 + vol * 2;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 4. DRAW ARTICULATED SERPENTINE DRAGON BODY (26 Vertebrae)
      // -------------------------------------------------------------
      const numSegments = 26;
      const segmentSpacing = 2.4; // Trail index stride per segment

      // Draw segments from tail to head so head renders on top
      for (let s = numSegments - 1; s >= 0; s--) {
        const trailIdx = Math.floor(s * segmentSpacing);
        if (trailIdx >= st.trail.length) continue;

        const pt = st.trail[trailIdx];
        const nextPt = st.trail[Math.max(0, trailIdx - 1)];
        const segAngle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) || pt.angle;

        const segProgress = s / numSegments; // 0 = head, 1 = tail
        // Body width tapering: chest is widest (s ~ 3-5), tapering down to tail
        let bodyWidth = 28 * Math.sin((1 - segProgress * 0.9) * Math.PI * 0.5);
        if (s < 4) bodyWidth = 20 + s * 3; // head transition
        const bodyLength = 12;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(segAngle);

        // Sinusoidal serpentine undulation on dorsal fin
        const undulation = Math.sin(st.time * 7 - s * 0.45);
        const finHeight = (12 - s * 0.35) * (1 + bass * 0.4);

        // A. Dorsal Glowing Energy Spine Fin
        ctx.beginPath();
        ctx.moveTo(-bodyLength * 0.5, 0);
        ctx.lineTo(0, -finHeight + undulation * 3);
        ctx.lineTo(bodyLength * 0.5, 0);
        ctx.closePath();
        ctx.fillStyle = s % 2 === 0 ? `${theme.energy}cc` : `${theme.primary}aa`;
        ctx.shadowColor = theme.energy;
        ctx.shadowBlur = 8;
        ctx.fill();

        // B. Cyber Scale Armor Segment (Hexagonal Mecha Plate)
        ctx.beginPath();
        ctx.moveTo(bodyLength * 0.6, 0);
        ctx.lineTo(bodyLength * 0.2, -bodyWidth * 0.5);
        ctx.lineTo(-bodyLength * 0.6, -bodyWidth * 0.4);
        ctx.lineTo(-bodyLength * 0.8, 0);
        ctx.lineTo(-bodyLength * 0.6, bodyWidth * 0.4);
        ctx.lineTo(bodyLength * 0.2, bodyWidth * 0.5);
        ctx.closePath();

        // Segment coloring: layered mecha gradient
        const segGrad = ctx.createLinearGradient(-bodyLength, 0, bodyLength, 0);
        segGrad.addColorStop(0, '#09090b');
        segGrad.addColorStop(0.5, s % 3 === 0 ? '#18181b' : '#0f172a');
        segGrad.addColorStop(1, '#1e293b');

        ctx.fillStyle = segGrad;
        ctx.fill();
        ctx.strokeStyle = s % 2 === 0 ? theme.primary : `${theme.secondary}bb`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // C. Lateral Circuit Nodes
        if (s % 3 === 0) {
          ctx.fillStyle = theme.energy;
          ctx.beginPath();
          ctx.arc(0, -bodyWidth * 0.35, 1.8, 0, Math.PI * 2);
          ctx.arc(0, bodyWidth * 0.35, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // D. Tail Whip Fin (For final segments)
        if (s >= numSegments - 3) {
          ctx.beginPath();
          ctx.moveTo(-bodyLength, 0);
          ctx.lineTo(-bodyLength - 18, -8 + undulation * 8);
          ctx.lineTo(-bodyLength - 28, 0);
          ctx.lineTo(-bodyLength - 18, 8 - undulation * 8);
          ctx.closePath();
          ctx.fillStyle = theme.energy;
          ctx.shadowColor = theme.energy;
          ctx.shadowBlur = 12;
          ctx.fill();
        }

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 5. DRAW HOLOGRAPHIC CYBER WINGS (Attached to Thorax)
      // -------------------------------------------------------------
      const thoraxIdx = 3;
      if (st.trail.length > thoraxIdx) {
        const thoraxPt = st.trail[thoraxIdx];
        const wingFlap = Math.sin(st.wingPhase) * 28 * (1 + vol * 0.4);
        const wingSweep = Math.cos(st.wingPhase) * 8;

        ctx.save();
        ctx.translate(thoraxPt.x, thoraxPt.y);
        ctx.rotate(thoraxPt.angle);

        // Render Left Wing
        drawHolographicWing(ctx, -1, wingFlap, wingSweep, theme, vol, bass);
        // Render Right Wing
        drawHolographicWing(ctx, 1, wingFlap, wingSweep, theme, vol, bass);

        ctx.restore();
      }

      // -------------------------------------------------------------
      // 6. DRAW ARTICULATED FLYING DRAGON HEAD (Apex)
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.rotate(st.angle);

      // Plasma Breath Beam (when Roaring or speaking loudly in flight)
      if (st.jawFactor > 0.35 || isRoar) {
        const beamLength = (80 + vol * 180 + (isRoar ? 140 : 0)) * st.jawFactor;
        const beamWidth = (14 + vol * 24 + (isRoar ? 18 : 0)) * st.jawFactor;

        ctx.save();
        const beamGrad = ctx.createLinearGradient(25, 0, 25 + beamLength, 0);
        beamGrad.addColorStop(0, '#ffffff');
        beamGrad.addColorStop(0.2, theme.energy);
        beamGrad.addColorStop(0.7, `${theme.primary}88`);
        beamGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.shadowColor = theme.energy;
        ctx.shadowBlur = 24;

        ctx.beginPath();
        ctx.moveTo(25, -beamWidth * 0.3);
        ctx.lineTo(25 + beamLength, -beamWidth);
        ctx.lineTo(25 + beamLength * 1.08, 0);
        ctx.lineTo(25 + beamLength, beamWidth);
        ctx.lineTo(25, beamWidth * 0.3);
        ctx.closePath();
        ctx.fill();

        // Energy rings along breath beam
        for (let r = 1; r <= 3; r++) {
          const ringDist = 25 + (beamLength / 4) * r;
          ctx.beginPath();
          ctx.ellipse(ringDist, 0, 4, (beamWidth / 3) * r, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Cyber Whiskers (Aerodynamic Sensory Tendrils)
      const whiskerLag = Math.sin(st.time * 9) * 4;
      ctx.save();
      ctx.strokeStyle = `${theme.accent}cc`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      // Upper whisker
      ctx.moveTo(18, -6);
      ctx.quadraticCurveTo(-10, -22 + whiskerLag, -35, -16 + whiskerLag * 1.5);
      // Lower whisker
      ctx.moveTo(18, 6);
      ctx.quadraticCurveTo(-10, 22 - whiskerLag, -35, 16 - whiskerLag * 1.5);
      ctx.stroke();
      ctx.restore();

      // Lower Jaw (Hinged, drops when vocalizing)
      const jawDropPx = st.jawFactor * 10;
      ctx.save();
      ctx.translate(6, 4 + jawDropPx);
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(2, 6);
      ctx.lineTo(-12, 4);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Jaw teeth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(12, -3);
      ctx.lineTo(10, 0);
      ctx.fill();
      ctx.restore();

      // Main Cranium Skull
      ctx.beginPath();
      ctx.moveTo(34, 0);       // Snout apex
      ctx.lineTo(20, -10);     // Upper muzzle
      ctx.lineTo(6, -14);      // Brow ridge
      ctx.lineTo(-14, -18);    // Crown plate
      ctx.lineTo(-24, -12);    // Back of cranium
      ctx.lineTo(-26, 0);      // Neck hinge
      ctx.lineTo(-24, 12);
      ctx.lineTo(-14, 18);
      ctx.lineTo(6, 14);
      ctx.lineTo(20, 10);
      ctx.closePath();

      const headGrad = ctx.createLinearGradient(-26, -18, 34, 18);
      headGrad.addColorStop(0, '#09090b');
      headGrad.addColorStop(0.6, '#0f172a');
      headGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mecha Forehead Crest / Rune
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(0, -6);
      ctx.lineTo(-8, 0);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fillStyle = `${theme.accent}80`;
      ctx.fill();
      ctx.strokeStyle = theme.energy;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Cyber Horns (Pair of Swept Glowing Horns)
      drawCyberHorn(ctx, -1, theme, vol);
      drawCyberHorn(ctx, 1, theme, vol);

      // Glowing Ocular Sensor / Cyber Eye
      ctx.save();
      const eyeColor = theme.eyeGlow || '#f43f5e';
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 14 + vol * 10;
      // Slanted Cyber Eye (Left & Right)
      ctx.beginPath();
      ctx.moveTo(12, -5);
      ctx.lineTo(4, -8);
      ctx.lineTo(8, -4);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, 5);
      ctx.lineTo(4, 8);
      ctx.lineTo(8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Snout Nostril Glow
      ctx.fillStyle = theme.energy;
      ctx.beginPath();
      ctx.arc(28, -2, 1.2, 0, Math.PI * 2);
      ctx.arc(28, 2, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // restore head

      animId = requestAnimationFrame(render);
    };

      animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, audioState, expression, activePattern, speedMultiplier, isBoosting, isDocking, flightPhysics, onRecall]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Interactive In-Flight HUD & Steering Controls (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md border border-cyan-500/40 px-3.5 py-1.5 rounded-full shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-orbitron font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="tracking-wider">INFINITY FLOW FLIGHT</span>
          </div>

          <div className="h-3 w-px bg-zinc-700 mx-1" />

          {/* Flight Trajectory Mode Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsDocking(false);
                setActivePattern('infinity');
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activePattern === 'infinity' && !isDocking
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Symmetrical 3D Lemniscate 8-Loop"
            >
              ∞ LOOP
            </button>
            <button
              onClick={() => {
                setIsDocking(false);
                setActivePattern('cursor');
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activePattern === 'cursor' && !isDocking
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Follow & Chase Mouse Pointer"
            >
              CURSOR CHASE
            </button>
            <button
              onClick={() => {
                setIsDocking(false);
                setActivePattern('lissajous');
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activePattern === 'lissajous' && !isDocking
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Full Perimeter Lissajous Patrol"
            >
              ORBITAL
            </button>
          </div>

          <div className="h-3 w-px bg-zinc-700 mx-1" />

          {/* Speed Boost Button */}
          <button
            onClick={handleTriggerBoost}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              isBoosting
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/50'
                : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300'
            }`}
            title="Trigger Plasma Acceleration Surge"
          >
            <Zap className="w-3 h-3" />
            <span>BOOST</span>
          </button>

          {/* Re-Assemble Dock Recall Button */}
          {onRecall && (
            <button
              onClick={isDocking ? onRecall : handleInitiateDocking}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all cursor-pointer shadow-md text-[11px] ml-1 ${
                isDocking
                  ? 'bg-amber-400 text-zinc-950 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950'
              }`}
              title={isDocking ? 'Force instant re-dock' : 'Glide and re-assemble back into stationary dock station'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isDocking ? 'animate-spin' : ''}`} />
              <span>{isDocking ? 'DOCKING...' : 'RE-ASSEMBLE DOCK'}</span>
            </button>
          )}
        </div>

        {/* Live Configured Flight Physics Telemetry Pill */}
        <div className="flex items-center gap-2.5 px-3 py-0.5 bg-zinc-950/75 backdrop-blur-md rounded-full border border-zinc-800/80 text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1 text-cyan-300 font-bold">
            <Gauge className="w-3 h-3 text-cyan-400" />
            VEL: <strong className="text-zinc-200">{(flightPhysics.velocity).toFixed(1)}x</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-pink-300 font-bold">
            <Zap className="w-3 h-3 text-pink-400" />
            ACCEL: <strong className="text-zinc-200">{(flightPhysics.acceleration).toFixed(1)}x</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-emerald-300 font-bold">
            <Wind className="w-3 h-3 text-emerald-400" />
            DRAG: <strong className="text-zinc-200">{(flightPhysics.drag).toFixed(2)}</strong>
          </span>
          {isDocking && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-bold animate-pulse">INTERCEPTING DOCK CENTER</span>
            </>
          )}
        </div>
      </div>

      {/* Floating Flight Guidance Tip (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-none text-[10px] font-mono text-zinc-400 bg-zinc-950/70 border border-zinc-800 px-3 py-1.5 rounded-lg backdrop-blur-sm hidden sm:block">
        <span className="text-cyan-300 font-bold">AIRBORNE:</span> Voice & mic open dragon maw in flight. Press Space to fire plasma roar breath.
      </div>
    </div>
  );
};

// Helper: Draw Left or Right Holographic Wing
function drawHolographicWing(
  ctx: CanvasRenderingContext2D,
  side: -1 | 1,
  flap: number,
  sweep: number,
  theme: DragonTheme,
  vol: number,
  bass: number
) {
  ctx.save();
  const rootY = side * 12;

  ctx.beginPath();
  // Wing root on thorax
  ctx.moveTo(-4, rootY);

  // Articulated Primary Spar (Carpal)
  const tipX = -20 - sweep;
  const tipY = side * (55 + flap);

  // Secondary Spar
  const midX = -45 - sweep * 1.5;
  const midY = side * (75 + flap * 1.15);

  // Outer Wing Tip (Apex)
  const apexX = -65 - sweep * 2;
  const apexY = side * (95 + flap * 1.3);

  // Wing membrane arc
  ctx.quadraticCurveTo(-15, side * 35, tipX, tipY);
  ctx.lineTo(midX, midY);
  ctx.lineTo(apexX, apexY);
  // Scalloped trailing edge
  ctx.quadraticCurveTo(-45, side * 60, -25, side * 30);
  ctx.quadraticCurveTo(-15, side * 20, -18, rootY);
  ctx.closePath();

  // Translucent holographic laser fill
  const wingGrad = ctx.createLinearGradient(0, rootY, apexX, apexY);
  wingGrad.addColorStop(0, `${theme.primary}50`);
  wingGrad.addColorStop(0.5, `${theme.secondary}35`);
  wingGrad.addColorStop(1, `${theme.energy}20`);

  ctx.fillStyle = wingGrad;
  ctx.fill();

  // Wing spar struts (Bones)
  ctx.strokeStyle = theme.energy;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = theme.energy;
  ctx.shadowBlur = 10 + vol * 10;
  ctx.stroke();

  // Internal Laser Ribs
  ctx.beginPath();
  ctx.moveTo(-4, rootY);
  ctx.lineTo(tipX, tipY);
  ctx.moveTo(-10, rootY);
  ctx.lineTo(midX, midY);
  ctx.moveTo(-14, rootY);
  ctx.lineTo(apexX, apexY);
  ctx.strokeStyle = `${theme.primary}70`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// Helper: Draw Upper Cyber Horn
function drawCyberHorn(
  ctx: CanvasRenderingContext2D,
  side: -1 | 1,
  theme: DragonTheme,
  vol: number
) {
  ctx.save();
  const hornStartY = side * 14;

  ctx.beginPath();
  ctx.moveTo(-8, hornStartY);
  ctx.quadraticCurveTo(-26, side * 26, -42, side * 34);
  ctx.quadraticCurveTo(-22, side * 18, -12, hornStartY - side * 4);
  ctx.closePath();

  const hornGrad = ctx.createLinearGradient(-8, hornStartY, -42, side * 34);
  hornGrad.addColorStop(0, '#1e293b');
  hornGrad.addColorStop(0.6, theme.primary);
  hornGrad.addColorStop(1, theme.accent);

  ctx.fillStyle = hornGrad;
  ctx.fill();
  ctx.strokeStyle = theme.hornsGlow || theme.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = theme.hornsGlow || theme.accent;
  ctx.shadowBlur = 8 + vol * 6;
  ctx.stroke();

  ctx.restore();
}
