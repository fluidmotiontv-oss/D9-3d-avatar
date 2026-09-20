import React, { useEffect, useRef, useState } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode } from '../types';

interface CyberWingsVisualizerProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  flipHorizontal?: boolean;
}

export const CyberWingsVisualizer: React.FC<CyberWingsVisualizerProps> = ({
  theme,
  audioState,
  expression,
  flipHorizontal = false,
}) => {
  const leftWingRef = useRef<HTMLDivElement>(null);
  const rightWingRef = useRef<HTMLDivElement>(null);
  const leftFeatherRef = useRef<SVGGElement>(null);
  const rightFeatherRef = useRef<SVGGElement>(null);
  const leftGlowRef = useRef<SVGCircleElement>(null);
  const rightGlowRef = useRef<SVGCircleElement>(null);

  // Peak tracking state for telemetry display
  const [peakMetric, setPeakMetric] = useState({ bpm: 0, peakIntensity: 0, isPeaking: false });

  // Physics animation values in refs for 60fps direct DOM updates
  const physicsRef = useRef({
    flapAngle: 0,
    flapVelocity: 0,
    featherLag: 0,
    smoothedPeak: 0,
    lastPeakTime: 0,
    peakHistory: [] as number[],
    lastFrameTime: performance.now(),
  });

  // Audio reactive values ref
  const audioStateRef = useRef(audioState);
  useEffect(() => {
    audioStateRef.current = audioState;
  }, [audioState]);

  useEffect(() => {
    let animId: number;

    const updateLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - physicsRef.current.lastFrameTime) / 1000, 0.05);
      physicsRef.current.lastFrameTime = timestamp;

      const curAudio = audioStateRef.current;
      const freqData = curAudio.frequencyData || [];
      const volume = curAudio.volume || 0;
      const bass = curAudio.bass || 0;
      const rawVol = curAudio.rawVolume || 0;

      // 1. Audio Frequency Peak Detection
      let maxPeak = 0;
      let peakBin = 0;
      for (let i = 0; i < freqData.length; i++) {
        if (freqData[i] > maxPeak) {
          maxPeak = freqData[i];
          peakBin = i;
        }
      }

      // Weighted instantaneous peak power (combining bass transients + FFT peak + raw volume)
      const instantEnergy = maxPeak * 0.7 + bass * 0.8 + rawVol * 0.6 + volume * 0.5;

      // Dynamic peak threshold
      const prevSmoothed = physicsRef.current.smoothedPeak;
      physicsRef.current.smoothedPeak += (instantEnergy - prevSmoothed) * Math.min(1, dt * 4);
      const isPeakSpike = instantEnergy > prevSmoothed * 1.35 && instantEnergy > 0.18;

      let isPeaking = false;
      if (isPeakSpike && timestamp - physicsRef.current.lastPeakTime > 180) {
        isPeaking = true;
        physicsRef.current.lastPeakTime = timestamp;

        // Add flap impulse on frequency peak
        const peakPower = Math.min(2.5, (instantEnergy - prevSmoothed * 0.8) * 3.5);
        physicsRef.current.flapVelocity += peakPower * 85;

        // Record for BPM estimate
        const history = physicsRef.current.peakHistory;
        history.push(timestamp);
        if (history.length > 8) history.shift();
      }

      // Calculate approximate beat cadence
      const history = physicsRef.current.peakHistory;
      let calculatedBpm = 0;
      if (history.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < history.length; i++) {
          intervals.push((history[i] - history[i - 1]) / 1000);
        }
        const avgSec = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (avgSec > 0.2 && avgSec < 2.0) {
          calculatedBpm = Math.round(60 / avgSec);
        }
      }

      // 2. Physics & Spring Damping Simulation for 3D Wingbeat
      // Idle harmonic breath hover
      const timeSec = timestamp / 1000;
      const idleHoverSpeed = expression === 'roar' ? 5.5 : expression === 'alert' ? 4.2 : 2.6;
      const idleAmplitude = expression === 'roar' ? 18 : 9;
      const idleSine = Math.sin(timeSec * idleHoverSpeed) * idleAmplitude;

      // Spring damper for peak flap impulses
      const springStiffness = 38.0;
      const springDamping = 7.2;

      // Spring force returning to 0 (baseline)
      const springForce = -springStiffness * physicsRef.current.flapAngle;
      const dampingForce = -springDamping * physicsRef.current.flapVelocity;
      const accel = springForce + dampingForce;

      physicsRef.current.flapVelocity += accel * dt;
      physicsRef.current.flapAngle += physicsRef.current.flapVelocity * dt;

      // Sub-joint trailing feather lag
      const targetFeatherLag = physicsRef.current.flapAngle * 0.45;
      physicsRef.current.featherLag += (targetFeatherLag - physicsRef.current.featherLag) * Math.min(1, dt * 14);

      // Clamp max flap excursion
      physicsRef.current.flapAngle = Math.max(-25, Math.min(65, physicsRef.current.flapAngle));

      const totalAngle = idleSine + physicsRef.current.flapAngle;

      // 3. Apply 3D-CSS Transforms Directly to Left & Right Wings
      // Left Wing: rotates forward/backward around right shoulder pivot
      const leftRotY = -totalAngle * 1.15; // 3D depth flap sweep
      const leftRotZ = -(totalAngle * 0.35) + (bass * 6); // Dihedral spread
      const leftRotX = (totalAngle * 0.18); // Slight pitch
      const leftTransZ = Math.sin((totalAngle * Math.PI) / 180) * 110;
      const wingScale = 1 + (instantEnergy * 0.08) + (expression === 'roar' ? 0.12 : 0);

      // Right Wing: symmetric opposite 3D transforms around left shoulder pivot
      const rightRotY = totalAngle * 1.15;
      const rightRotZ = (totalAngle * 0.35) - (bass * 6);
      const rightRotX = (totalAngle * 0.18);
      const rightTransZ = leftTransZ;

      if (leftWingRef.current) {
        leftWingRef.current.style.transform = `rotateY(${leftRotY.toFixed(2)}deg) rotateZ(${leftRotZ.toFixed(2)}deg) rotateX(${leftRotX.toFixed(2)}deg) translateZ(${leftTransZ.toFixed(1)}px) scale(${wingScale.toFixed(3)})`;
      }

      if (rightWingRef.current) {
        rightWingRef.current.style.transform = `rotateY(${rightRotY.toFixed(2)}deg) rotateZ(${rightRotZ.toFixed(2)}deg) rotateX(${rightRotX.toFixed(2)}deg) translateZ(${rightTransZ.toFixed(1)}px) scale(${wingScale.toFixed(3)})`;
      }

      // Secondary feather tip flex
      const featherAngle = physicsRef.current.featherLag;
      if (leftFeatherRef.current) {
        leftFeatherRef.current.style.transform = `rotate(${(-featherAngle * 0.8).toFixed(1)}deg)`;
      }
      if (rightFeatherRef.current) {
        rightFeatherRef.current.style.transform = `rotate(${(featherAngle * 0.8).toFixed(1)}deg)`;
      }

      // Energy glow pulse at wing thruster nodes
      const glowRadius = Math.max(8, 12 + instantEnergy * 24);
      const glowOpacity = Math.min(1.0, 0.45 + instantEnergy * 0.65);
      if (leftGlowRef.current) {
        leftGlowRef.current.setAttribute('r', glowRadius.toFixed(1));
        leftGlowRef.current.setAttribute('opacity', glowOpacity.toFixed(2));
      }
      if (rightGlowRef.current) {
        rightGlowRef.current.setAttribute('r', glowRadius.toFixed(1));
        rightGlowRef.current.setAttribute('opacity', glowOpacity.toFixed(2));
      }

      // Occasional telemetry update
      if (Math.random() < 0.08) {
        setPeakMetric({
          bpm: calculatedBpm,
          peakIntensity: Math.round(instantEnergy * 100),
          isPeaking,
        });
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [expression]);

  return (
    <div
      id="dragon-wings-visualizer"
      className="absolute pointer-events-none flex items-center justify-center select-none -z-10 overflow-visible"
      style={{
        width: '1160px',
        height: '680px',
        left: '50%',
        top: '46%',
        transform: 'translate(-50%, -50%)',
        perspective: '1200px',
        perspectiveOrigin: '50% 45%',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Container spanning the wide wingspan */}
      <div
        className="relative w-full h-full flex items-center justify-between"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* =========================================================================
            LEFT CYBER WING (3D-CSS TRANSFORMED AROUND RIGHT SHOULDER PIVOT)
            ========================================================================= */}
        <div
          ref={leftWingRef}
          id="cyber-wing-left-container"
          className="absolute left-[2%] top-[3%] w-[520px] h-[620px]"
          style={{
            transformOrigin: '94% 48%', // Shoulder pivot near head center
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 460 560"
            className="w-full h-full overflow-visible drop-shadow-[0_0_24px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Photon Blade Neon Gradient */}
              <linearGradient id="wing-blade-grad-left" x1="100%" y1="50%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={theme.energy} stopOpacity="0.95" />
                <stop offset="45%" stopColor={theme.primary} stopOpacity="0.75" />
                <stop offset="85%" stopColor={theme.accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
              </linearGradient>

              {/* Wing Membrane Forcefield Lattice Gradient */}
              <radialGradient id="wing-membrane-grad-left" cx="85%" cy="50%" r="70%">
                <stop offset="0%" stopColor={theme.energy} stopOpacity="0.4" />
                <stop offset="60%" stopColor={theme.primary} stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Neon Thruster Flare Filter */}
              <filter id="wing-thruster-glow-left" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Photonic Membrane Lattice (Between titanium struts) */}
            <path
              d="M 430 260 L 320 120 L 190 60 L 60 110 L 20 230 L 90 380 L 220 480 L 360 410 L 430 260 Z"
              fill="url(#wing-membrane-grad-left)"
              stroke={theme.primary}
              strokeWidth="0.8"
              strokeDasharray="4 8"
              opacity="0.85"
            />

            {/* Hex Mesh Details on membrane */}
            <g opacity="0.35" stroke={theme.energy} strokeWidth="0.6" fill="none">
              <polygon points="340,180 360,170 380,180 380,200 360,210 340,200" />
              <polygon points="270,140 290,130 310,140 310,160 290,170 270,160" />
              <polygon points="210,190 230,180 250,190 250,210 230,220 210,210" />
              <polygon points="140,160 160,150 180,160 180,180 160,190 140,180" />
              <polygon points="160,270 180,260 200,270 200,290 180,300 160,290" />
              <polygon points="240,330 260,320 280,330 280,350 260,360 240,350" />
            </g>

            {/* 2. Articulated Kinetic Feathers / Energy Blades (Trailing) */}
            <g
              ref={leftFeatherRef}
              style={{
                transformOrigin: '420px 260px',
                transition: 'transform 0.05s ease-out',
              }}
            >
              {/* Blade 1 (High Apex Spike) */}
              <path
                d="M 320 120 L 170 30 L 195 70 L 310 135 Z"
                fill="url(#wing-blade-grad-left)"
                stroke={theme.energy}
                strokeWidth="1.4"
                filter="url(#wing-thruster-glow-left)"
              />

              {/* Blade 2 (Leading Flight Edge) */}
              <path
                d="M 280 140 L 40 85 L 90 130 L 260 165 Z"
                fill="url(#wing-blade-grad-left)"
                stroke={theme.energy}
                strokeWidth="1.5"
              />

              {/* Blade 3 (Mid Primary Talon Blade) */}
              <path
                d="M 260 180 L 10 205 L 50 250 L 240 220 Z"
                fill="url(#wing-blade-grad-left)"
                stroke="#ffffff"
                strokeWidth="1.8"
                filter="url(#wing-thruster-glow-left)"
              />

              {/* Blade 4 (Low Secondary Sweep) */}
              <path
                d="M 270 240 L 45 360 L 95 390 L 260 270 Z"
                fill="url(#wing-blade-grad-left)"
                stroke={theme.accent}
                strokeWidth="1.4"
              />

              {/* Blade 5 (Ventral Flap Feather) */}
              <path
                d="M 310 290 L 160 490 L 205 505 L 320 320 Z"
                fill="url(#wing-blade-grad-left)"
                stroke={theme.primary}
                strokeWidth="1.2"
              />
            </g>

            {/* 3. Mecha Titanium Skeletal Spars (Main armatures) */}
            {/* Humerus Root Armature */}
            <path
              d="M 435 250 L 330 150 L 315 160 L 425 270 Z"
              fill="#18181b"
              stroke={theme.energy}
              strokeWidth="2"
            />

            {/* Radius / Forearm Armature */}
            <path
              d="M 330 150 L 240 180 L 235 195 L 320 170 Z"
              fill="#18181b"
              stroke={theme.primary}
              strokeWidth="1.8"
            />

            {/* Phalangeal Bone Struts radiating outward */}
            <line x1="240" y1="180" x2="60" y2="105" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="240" y1="180" x2="30" y2="220" stroke={theme.energy} strokeWidth="2.2" />
            <line x1="240" y1="180" x2="70" y2="370" stroke={theme.accent} strokeWidth="2.0" />
            <line x1="330" y1="150" x2="185" y2="50" stroke={theme.energy} strokeWidth="2.2" />
            <line x1="310" y1="280" x2="180" y2="490" stroke={theme.primary} strokeWidth="1.8" />

            {/* 4. Real-time Frequency Spectrum Rib Bars (Acoustic Equalizer along spar) */}
            <g transform="translate(250, 140) rotate(-25)">
              {Array.from({ length: 8 }).map((_, barIdx) => {
                const freqVal = audioState.frequencyData[barIdx * 3] || 0;
                const barHeight = 4 + freqVal * 28;
                return (
                  <rect
                    key={`left-wing-freq-${barIdx}`}
                    x={barIdx * 7}
                    y={-barHeight}
                    width="4"
                    height={barHeight}
                    rx="1"
                    fill={barIdx < 3 ? theme.accent : theme.energy}
                    opacity={0.85}
                  />
                );
              })}
            </g>

            {/* 5. Main Shoulder Rotor Hub & Jet Thruster Vent */}
            <g transform="translate(425, 260)">
              {/* Outer Dynamo Ring */}
              <circle r="26" fill="#09090b" stroke={theme.energy} strokeWidth="2.5" />
              <circle
                r="20"
                fill="none"
                stroke={theme.accent}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                className="animate-[spin_6s_linear_infinite]"
              />

              {/* Dynamic Jet Thruster Plasma Core */}
              <circle
                ref={leftGlowRef}
                r="12"
                fill={theme.energy}
                filter="url(#wing-thruster-glow-left)"
              />
              <circle r="5" fill="#ffffff" />

              {/* Runic Cyber Stamp */}
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                9
              </text>
            </g>

            {/* High Apex Thruster Vent */}
            <circle cx="325" cy="150" r="7" fill={theme.energy} stroke="#ffffff" strokeWidth="1.2" />
            {/* Mid Joint Thruster Vent */}
            <circle cx="240" cy="180" r="8" fill={theme.primary} stroke="#ffffff" strokeWidth="1.2" />
          </svg>
        </div>

        {/* =========================================================================
            RIGHT CYBER WING (3D-CSS TRANSFORMED AROUND LEFT SHOULDER PIVOT)
            ========================================================================= */}
        <div
          ref={rightWingRef}
          id="cyber-wing-right-container"
          className="absolute right-[2%] top-[3%] w-[520px] h-[620px]"
          style={{
            transformOrigin: '6% 48%', // Shoulder pivot near head center
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 460 560"
            className="w-full h-full overflow-visible drop-shadow-[0_0_24px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Photon Blade Neon Gradient (Right) */}
              <linearGradient id="wing-blade-grad-right" x1="0%" y1="50%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.energy} stopOpacity="0.95" />
                <stop offset="45%" stopColor={theme.primary} stopOpacity="0.75" />
                <stop offset="85%" stopColor={theme.accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
              </linearGradient>

              {/* Wing Membrane Forcefield Lattice Gradient (Right) */}
              <radialGradient id="wing-membrane-grad-right" cx="15%" cy="50%" r="70%">
                <stop offset="0%" stopColor={theme.energy} stopOpacity="0.4" />
                <stop offset="60%" stopColor={theme.primary} stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Neon Thruster Flare Filter */}
              <filter id="wing-thruster-glow-right" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Photonic Membrane Lattice */}
            <path
              d="M 30 260 L 140 120 L 270 60 L 400 110 L 440 230 L 370 380 L 240 480 L 100 410 L 30 260 Z"
              fill="url(#wing-membrane-grad-right)"
              stroke={theme.primary}
              strokeWidth="0.8"
              strokeDasharray="4 8"
              opacity="0.85"
            />

            {/* Hex Mesh Details on membrane */}
            <g opacity="0.35" stroke={theme.energy} strokeWidth="0.6" fill="none">
              <polygon points="120,180 100,170 80,180 80,200 100,210 120,200" />
              <polygon points="190,140 170,130 150,140 150,160 170,170 190,160" />
              <polygon points="250,190 230,180 210,190 210,210 230,220 250,210" />
              <polygon points="320,160 300,150 280,160 280,180 300,190 320,180" />
              <polygon points="300,270 280,260 260,270 260,290 280,300 300,290" />
              <polygon points="220,330 200,320 180,330 180,350 200,360 220,350" />
            </g>

            {/* 2. Articulated Kinetic Feathers / Energy Blades (Trailing) */}
            <g
              ref={rightFeatherRef}
              style={{
                transformOrigin: '40px 260px',
                transition: 'transform 0.05s ease-out',
              }}
            >
              {/* Blade 1 (High Apex Spike) */}
              <path
                d="M 140 120 L 290 30 L 265 70 L 150 135 Z"
                fill="url(#wing-blade-grad-right)"
                stroke={theme.energy}
                strokeWidth="1.4"
                filter="url(#wing-thruster-glow-right)"
              />

              {/* Blade 2 (Leading Flight Edge) */}
              <path
                d="M 180 140 L 420 85 L 370 130 L 200 165 Z"
                fill="url(#wing-blade-grad-right)"
                stroke={theme.energy}
                strokeWidth="1.5"
              />

              {/* Blade 3 (Mid Primary Talon Blade) */}
              <path
                d="M 200 180 L 450 205 L 410 250 L 220 220 Z"
                fill="url(#wing-blade-grad-right)"
                stroke="#ffffff"
                strokeWidth="1.8"
                filter="url(#wing-thruster-glow-right)"
              />

              {/* Blade 4 (Low Secondary Sweep) */}
              <path
                d="M 190 240 L 415 360 L 365 390 L 200 270 Z"
                fill="url(#wing-blade-grad-right)"
                stroke={theme.accent}
                strokeWidth="1.4"
              />

              {/* Blade 5 (Ventral Flap Feather) */}
              <path
                d="M 150 290 L 300 490 L 255 505 L 140 320 Z"
                fill="url(#wing-blade-grad-right)"
                stroke={theme.primary}
                strokeWidth="1.2"
              />
            </g>

            {/* 3. Mecha Titanium Skeletal Spars */}
            <path
              d="M 25 250 L 130 150 L 145 160 L 35 270 Z"
              fill="#18181b"
              stroke={theme.energy}
              strokeWidth="2"
            />

            <path
              d="M 130 150 L 220 180 L 225 195 L 140 170 Z"
              fill="#18181b"
              stroke={theme.primary}
              strokeWidth="1.8"
            />

            {/* Phalangeal Bone Struts radiating outward */}
            <line x1="220" y1="180" x2="400" y2="105" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="220" y1="180" x2="430" y2="220" stroke={theme.energy} strokeWidth="2.2" />
            <line x1="220" y1="180" x2="390" y2="370" stroke={theme.accent} strokeWidth="2.0" />
            <line x1="130" y1="150" x2="275" y2="50" stroke={theme.energy} strokeWidth="2.2" />
            <line x1="150" y1="280" x2="280" y2="490" stroke={theme.primary} strokeWidth="1.8" />

            {/* 4. Real-time Frequency Spectrum Rib Bars */}
            <g transform="translate(150, 110) rotate(25)">
              {Array.from({ length: 8 }).map((_, barIdx) => {
                const freqVal = audioState.frequencyData[barIdx * 3] || 0;
                const barHeight = 4 + freqVal * 28;
                return (
                  <rect
                    key={`right-wing-freq-${barIdx}`}
                    x={barIdx * 7}
                    y={-barHeight}
                    width="4"
                    height={barHeight}
                    rx="1"
                    fill={barIdx < 3 ? theme.accent : theme.energy}
                    opacity={0.85}
                  />
                );
              })}
            </g>

            {/* 5. Main Shoulder Rotor Hub & Jet Thruster Vent */}
            <g transform="translate(35, 260)">
              <circle r="26" fill="#09090b" stroke={theme.energy} strokeWidth="2.5" />
              <circle
                r="20"
                fill="none"
                stroke={theme.accent}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                className="animate-[spin_6s_linear_infinite]"
              />

              <circle
                ref={rightGlowRef}
                r="12"
                fill={theme.energy}
                filter="url(#wing-thruster-glow-right)"
              />
              <circle r="5" fill="#ffffff" />

              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                9
              </text>
            </g>

            <circle cx="135" cy="150" r="7" fill={theme.energy} stroke="#ffffff" strokeWidth="1.2" />
            <circle cx="220" cy="180" r="8" fill={theme.primary} stroke="#ffffff" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
