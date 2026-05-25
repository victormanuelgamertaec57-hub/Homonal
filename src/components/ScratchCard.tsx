import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  onReveal: () => void;
  discountCode: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReveal, discountCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);

  // ── Fire confetti + start 3s countdown ──────────────────────────────────
  const doReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setRevealed(true);

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#2C1810', '#4CAF50', '#FBBF24', '#F87171', '#60A5FA'],
    });

    // 3-second countdown then fire parent callback
    let n = 3;
    setCountdown(n);
    const id = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        onReveal();
      }
    }, 1000);
  }, [onReveal]);

  // ── Draw initial scratch overlay ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background fill
    ctx.fillStyle = '#2C1810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle crosshatch texture
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 12) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 12) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // Instruction text
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👆  Raspa aquí para revelar', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('tu descuento especial', canvas.width / 2, canvas.height / 2 + 14);
  }, []);

  // ── Pointer utilities ────────────────────────────────────────────────────
  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const me = e as React.MouseEvent;
    return { x: (me.clientX - rect.left) * scaleX, y: (me.clientY - rect.top) * scaleY };
  };

  const scratchAt = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    // Check threshold
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
    }
    if (transparent / (data.length / 4) > 0.6) doReveal();
  }, [revealed, doReveal]);

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      {/* Revealed content layer */}
      <div ref={containerRef} className="relative rounded-2xl overflow-hidden border-2 border-[#2C1810]">
        <div className="bg-[#F5F0EB] px-6 py-7 text-center">
          <p className="text-5xl font-black text-[#2C1810] mb-1">30%</p>
          <p className="text-base font-bold text-[#1A1A1A] mb-3">de descuento aplicado 🎉</p>
          <div className="bg-white border border-[#2C1810]/20 rounded-xl px-5 py-2 inline-block shadow-sm">
            <span className="font-mono font-black text-green-700 tracking-wider text-sm">
              {discountCode}
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-2">✅ Se aplica automáticamente al checkout</p>

          {/* Countdown */}
          {countdown !== null && (
            <div className="mt-3 text-xs font-bold text-[#666666]">
              Continuando en {countdown}s...
            </div>
          )}
        </div>

        {/* Canvas scratch overlay */}
        <canvas
          ref={canvasRef}
          width={320}
          height={160}
          className={`absolute inset-0 w-full h-full cursor-crosshair touch-none transition-opacity duration-500
            ${revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onMouseDown={() => { isDrawing.current = true; }}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
          onMouseMove={scratchAt}
          onTouchStart={e => { e.preventDefault(); isDrawing.current = true; }}
          onTouchEnd={() => { isDrawing.current = false; }}
          onTouchMove={e => { e.preventDefault(); scratchAt(e); }}
        />
      </div>

      {/* Fallback tap */}
      {!revealed && (
        <button
          onClick={doReveal}
          className="mt-2 w-full text-center text-xs text-[#999] underline underline-offset-2"
        >
          ¿No puedes raspar? Toca aquí
        </button>
      )}
    </div>
  );
};
