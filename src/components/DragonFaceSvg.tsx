import { useMemo } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode } from '../types';

interface DragonFaceSvgProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  lookX?: number; // Normalized -1 to 1
  lookY?: number; // Normalized -1 to 1
  showRunes?: boolean;
}

export function DragonFaceSvg({
  theme,
  audioState,
  expression,
  lookX = 0,
  lookY = 0,
  showRunes = true,
}: DragonFaceSvgProps) {
  const { volume, jawOpen, beamIntensity, bass, mid, treble, isRoaring } = audioState;

  // Eye gaze offset
  const eyeOffsetX = lookX * 7;
  const eyeOffsetY = lookY * 4;

  // Dynamic Jaw Opening
  // In SVG coordinates, the jaw hinges down by 0 to 52 pixels
  const jawTranslateY = jawOpen * 52;
  const jawRotation = (isRoaring ? 4 : 0) + jawOpen * 6;

  // Horn energy pulse
  const hornGlowScale = 1 + volume * 0.4 + (isRoaring ? 0.6 : 0);

  // Eyebrow slant for expressions
  const browRotation = useMemo(() => {
    switch (expression) {
      case 'roar': return 14;
      case 'alert': return 10;
      case 'shield': return -4;
      case 'hypersync': return 6;
      default: return isRoaring ? 12 : volume > 0.3 ? 6 : 0;
    }
  }, [expression, isRoaring, volume]);

  // Whisker wave points based on audio mid/treble
  const whiskerWave1 = Math.sin(Date.now() * 0.006) * (6 + mid * 16);
  const whiskerWave2 = Math.cos(Date.now() * 0.007) * (8 + treble * 20);

  // Equalizer bars on dragon collar (8 bars on each side)
  const eqBars = useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < 8; i++) {
      const freqVal = audioState.frequencyData[i * 2] || 0;
      bars.push(Math.max(4, freqVal * 36));
    }
    return bars;
  }, [audioState.frequencyData]);

  return (
    <svg
      id="cyber-dragon-svg-avatar"
      viewBox="0 0 600 700"
      className="w-full h-full max-h-[82vh] drop-shadow-2xl overflow-visible select-none"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="dragon-energy-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="dragon-eye-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="beam-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur1" />
          <feGaussianBlur stdDeviation="24" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <linearGradient id="horn-grad-left" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="50%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.hornsGlow} />
        </linearGradient>

        <linearGradient id="horn-grad-right" x1="100%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="50%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.hornsGlow} />
        </linearGradient>

        <linearGradient id="skull-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="40%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        <linearGradient id="beam-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor={theme.energy} stopOpacity="0.95" />
          <stop offset="70%" stopColor={theme.mouthGlow} stopOpacity="0.6" />
          <stop offset="100%" stopColor={theme.energy} stopOpacity="0" />
        </linearGradient>

        <radialGradient id="mouth-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="40%" stopColor={theme.mouthGlow} stopOpacity="0.9" />
          <stop offset="80%" stopColor={theme.energy} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="whisker-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.energy} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="whisker-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.energy} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* ========================================================
          BACKGROUND: Dragon Neck & Vertebrae Plates with Audio Spectrum
          ======================================================== */}
      <g id="dragon-neck-assembly">
        {/* Main Neck Backbone Plate */}
        <polygon
          points="220,470 380,470 420,670 180,670"
          fill="#121215"
          stroke="#27272a"
          strokeWidth="2"
        />
        {/* Vertebral Segments */}
        <path d="M 230 510 L 300 525 L 370 510 L 300 540 Z" fill="#1c1917" stroke={theme.secondary} strokeWidth="1.5" />
        <path d="M 215 560 L 300 580 L 385 560 L 300 600 Z" fill="#1c1917" stroke={theme.secondary} strokeWidth="1.5" />
        <path d="M 195 620 L 300 645 L 405 620 L 300 665 Z" fill="#1c1917" stroke={theme.secondary} strokeWidth="1.5" />

        {/* Real-time Spectrum Equalizer LED Bars on Left Collar */}
        <g id="neck-eq-left" transform="translate(190, 520)">
          {eqBars.map((barHeight, idx) => (
            <rect
              key={`eq-l-${idx}`}
              x={-idx * 8}
              y={idx * 16 - barHeight / 2}
              width="5"
              height={barHeight}
              rx="2.5"
              fill={idx % 2 === 0 ? theme.primary : theme.energy}
              opacity={0.7 + (idx % 3 === 0 ? 0.3 : 0)}
              filter="url(#dragon-energy-glow)"
            />
          ))}
        </g>

        {/* Real-time Spectrum Equalizer LED Bars on Right Collar */}
        <g id="neck-eq-right" transform="translate(410, 520)">
          {eqBars.map((barHeight, idx) => (
            <rect
              key={`eq-r-${idx}`}
              x={idx * 8}
              y={idx * 16 - barHeight / 2}
              width="5"
              height={barHeight}
              rx="2.5"
              fill={idx % 2 === 0 ? theme.primary : theme.energy}
              opacity={0.7 + (idx % 3 === 0 ? 0.3 : 0)}
              filter="url(#dragon-energy-glow)"
            />
          ))}
        </g>

        {/* Runic Cyber Glyphs / Dragon9 Branding along neck */}
        {showRunes && (
          <g id="neck-runes" opacity="0.75" className="font-orbitron">
            <text x="300" y="500" textAnchor="middle" fill={theme.accent} fontSize="9" letterSpacing="4">
              [ 54-MIN CHRONO SYNC ]
            </text>
            <text x="300" y="555" textAnchor="middle" fill={theme.energy} fontSize="11" fontWeight="bold" letterSpacing="6">
              ◈ 龍 D R A G O N 9 ◈
            </text>
            <text x="300" y="615" textAnchor="middle" fill={theme.primary} fontSize="8" letterSpacing="3">
              GUARDIAN CORE // {Math.round(bass * 100)}% BASS
            </text>
          </g>
        )}
      </g>

      {/* ========================================================
          CYBER DRAGON HORNS (Layered behind skull, sweeping forward)
          ======================================================== */}
      <g id="dragon-horns-group">
        {/* Left Primary Horn */}
        <path
          d="M 230 190 C 180 140 110 90 60 20 C 110 80 170 140 210 230 Z"
          fill="url(#horn-grad-left)"
          stroke={theme.hornsGlow}
          strokeWidth="2.5"
          filter={volume > 0.4 ? 'url(#dragon-energy-glow)' : undefined}
        />
        {/* Left Horn Energy Ridges */}
        <line x1="160" y1="130" x2="185" y2="160" stroke={theme.energy} strokeWidth={2 * hornGlowScale} />
        <line x1="120" y1="90" x2="140" y2="115" stroke={theme.energy} strokeWidth={2 * hornGlowScale} />
        <line x1="85" y1="50" x2="100" y2="70" stroke={theme.accent} strokeWidth={1.5} />

        {/* Left Secondary Brow Horn */}
        <path
          d="M 190 220 C 140 200 90 180 50 150 C 95 190 145 225 180 255 Z"
          fill="url(#horn-grad-left)"
          stroke={theme.primary}
          strokeWidth="1.5"
        />

        {/* Right Primary Horn */}
        <path
          d="M 370 190 C 420 140 490 90 540 20 C 490 80 430 140 390 230 Z"
          fill="url(#horn-grad-right)"
          stroke={theme.hornsGlow}
          strokeWidth="2.5"
          filter={volume > 0.4 ? 'url(#dragon-energy-glow)' : undefined}
        />
        {/* Right Horn Energy Ridges */}
        <line x1="440" y1="130" x2="415" y2="160" stroke={theme.energy} strokeWidth={2 * hornGlowScale} />
        <line x1="480" y1="90" x2="460" y2="115" stroke={theme.energy} strokeWidth={2 * hornGlowScale} />
        <line x1="515" y1="50" x2="500" y2="70" stroke={theme.accent} strokeWidth={1.5} />

        {/* Right Secondary Brow Horn */}
        <path
          d="M 410 220 C 460 200 510 180 550 150 C 505 190 455 225 420 255 Z"
          fill="url(#horn-grad-right)"
          stroke={theme.primary}
          strokeWidth="1.5"
        />
      </g>

      {/* ========================================================
          PLASMA BREATH / LASER BEAM (Fires from mouth when speaking/roaring)
          ======================================================== */}
      {beamIntensity > 0.05 && (
        <g id="dragon-plasma-beam" opacity={beamIntensity}>
          {/* Broad Outer Flare Corona */}
          <polygon
            points={`300,${370 + jawTranslateY * 0.4} ${180 - beamIntensity * 60},680 ${420 + beamIntensity * 60},680`}
            fill="url(#beam-grad)"
            filter="url(#beam-blur)"
            opacity={0.7 + volume * 0.3}
          />
          {/* Focused Core Laser Beam */}
          <polygon
            points={`300,${370 + jawTranslateY * 0.4} ${260 - volume * 20},680 ${340 + volume * 20},680`}
            fill="#ffffff"
            filter="url(#dragon-energy-glow)"
            opacity={0.9}
          />
          {/* Energy Ring Shockwaves traveling down beam */}
          <ellipse
            cx="300"
            cy={440 + jawTranslateY * 0.5 + (Date.now() % 600) / 4}
            rx={30 + beamIntensity * 35}
            ry={8 + beamIntensity * 6}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            filter="url(#dragon-energy-glow)"
          />
          <ellipse
            cx="300"
            cy={520 + (Date.now() % 800) / 4}
            rx={50 + beamIntensity * 45}
            ry={12 + beamIntensity * 8}
            fill="none"
            stroke={theme.energy}
            strokeWidth="2"
            filter="url(#dragon-energy-glow)"
          />
          {/* Lightning Arcs */}
          {isRoaring && (
            <g stroke="#ffffff" strokeWidth="2" fill="none" filter="url(#dragon-energy-glow)">
              <path d={`M 300 ${380 + jawTranslateY * 0.5} L 270 450 L 320 520 L 250 620 L 290 680`} />
              <path d={`M 300 ${380 + jawTranslateY * 0.5} L 330 460 L 280 540 L 350 630 L 310 680`} />
            </g>
          )}
        </g>
      )}

      {/* ========================================================
          ARTICULATED LOWER JAW & CHIN (Reacts to voice / opens dynamically)
          ======================================================== */}
      <g
        id="dragon-lower-jaw-articulated"
        transform={`translate(0, ${jawTranslateY})`}
        style={{
          transition: 'transform 0.05s ease-out',
        }}
      >
        {/* Deep Throat Glow when mouth opens */}
        {jawOpen > 0.08 && (
          <ellipse
            cx="300"
            cy="365"
            rx={35 + jawOpen * 25}
            ry={15 + jawOpen * 25}
            fill="url(#mouth-core-glow)"
            filter="url(#dragon-energy-glow)"
          />
        )}

        {/* Lower Jaw Outer Armor Plates */}
        <polygon
          points="225,350 250,420 300,470 350,420 375,350 330,370 300,380 270,370"
          fill="url(#skull-grad)"
          stroke={theme.secondary}
          strokeWidth="2"
        />

        {/* Lower Chin Mecha Spike & Vents */}
        <polygon
          points="285,450 300,490 315,450 300,460"
          fill={theme.primary}
          stroke={theme.energy}
          strokeWidth="1.5"
          filter={volume > 0.3 ? 'url(#dragon-energy-glow)' : undefined}
        />
        <line x1="270" y1="410" x2="280" y2="440" stroke={theme.accent} strokeWidth="1.5" />
        <line x1="330" y1="410" x2="320" y2="440" stroke={theme.accent} strokeWidth="1.5" />

        {/* Razor Lower Cyber Fangs */}
        <g id="lower-fangs" fill="#e4e4e7" stroke={theme.energy} strokeWidth="1">
          {/* Main Left Lower Canine */}
          <polygon points="265,370 272,335 279,370" />
          {/* Main Right Lower Canine */}
          <polygon points="321,370 328,335 335,370" />
          {/* Smaller Incisors */}
          <polygon points="283,374 288,350 293,375" />
          <polygon points="296,375 300,348 304,375" />
          <polygon points="307,375 312,350 317,374" />
        </g>
      </g>

      {/* ========================================================
          DRAGON CRANIUM & UPPER FACE (Skull, Brow, Cheeks, Snout)
          ======================================================== */}
      <g id="dragon-upper-cranium">
        {/* Forehead Crown Armor Plate */}
        <polygon
          points="300,120 380,180 390,260 350,280 300,240 250,280 210,260 220,180"
          fill="url(#skull-grad)"
          stroke={theme.primary}
          strokeWidth="2"
        />

        {/* Crown Core Spire / Sensor Array */}
        <polygon
          points="290,120 300,80 310,120 300,140"
          fill={theme.energy}
          stroke="#ffffff"
          strokeWidth="1.5"
          filter="url(#dragon-energy-glow)"
        />
        <circle cx="300" cy="160" r={8 + volume * 4} fill={theme.primary} stroke={theme.energy} strokeWidth="2" filter="url(#dragon-energy-glow)" />
        <circle cx="300" cy="160" r={3 + volume * 2} fill="#ffffff" />

        {/* Forehead Tech Circuit Lines */}
        <path d="M 280 180 L 250 190 L 230 220" stroke={theme.accent} strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M 320 180 L 350 190 L 370 220" stroke={theme.accent} strokeWidth="1.5" fill="none" opacity="0.8" />

        {/* Cheek Armor Plating */}
        <polygon points="210,260 240,310 230,360 190,320" fill="#18181b" stroke={theme.secondary} strokeWidth="1.5" />
        <polygon points="390,260 360,310 370,360 410,320" fill="#18181b" stroke={theme.secondary} strokeWidth="1.5" />

        {/* Cheek Exhaust Vents */}
        <line x1="205" y1="310" x2="225" y2="335" stroke={theme.energy} strokeWidth="2" />
        <line x1="200" y1="325" x2="220" y2="350" stroke={theme.primary} strokeWidth="1.5" />
        <line x1="395" y1="310" x2="375" y2="335" stroke={theme.energy} strokeWidth="2" />
        <line x1="400" y1="325" x2="380" y2="350" stroke={theme.primary} strokeWidth="1.5" />

        {/* Snout & Nose Bridge Armor */}
        <polygon
          points="300,240 335,270 330,335 300,345 270,335 265,270"
          fill="#1c1917"
          stroke={theme.primary}
          strokeWidth="2"
        />

        {/* Twin Nostril Exhaust Vents (Pulse with speaking) */}
        <ellipse
          cx="285"
          cy="325"
          rx="5"
          ry="3"
          fill="#000000"
          stroke={theme.energy}
          strokeWidth={1 + volume}
        />
        <ellipse
          cx="315"
          cy="325"
          rx="5"
          ry="3"
          fill="#000000"
          stroke={theme.energy}
          strokeWidth={1 + volume}
        />

        {/* Upper Jaw Razor Cyber Fangs */}
        <g id="upper-fangs" fill="#f4f4f5" stroke={theme.energy} strokeWidth="1">
          {/* Main Upper Left Fang */}
          <polygon points="255,335 262,372 269,335" />
          {/* Main Upper Right Fang */}
          <polygon points="331,335 338,372 345,335" />
          {/* Intermediate Upper Fangs */}
          <polygon points="274,337 279,360 284,337" />
          <polygon points="295,342 300,358 305,342" />
          <polygon points="316,337 321,360 326,337" />
        </g>
      </g>

      {/* ========================================================
          DYNAMIC CYBER VISOR & OCULAR LENSES (Reactive Eyes)
          ======================================================== */}
      <g id="dragon-eyes-assembly">
        {/* Eyebrow Plate Left (Slants with Expression / Roar) */}
        <g transform={`rotate(${-browRotation}, 250, 245)`}>
          <polygon points="220,235 285,248 275,258 215,245" fill="#27272a" stroke={theme.secondary} strokeWidth="1.5" />
          <line x1="220" y1="235" x2="285" y2="248" stroke={theme.energy} strokeWidth="2" />
        </g>

        {/* Eyebrow Plate Right */}
        <g transform={`rotate(${browRotation}, 350, 245)`}>
          <polygon points="380,235 315,248 325,258 385,245" fill="#27272a" stroke={theme.secondary} strokeWidth="1.5" />
          <line x1="380" y1="235" x2="315" y2="248" stroke={theme.energy} strokeWidth="2" />
        </g>

        {/* Left Eye Socket & Hexagonal Cyber Lens */}
        <g id="left-eye-socket" transform="translate(250, 265)">
          <polygon
            points="-28,-6 0,-14 28,-4 22,12 -8,15 -26,8"
            fill="#09090b"
            stroke={theme.primary}
            strokeWidth="2"
          />
          {/* Inner Glowing Iris */}
          <ellipse
            cx={eyeOffsetX * 0.8}
            cy={eyeOffsetY * 0.8}
            rx={16 + volume * 3}
            ry={9 + volume * 2}
            fill={theme.eyeGlow}
            filter="url(#dragon-eye-glow)"
            opacity={0.9}
          />
          {/* Slit Cyber Pupil (Dilates/Narrows with Audio & Roar) */}
          <ellipse
            cx={eyeOffsetX}
            cy={eyeOffsetY}
            rx={isRoaring ? 2 : 3 + volume * 4}
            ry={7 + (isRoaring ? 2 : 0)}
            fill="#ffffff"
          />
          {/* Holographic HUD Targeting Reticle */}
          <circle cx={eyeOffsetX} cy={eyeOffsetY} r="14" fill="none" stroke={theme.energy} strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6" />
        </g>

        {/* Right Eye Socket & Hexagonal Cyber Lens */}
        <g id="right-eye-socket" transform="translate(350, 265)">
          <polygon
            points="28,-6 0,-14 -28,-4 -22,12 8,15 26,8"
            fill="#09090b"
            stroke={theme.primary}
            strokeWidth="2"
          />
          {/* Inner Glowing Iris */}
          <ellipse
            cx={eyeOffsetX * 0.8}
            cy={eyeOffsetY * 0.8}
            rx={16 + volume * 3}
            ry={9 + volume * 2}
            fill={theme.eyeGlow}
            filter="url(#dragon-eye-glow)"
            opacity={0.9}
          />
          {/* Slit Cyber Pupil */}
          <ellipse
            cx={eyeOffsetX}
            cy={eyeOffsetY}
            rx={isRoaring ? 2 : 3 + volume * 4}
            ry={7 + (isRoaring ? 2 : 0)}
            fill="#ffffff"
          />
          {/* Holographic HUD Targeting Reticle */}
          <circle cx={eyeOffsetX} cy={eyeOffsetY} r="14" fill="none" stroke={theme.energy} strokeWidth="0.75" strokeDasharray="3,3" opacity="0.6" />
        </g>
      </g>

      {/* ========================================================
          CYBER DRAGON WHISKERS / ENERGY TENDRILS
          (Oscillate dynamically with frequency centroid / pitch)
          ======================================================== */}
      <g id="dragon-whiskers-group">
        {/* Left Upper Whisker */}
        <path
          d={`M 265 330 Q ${170 + whiskerWave1} ${360 + whiskerWave2}, ${90 + whiskerWave1 * 1.5} ${430 + whiskerWave2 * 1.2} T ${30 + whiskerWave1 * 2} ${500}`}
          fill="none"
          stroke="url(#whisker-grad-left)"
          strokeWidth={3 + volume * 2}
          filter="url(#dragon-energy-glow)"
        />
        {/* Left Lower Whisker */}
        <path
          d={`M 250 350 Q ${160 - whiskerWave2} ${400 + whiskerWave1}, ${80 - whiskerWave2 * 1.2} ${490 + whiskerWave1} T ${40 - whiskerWave2 * 1.5} ${580}`}
          fill="none"
          stroke={theme.accent}
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Right Upper Whisker */}
        <path
          d={`M 335 330 Q ${430 - whiskerWave1} ${360 + whiskerWave2}, ${510 - whiskerWave1 * 1.5} ${430 + whiskerWave2 * 1.2} T ${570 - whiskerWave1 * 2} ${500}`}
          fill="none"
          stroke="url(#whisker-grad-right)"
          strokeWidth={3 + volume * 2}
          filter="url(#dragon-energy-glow)"
        />
        {/* Right Lower Whisker */}
        <path
          d={`M 350 350 Q ${440 + whiskerWave2} ${400 + whiskerWave1}, ${520 + whiskerWave2 * 1.2} ${490 + whiskerWave1} T ${560 + whiskerWave2 * 1.5} ${580}`}
          fill="none"
          stroke={theme.accent}
          strokeWidth="1.5"
          opacity="0.8"
        />
      </g>

      {/* ========================================================
          HOLOGRAPHIC OVERLAY HUD CORNER BRACKETS
          ======================================================== */}
      <g id="dragon-hud-corners" stroke={theme.primary} strokeWidth="2" opacity="0.6">
        <path d="M 60 80 L 40 80 L 40 120" fill="none" />
        <path d="M 540 80 L 560 80 L 560 120" fill="none" />
        <path d="M 40 600 L 40 640 L 60 640" fill="none" />
        <path d="M 560 600 L 560 640 L 540 640" fill="none" />
      </g>
    </svg>
  );
}
