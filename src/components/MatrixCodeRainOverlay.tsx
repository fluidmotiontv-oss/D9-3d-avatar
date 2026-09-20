import { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface MatrixCodeRainOverlayProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  density?: number;
}

interface ColumnDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  fontSize: number;
}

const MATRIX_CHARS = '01010011001001110100010000111001010101001010101001010101010101010101010101010101010101010101010101';
const CODE_SNIPPETS = [
  '// Dragon 9: Fluid Motion Activated...',
  '// STATUS: ONLINE // 432Hz SYNC',
  '// TARGET_CARTOON: SUPER PUFF PIPELINE',
  '// SYNC_PAYLOAD: VERIFIED',
  '// D9Enigma // Formation Infinity Flow',
  '// CYBERNETICS: OPTICAL // JAW MECHANICS',
  '// FLUID_MOTION_ACTIVE // PARTICLE_FLOW: 100%',
  '// AUDIO_SYNC: ACTIVE // LATENCY: 2ms',
];

export function MatrixCodeRainOverlay({
  theme,
  audioState,
  density = 1.0,
}: MatrixCodeRainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let columns: ColumnDrop[] = [];

    const initColumns = (w: number) => {
      const colWidth = 22;
      const colCount = Math.floor((w / colWidth) * Math.min(1.5, density));
      columns = [];

      for (let i = 0; i < colCount; i++) {
        const len = 8 + Math.floor(Math.random() * 16);
        const chars: string[] = [];
        for (let j = 0; j < len; j++) {
          chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
        }

        columns.push({
          x: (i * colWidth) + (Math.random() - 0.5) * 8,
          y: Math.random() * -600,
          speed: 2 + Math.random() * 4,
          length: len,
          chars,
          fontSize: 11 + Math.floor(Math.random() * 4),
        });
      }
    };

    let snippetIndex = 0;
    let snippetTimer = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      if (columns.length === 0) {
        initColumns(w);
      }

      ctx.clearRect(0, 0, w, h);

      const vol = audioState.volume;
      const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
      const activeSpeedMultiplier = 1 + vol * 2.5 + noiseFloor * 1.5;

      // 1. Render Matrix Binary Column Streams
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed * activeSpeedMultiplier;

        if (col.y - col.length * col.fontSize > h) {
          col.y = -Math.random() * 300;
          col.speed = 2 + Math.random() * 4;
          for (let j = 0; j < col.chars.length; j++) {
            col.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }
        }

        ctx.font = `${col.fontSize}px "JetBrains Mono", monospace`;

        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * col.fontSize;
          if (charY < -20 || charY > h + 20) continue;

          const isHead = j === 0;
          const progress = j / col.length;
          const alpha = (1 - progress) * (0.3 + vol * 0.4);

          ctx.save();
          if (isHead) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = theme.energy;
            ctx.globalAlpha = Math.min(1, alpha + 0.3);
          } else {
            ctx.fillStyle = j % 3 === 0 ? theme.energy : theme.primary;
            ctx.globalAlpha = Math.max(0.05, alpha * 0.45);
          }

          // Randomly mutate chars occasionally
          if (Math.random() < 0.02) {
            col.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }

          ctx.fillText(col.chars[j], col.x, charY);
          ctx.restore();
        }
      }

      // 2. Render Floating Cyber Source Code Snippets (as seen in reference video)
      snippetTimer += 0.016;
      if (snippetTimer > 4.5) {
        snippetTimer = 0;
        snippetIndex = (snippetIndex + 1) % CODE_SNIPPETS.length;
      }

      const activeSnippet = CODE_SNIPPETS[snippetIndex];
      ctx.save();
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = theme.energy;
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.003) * 0.2 + vol * 0.3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = theme.energy;
      ctx.fillText(activeSnippet, 24, h - 36);

      // Top right status indicator snippet
      ctx.fillText('// SYNC_HZ: 432Hz // D9_PIPELINE', w - 240, 36);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        initColumns(canvas.width);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, audioState, density]);

  return (
    <canvas
      ref={canvasRef}
      id="matrix-code-rain-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
}
