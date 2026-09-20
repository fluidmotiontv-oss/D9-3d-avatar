import { useState } from 'react';
import { Camera, Maximize, Minimize, Eye, EyeOff, Video, Check } from 'lucide-react';

interface RecordingToolbarProps {
  isFullscreen: boolean;
  isCleanMode: boolean;
  onToggleFullscreen: () => void;
  onToggleCleanMode: () => void;
  onTakeSnapshot: () => void;
}

export function RecordingToolbar({
  isFullscreen,
  isCleanMode,
  onToggleFullscreen,
  onToggleCleanMode,
  onTakeSnapshot,
}: RecordingToolbarProps) {
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const handleSnapshotClick = () => {
    onTakeSnapshot();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-xl">
      {/* Clean Mode Toggle */}
      <button
        onClick={onToggleCleanMode}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isCleanMode
            ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750 hover:text-white'
        }`}
        title="Toggle Clean Stream Overlay View (Key: H)"
      >
        {isCleanMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        <span>{isCleanMode ? 'Show Controls' : 'Clean Stream (H)'}</span>
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white transition-all cursor-pointer"
        title="Toggle Fullscreen (Key: F)"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>

      {/* Snapshot Button */}
      <button
        onClick={handleSnapshotClick}
        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
        title="Capture Transparent PNG Avatar Snapshot"
      >
        {snapshotTaken ? <Check className="w-4 h-4 text-emerald-400" /> : <Camera className="w-4 h-4" />}
      </button>
    </div>
  );
}
