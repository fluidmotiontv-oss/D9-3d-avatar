import { useState } from 'react';
import { DragonTheme } from '../types';
import { PRESET_THEMES } from '../constants/themes';
import { Palette, Sparkles, Sliders, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: DragonTheme;
  onSelectTheme: (theme: DragonTheme) => void;
  onCustomThemeUpdate?: (updatedTheme: DragonTheme) => void;
}

export function ThemeSelector({
  currentTheme,
  onSelectTheme,
  onCustomThemeUpdate,
}: ThemeSelectorProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customTheme, setCustomTheme] = useState<DragonTheme>({
    ...currentTheme,
    id: 'custom-dragon',
    name: 'Custom Energy',
    badge: 'CUSTOM MK-X',
  });

  const handleColorChange = (key: keyof DragonTheme, val: string) => {
    const updated = { ...customTheme, [key]: val };
    setCustomTheme(updated);
    onSelectTheme(updated);
    if (onCustomThemeUpdate) {
      onCustomThemeUpdate(updated);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Cyber Color Themes
          </h3>
        </div>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
            isCustomizing
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isCustomizing ? 'Presets' : 'Customizer'}</span>
        </button>
      </div>

      {!isCustomizing ? (
        /* Presets Grid */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_THEMES.map((theme) => {
            const isActive = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`relative group text-left p-3 rounded-xl transition-all duration-200 border flex flex-col justify-between ${
                  isActive
                    ? 'bg-zinc-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                {/* Header with badge */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider font-semibold text-zinc-400 block">
                      {theme.badge}
                    </span>
                    <span className="font-rajdhani font-bold text-sm text-zinc-100 block">
                      {theme.name}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Color Swatch Bars */}
                <div className="flex items-center gap-1.5 h-3 w-full rounded-md overflow-hidden bg-zinc-950/80 p-0.5 border border-zinc-800">
                  <div className="h-full flex-1 rounded-sm" style={{ backgroundColor: theme.primary }} />
                  <div className="h-full flex-1 rounded-sm" style={{ backgroundColor: theme.secondary }} />
                  <div className="h-full flex-1 rounded-sm" style={{ backgroundColor: theme.accent }} />
                  <div className="h-full flex-1 rounded-sm shadow-sm" style={{ backgroundColor: theme.energy }} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Custom Color Theme Builder */
        <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>CUSTOM CHROMA TUNING</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Primary Armor
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.primary}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Secondary Plates
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.secondary}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Energy Plasma & Beam
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.energy}
                  onChange={(e) => {
                    handleColorChange('energy', e.target.value);
                    handleColorChange('auraColor', `${e.target.value}80`);
                  }}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.energy}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Eye Lens Glow
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.eyeGlow}
                  onChange={(e) => handleColorChange('eyeGlow', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.eyeGlow}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Throat Maw Glow
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.mouthGlow}
                  onChange={(e) => handleColorChange('mouthGlow', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.mouthGlow}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-rajdhani font-semibold text-zinc-300 block mb-1">
                Horns Spire Energy
              </label>
              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <input
                  type="color"
                  value={customTheme.hornsGlow}
                  onChange={(e) => handleColorChange('hornsGlow', e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 uppercase">{customTheme.hornsGlow}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
