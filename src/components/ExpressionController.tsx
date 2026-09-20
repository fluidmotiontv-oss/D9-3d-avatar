import { ExpressionMode, DragonTheme } from '../types';
import { Flame, Shield, AlertTriangle, Activity, Sparkles, Smile } from 'lucide-react';

interface ExpressionControllerProps {
  currentExpression: ExpressionMode;
  onSetExpression: (expr: ExpressionMode) => void;
  theme: DragonTheme;
  isRoaring: boolean;
}

export function ExpressionController({
  currentExpression,
  onSetExpression,
  theme,
  isRoaring,
}: ExpressionControllerProps) {
  const expressions: { id: ExpressionMode; label: string; icon: typeof Flame; desc: string }[] = [
    { id: 'idle', label: 'Idle Guard', icon: Smile, desc: 'Gentle infinity breathing & pulse' },
    { id: 'talk', label: 'Voice Sync', icon: Activity, desc: 'Dynamic jaw lip-sync tracking' },
    { id: 'roar', label: 'Plasma Roar', icon: Flame, desc: 'Full laser breath & lightning' },
    { id: 'shield', label: 'Hex Shield', icon: Shield, desc: 'Guardian defense energy barrier' },
    { id: 'alert', label: 'Combat Alert', icon: AlertTriangle, desc: 'Critical threat ocular lock' },
    { id: 'hypersync', label: 'Hyper Sync', icon: Sparkles, desc: 'Dragon9 chrono resonance' },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-orbitron font-semibold tracking-wider text-zinc-300 uppercase">
          Guardian Emote Stances
        </span>
        {isRoaring && (
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
            AUDIO OVERDRIVE
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {expressions.map((item) => {
          const Icon = item.icon;
          const isActive = currentExpression === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSetExpression(item.id)}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
              title={item.desc}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: isActive ? theme.energy : undefined }}
              />
              <span className="font-rajdhani font-bold text-xs leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
