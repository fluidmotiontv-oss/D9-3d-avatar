import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface ProceduralShieldSvgProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  isActive: boolean;
  className?: string;
}

interface HexNode {
  id: string;
  cx: number;
  cy: number;
  r: number;
  distFromCenter: number;
  angle: number;
  points: string;
}

// Generate points for a regular flat-topped hexagon
function getHexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

// Generate a wavy closed SVG path around an ellipse/circle
function generateWavyPerimeter(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  waveCount: number,
  amplitude: number,
  phase: number
): string {
  const numSteps = 48;
  const pathParts: string[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const theta = (i / numSteps) * Math.PI * 2;
    const waveOffset = Math.sin(theta * waveCount + phase) * amplitude;
    const currRx = rx + waveOffset;
    const currRy = ry + waveOffset * (ry / rx);

    const x = cx + currRx * Math.cos(theta);
    const y = cy + currRy * Math.sin(theta);

    if (i === 0) {
      pathParts.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    } else {
      pathParts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }

  pathParts.push('Z');
  return pathParts.join(' ');
}

export const ProceduralShieldSvg: React.FC<ProceduralShieldSvgProps> = ({
  theme,
  audioState,
  isActive,
  className = '',
}) => {
  // Shield center aligned with dragon cranium & core
  const centerX = 300;
  const centerY = 360;
  const baseRadiusX = 220;
  const baseRadiusY = 265;

  // Animation phase & power state (smooth fade/scale transition)
  const [power, setPower] = useState(0); // 0 (off) to 1 (full active)
  const [animTime, setAnimTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Smooth power-up / power-down transition
  useEffect(() => {
    let currentPower = power;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      // Target power
      const target = isActive ? 1.0 : 0.0;
      // Interpolate with speed
      const speed = isActive ? 5.0 : 4.0;
      currentPower += (target - currentPower) * Math.min(1, dt * speed);

      if (Math.abs(target - currentPower) < 0.005) {
        currentPower = target;
      }

      setPower(currentPower);
      setAnimTime((prev) => prev + dt);

      // Keep running if active or transitioning
      if (isActive || currentPower > 0.005) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  // Compute ambient noise floor & dynamic response
  const rawVol = audioState.rawVolume || 0;
  const vol = audioState.volume || 0;
  const bass = audioState.bass || 0;
  const mid = audioState.mid || 0;
  const treble = audioState.treble || 0;

  // Ambient noise floor running metric (0.05 to 1.0+)
  const ambientNoise = Math.max(
    0.05,
    rawVol * 2.4 + bass * 1.5 + vol * 1.8 + Math.sin(animTime * 2.2) * 0.03 + 0.04
  );

  // Precompute Hexagonal Matrix around dragon
  const hexGrid = useMemo(() => {
    const nodes: HexNode[] = [];
    const hexRadius = 26;
    const horizDist = hexRadius * Math.sqrt(3);
    const vertDist = hexRadius * 1.5;

    const cols = 11;
    const rows = 13;
    const startX = centerX - ((cols - 1) * horizDist) / 2;
    const startY = centerY - ((rows - 1) * vertDist) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = (r % 2) * (horizDist / 2);
        const hx = startX + c * horizDist + offset;
        const hy = startY + r * vertDist;

        // Elliptical normalized distance from center
        const dx = (hx - centerX) / (baseRadiusX * 1.05);
        const dy = (hy - centerY) / (baseRadiusY * 1.05);
        const normDist = Math.hypot(dx, dy);

        // Keep only cells within shield dome boundary
        if (normDist <= 1.02 && normDist >= 0.12) {
          const angle = Math.atan2(hy - centerY, hx - centerX);
          nodes.push({
            id: `hex-${r}-${c}`,
            cx: hx,
            cy: hy,
            r: hexRadius,
            distFromCenter: normDist,
            angle,
            points: getHexPoints(hx, hy, hexRadius - 1.5),
          });
        }
      }
    }
    return nodes;
  }, [centerX, centerY, baseRadiusX, baseRadiusY]);

  // If completely inactive and powered down, unmount visual clutter
  if (power <= 0.005) {
    return null;
  }

  // Wave ripple layers with noise floor modulation
  const wave1 = generateWavyPerimeter(
    centerX,
    centerY,
    baseRadiusX * (0.95 + ambientNoise * 0.08),
    baseRadiusY * (0.95 + ambientNoise * 0.08),
    8,
    4 + ambientNoise * 14,
    animTime * 3.5
  );

  const wave2 = generateWavyPerimeter(
    centerX,
    centerY,
    baseRadiusX * (0.78 + ambientNoise * 0.06),
    baseRadiusY * (0.78 + ambientNoise * 0.06),
    6,
    3 + ambientNoise * 10,
    -animTime * 2.8
  );

  const wave3 = generateWavyPerimeter(
    centerX,
    centerY,
    baseRadiusX * (1.1 + ambientNoise * 0.1),
    baseRadiusY * (1.1 + ambientNoise * 0.1),
    10,
    5 + ambientNoise * 16,
    animTime * 4.2
  );

  // Dynamic Shield Perimeter Expansion on noise impact
  const currentScale = (0.85 + power * 0.15) * (1 + ambientNoise * 0.04);
  const shieldGlowOpacity = Math.min(1.0, power * (0.6 + ambientNoise * 0.45));

  // Pulse rings expanding outward
  const rippleProgress = (animTime * 1.5) % 1;
  const rippleRadiusX = baseRadiusX * (0.4 + rippleProgress * 0.7);
  const rippleRadiusY = baseRadiusY * (0.4 + rippleProgress * 0.7);
  const rippleOpacity = Math.max(0, (1 - rippleProgress) * 0.65 * power);

  // Cardinal Aegis emitter angles for defensive nodes
  const emitters = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      id="cyber-shield-svg-overlay"
      viewBox="0 0 600 700"
      className={`absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible select-none transition-opacity duration-200 ${className}`}
      style={{
        opacity: power,
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: `scale(${currentScale})`,
      }}
    >
      <defs>
        {/* Neon Shield Core Glow */}
        <filter id="shield-energy-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={4 + ambientNoise * 8} result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={10 + ambientNoise * 14} result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Ambient Noise Floor Turbulent Liquid Distortion */}
        <filter id="shield-plasma-ripple" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.025"
            numOctaves="3"
            seed="9"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={3 + ambientNoise * 18}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feMerge>
            <feMergeNode in="displaced" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shield Radial Force Field Gradient */}
        <radialGradient id="shield-dome-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.energy} stopOpacity={0.02 + ambientNoise * 0.05} />
          <stop offset="60%" stopColor={theme.primary} stopOpacity={0.08 + ambientNoise * 0.12} />
          <stop offset="88%" stopColor={theme.accent} stopOpacity={0.2 + ambientNoise * 0.25} />
          <stop offset="100%" stopColor={theme.energy} stopOpacity={0.45 + ambientNoise * 0.35} />
        </radialGradient>

        {/* Outer Perimeter Rim Gradient */}
        <linearGradient id="shield-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.energy} />
          <stop offset="50%" stopColor={theme.accent} />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Hex Cell Radial Mask for smooth boundary falloff */}
        <radialGradient id="hex-falloff-mask" cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* -------------------------------------------------------------
          1. AMBIENT ENERGY ATMOSPHERE & FORCE-FIELD DOME
          ------------------------------------------------------------- */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={baseRadiusX * 1.08}
        ry={baseRadiusY * 1.08}
        fill="url(#shield-dome-gradient)"
        className="transition-all duration-150"
      />

      {/* -------------------------------------------------------------
          2. EXPANDING SHOCKWAVE RIPPLES (Acoustic Noise Floor Pulse)
          ------------------------------------------------------------- */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={rippleRadiusX}
        ry={rippleRadiusY}
        fill="none"
        stroke={theme.energy}
        strokeWidth={1.5 + ambientNoise * 2}
        strokeDasharray="6 8 16 8"
        strokeDashoffset={-animTime * 40}
        opacity={rippleOpacity}
        filter="url(#shield-energy-glow)"
      />

      <ellipse
        cx={centerX}
        cy={centerY}
        rx={baseRadiusX * (0.8 + Math.sin(animTime * 4) * 0.05)}
        ry={baseRadiusY * (0.8 + Math.sin(animTime * 4) * 0.05)}
        fill="none"
        stroke={theme.accent}
        strokeWidth={1}
        strokeDasharray="4 12"
        opacity={0.3 + ambientNoise * 0.3}
      />

      {/* -------------------------------------------------------------
          3. PROCEDURAL HEXAGONAL HONEYCOMB MATRIX (Defensive Lattice)
          ------------------------------------------------------------- */}
      <g id="shield-hex-matrix" className="transition-opacity duration-150">
        {hexGrid.map((node) => {
          // Calculate procedural ripple wave passing through each hex
          const wavePhase = node.distFromCenter * 6 - animTime * 4.5 + node.angle * 1.5;
          const waveIntensity = (Math.sin(wavePhase) + 1) / 2; // 0..1

          // Ambient noise floor excites the cells
          const cellExcitement = waveIntensity * 0.4 + ambientNoise * 0.6;
          const strokeAlpha = Math.min(
            0.9,
            Math.max(0.08, (0.15 + cellExcitement * 0.65) * (1 - node.distFromCenter * 0.4))
          );
          const fillAlpha = Math.min(0.4, cellExcitement * 0.22 * (ambientNoise > 0.15 ? 1.5 : 0.8));

          const strokeColor =
            waveIntensity > 0.75
              ? '#ffffff'
              : node.distFromCenter > 0.8
              ? theme.energy
              : theme.primary;

          return (
            <polygon
              key={node.id}
              points={node.points}
              fill={theme.energy}
              fillOpacity={fillAlpha}
              stroke={strokeColor}
              strokeWidth={waveIntensity > 0.8 ? 1.4 : 0.75}
              strokeOpacity={strokeAlpha}
              className="transition-colors duration-100"
            />
          );
        })}
      </g>

      {/* -------------------------------------------------------------
          4. PROCEDURAL WAVY RIPPLE CONTOURS (Reacts to Noise Floor)
          ------------------------------------------------------------- */}
      <g id="shield-wavy-ripples" filter="url(#shield-plasma-ripple)">
        {/* Inner Wave Ring */}
        <path
          d={wave2}
          fill="none"
          stroke={theme.accent}
          strokeWidth={1.5 + ambientNoise * 2}
          strokeOpacity={0.4 + ambientNoise * 0.4}
        />

        {/* Primary Middle Energy Wave */}
        <path
          d={wave1}
          fill="none"
          stroke={theme.energy}
          strokeWidth={2 + ambientNoise * 3}
          strokeOpacity={shieldGlowOpacity}
          filter="url(#shield-energy-glow)"
        />

        {/* Outermost Perimeter Kinetic Wave */}
        <path
          d={wave3}
          fill="none"
          stroke="url(#shield-rim-grad)"
          strokeWidth={1.8 + ambientNoise * 2.5}
          strokeDasharray="8 6 24 6"
          strokeDashoffset={animTime * 30}
          strokeOpacity={0.5 + ambientNoise * 0.4}
        />
      </g>

      {/* -------------------------------------------------------------
          5. CIRCULAR ACOUSTIC DEFLECTION FREQUENCY TICK BARS
          ------------------------------------------------------------- */}
      <g id="shield-frequency-perimeter">
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i / 48) * Math.PI * 2;
          const freqIndex = (i * 2) % (audioState.frequencyData.length || 32);
          const freqVal = (audioState.frequencyData[freqIndex] || 0) * 1.5;

          // Tick bar length modulated by frequency and ambient noise floor
          const barLen = 4 + (ambientNoise * 14 + freqVal * 18);
          const rxInner = baseRadiusX * 1.05;
          const ryInner = baseRadiusY * 1.05;

          const x1 = centerX + rxInner * Math.cos(angle);
          const y1 = centerY + ryInner * Math.sin(angle);
          const x2 = centerX + (rxInner + barLen) * Math.cos(angle);
          const y2 = centerY + (ryInner + barLen * (ryInner / rxInner)) * Math.sin(angle);

          const isCardinal = i % 6 === 0;

          return (
            <line
              key={`shield-freq-tick-${i}`}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke={isCardinal ? '#ffffff' : theme.energy}
              strokeWidth={isCardinal ? 2 : 1}
              strokeOpacity={0.25 + ambientNoise * 0.65}
            />
          );
        })}
      </g>

      {/* -------------------------------------------------------------
          6. CARDINAL AEGIS EMITTER NODES & RUNIC DEFLECTION BRACKETS
          ------------------------------------------------------------- */}
      <g id="shield-aegis-emitters">
        {emitters.map((angleDeg, idx) => {
          const rad = (angleDeg * Math.PI) / 180;
          const nodeDistX = baseRadiusX * 1.06;
          const nodeDistY = baseRadiusY * 1.06;
          const nx = centerX + nodeDistX * Math.cos(rad);
          const ny = centerY + nodeDistY * Math.sin(rad);

          return (
            <g key={`emitter-${idx}`} transform={`translate(${nx}, ${ny})`}>
              {/* Outer Pulse Ring */}
              <circle
                r={6 + ambientNoise * 5}
                fill="none"
                stroke={theme.energy}
                strokeWidth={1.2}
                strokeOpacity={0.7}
                filter="url(#shield-energy-glow)"
              />
              {/* Core Node Dot */}
              <circle
                r={2.5}
                fill="#ffffff"
                filter="url(#shield-energy-glow)"
              />
              {/* Small Emitter Crosshair */}
              <line x1="-8" y1="0" x2="8" y2="0" stroke={theme.accent} strokeWidth="0.8" opacity="0.8" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke={theme.accent} strokeWidth="0.8" opacity="0.8" />
            </g>
          );
        })}

        {/* Top & Bottom Arch Deflector Brackets */}
        <path
          d={`M ${centerX - 90} ${centerY - baseRadiusY * 1.07} A ${baseRadiusX * 1.07} ${baseRadiusY * 1.07} 0 0 1 ${centerX + 90} ${centerY - baseRadiusY * 1.07}`}
          fill="none"
          stroke={theme.energy}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#shield-energy-glow)"
        />
        <path
          d={`M ${centerX - 90} ${centerY + baseRadiusY * 1.07} A ${baseRadiusX * 1.07} ${baseRadiusY * 1.07} 0 0 0 ${centerX + 90} ${centerY + baseRadiusY * 1.07}`}
          fill="none"
          stroke={theme.energy}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#shield-energy-glow)"
        />
      </g>

      {/* -------------------------------------------------------------
          7. DEFENSIVE TELEMETRY & NOISE FLOOR HUD STATUS
          ------------------------------------------------------------- */}
      <g id="shield-hud-telemetry" transform={`translate(${centerX}, ${centerY + baseRadiusY * 0.94})`}>
        {/* Telemetry Badge Container */}
        <rect
          x="-130"
          y="0"
          width="260"
          height="32"
          rx="6"
          fill="#09090b"
          fillOpacity="0.88"
          stroke={theme.energy}
          strokeWidth="1.2"
          strokeOpacity="0.8"
          filter="url(#shield-energy-glow)"
        />

        {/* Hexagonal Shield Icon */}
        <polygon
          points="-115,10 -110,7 -105,10 -105,17 -110,20 -115,17"
          fill={theme.energy}
          fillOpacity={0.8}
          stroke="#ffffff"
          strokeWidth="0.8"
        />

        {/* Telemetry Text */}
        <text
          x="-96"
          y="15"
          fill={theme.energy}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.2"
        >
          AEGIS FORCEFIELD // DEFENSE MODE
        </text>

        {/* Ambient Noise Floor Readout */}
        <text
          x="-96"
          y="25"
          fill="#a1a1aa"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.8"
        >
          NOISE DAMPER: {(ambientNoise * 100).toFixed(0)}% // 432Hz HARMONIC
        </text>

        {/* Mini Audio-Reactive VU Meter Bars inside Telemetry Badge */}
        <g transform="translate(85, 9)">
          {Array.from({ length: 5 }).map((_, barIdx) => {
            const isLit = ambientNoise * 5 > barIdx;
            return (
              <rect
                key={`meter-bar-${barIdx}`}
                x={barIdx * 7}
                y={12 - (barIdx + 1) * 2.2}
                width="4.5"
                height={(barIdx + 1) * 2.2}
                rx="1"
                fill={isLit ? (barIdx >= 3 ? theme.accent : theme.energy) : '#27272a'}
              />
            );
          })}
        </g>
      </g>

      {/* Top Deflector Title */}
      <g id="shield-top-header" transform={`translate(${centerX}, ${centerY - baseRadiusY * 0.96})`}>
        <rect
          x="-95"
          y="-18"
          width="190"
          height="18"
          rx="4"
          fill="#09090b"
          fillOpacity="0.85"
          stroke={theme.accent}
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <text
          x="0"
          y="-6"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1.4"
        >
          ✦ CYBER DOME ACTIVE ✦
        </text>
      </g>
    </svg>
  );
};
