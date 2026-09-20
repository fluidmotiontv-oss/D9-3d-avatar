import { DragonTheme } from '../types';

export const PRESET_THEMES: DragonTheme[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    badge: 'NEO-TOKYO',
    description: 'High-contrast electric cyan and radiant magenta synthwave energy.',
    primary: '#06b6d4',      // Cyan 500
    secondary: '#ec4899',    // Pink 500
    accent: '#38bdf8',       // Sky 400
    energy: '#00f5ff',       // Electric Cyan
    eyeGlow: '#00f5ff',
    mouthGlow: '#ff007f',
    hornsGlow: '#38bdf8',
    auraColor: 'rgba(6, 182, 212, 0.45)',
    gridColor: 'rgba(6, 182, 212, 0.2)',
    tagline: 'VIRTUAL GUARDIAN PROTOCOL // MK-VII',
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    badge: 'SOLAR FURY',
    description: 'Blazing radiant gold, incandescent magma and solar flare breath.',
    primary: '#f59e0b',      // Amber 500
    secondary: '#ef4444',    // Red 500
    accent: '#fbbf24',       // Amber 400
    energy: '#ffaa00',       // Pure Gold/Orange
    eyeGlow: '#ffea00',
    mouthGlow: '#ff3700',
    hornsGlow: '#ffd700',
    auraColor: 'rgba(245, 158, 11, 0.5)',
    gridColor: 'rgba(245, 158, 11, 0.2)',
    tagline: 'HELIOS STAR-EATER // CORONAL CORE',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    badge: 'NETRUNNER',
    description: 'Phosphor terminal green and toxic cybernetic nanite flow.',
    primary: '#10b981',      // Emerald 500
    secondary: '#059669',    // Emerald 600
    accent: '#34d399',       // Emerald 400
    energy: '#00ff66',       // High Voltage Green
    eyeGlow: '#00ff88',
    mouthGlow: '#00ff44',
    hornsGlow: '#6ee7b7',
    auraColor: 'rgba(16, 185, 129, 0.5)',
    gridColor: 'rgba(16, 185, 129, 0.2)',
    tagline: 'MAINFRAME OVERLORD // DEEP GRID',
  },
  {
    id: 'abyssal-void',
    name: 'Abyssal Void',
    badge: 'DARK MATTER',
    description: 'Deep ultraviolet singularity, psychic amethyst and cosmic ice rift.',
    primary: '#8b5cf6',      // Violet 500
    secondary: '#3b82f6',    // Blue 500
    accent: '#c084fc',       // Purple 400
    energy: '#a855f7',       // Electric Purple
    eyeGlow: '#38bdf8',
    mouthGlow: '#d946ef',
    hornsGlow: '#c084fc',
    auraColor: 'rgba(139, 92, 246, 0.5)',
    gridColor: 'rgba(139, 92, 246, 0.2)',
    tagline: 'EVENT HORIZON // ZERO-POINT ESSENCE',
  },
  {
    id: 'dragon9-chrono',
    name: 'Dragon9 Chrono',
    badge: '54-MIN CYCLE',
    description: 'Harmonized 54-minute temporal flow, chronometric gold and cyan pulse.',
    primary: '#e11d48',      // Rose/Crimson 600
    secondary: '#eab308',    // Yellow 500
    accent: '#06b6d4',       // Cyan 500
    energy: '#f43f5e',       // Vivid Crimson
    eyeGlow: '#facc15',
    mouthGlow: '#fb7185',
    hornsGlow: '#38bdf8',
    auraColor: 'rgba(225, 29, 72, 0.45)',
    gridColor: 'rgba(234, 179, 8, 0.2)',
    tagline: 'DRAGON9 SYNCHRONIZED TIME // TEMPORAL BEAST',
  },
  {
    id: 'plasma-ghost',
    name: 'Plasma Ghost',
    badge: 'STEALTH RECON',
    description: 'Pure stealth platinum, holographic diffraction and cryo-frost beam.',
    primary: '#e4e4e7',      // Zinc 200
    secondary: '#71717a',    // Zinc 500
    accent: '#38bdf8',       // Sky 400
    energy: '#e0f2fe',       // Frost White
    eyeGlow: '#7dd3fc',
    mouthGlow: '#bae6fd',
    hornsGlow: '#f4f4f5',
    auraColor: 'rgba(228, 228, 231, 0.35)',
    gridColor: 'rgba(228, 228, 231, 0.15)',
    tagline: 'SPECTRAL INTERCEPT // PHANTOM WING',
  },
  {
    id: 'infernal-magma',
    name: 'Infernal Magma',
    badge: 'CORE DRILL',
    description: 'Tectonic obsidian armor, volcanic thermal vents and molten fury.',
    primary: '#ea580c',      // Orange 600
    secondary: '#7f1d1d',    // Red 900
    accent: '#fb923c',       // Orange 400
    energy: '#ff4500',       // Molten Orange Red
    eyeGlow: '#ffcc00',
    mouthGlow: '#ff2200',
    hornsGlow: '#f97316',
    auraColor: 'rgba(234, 88, 12, 0.5)',
    gridColor: 'rgba(234, 88, 12, 0.2)',
    tagline: 'VOLCANIC DREADNOUGHT // SEISMIC SURGE',
  }
];

export const CHROMA_KEY_COLORS = {
  green: '#00FF00',
  blue: '#0000FF',
  magenta: '#FF00FF',
  custom: '#00FF00'
};
