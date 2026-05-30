import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  onReveal: () => void;
  discountCode: string; // kept for API compatibility
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onReveal }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed,      setRevealed]      = useState(false);
  const [autoRevealing, setAutoRevealing] = useState(false);
  const [countdown,     setCountdown]     = useState<number | null>(null);
  const [particles,     setParticles]     = useState<Particle[]>([]);
  const isDrawing     = useRef(false);
  const revealedRef   = useRef(false);
  const particleIdRef = useRef(0);

  // ── Fire confetti + start 3-s countdown ──────────────────────────────────
  const doReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setRevealed(true);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#D4AF37', '#FFD700', '#B8860B', '#22C55E', '#ffffff'],
    });

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

  // ── Draw golden metallic overlay ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Metallic gold gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0,    '#D4AF37');
    grad.addColorStop(0.25, '#FFD700');
    grad.addColorStop(0.5,  '#B8860B');
    grad.addColorStop(0.75, '#FFD700');
    grad.addColorStop(1,    '#D4AF37');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal shine streaks
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    for (let i = -canvas.height; i < canvas.width + canvas.height; i += 18) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    // Instruction text
    ctx.fillStyle = 'rgba(44,24,16,0.82)';
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👆  Raspa aquí', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(44,24,16,0.6)';
    ctx.fillText('para revelar tu descuento', canvas.width / 2, canvas.height / 2 + 14);
  }, []);

  // ── Pointer helpers ──────────────────────────────────────────────────────
  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches.length > 0) {
      return {
        x:    (e.touches[0].clientX - rect.left) * scaleX,
        y:    (e.touches[0].clientY - rect.top)  * scaleY,
        relX: e.touches[0].clientX - rect.left,
        relY: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return {
      x:    (me.clientX - rect.left) * scaleX,
      y:    (me.clientY - rect.top)  * scaleY,
      relX: me.clientX - rect.left,
      relY: me.clientY - rect.top,
    };
  };

  // ── Spawn golden particles at scratch position ───────────────────────────
  const addParticles = useCallback((relX: number, relY: number) => {
    const spawned: Particle[] = Array.from({ length: 4 }, () => ({
      id:  particleIdRef.current++,
      x:   relX + (Math.random() - 0.5) * 24,
      y:   relY + (Math.random() - 0.5) * 24,
      dx:  (Math.random() - 0.5) * 44,
      dy:  -(Math.random() * 44 + 8),
    }));
    setParticles(prev => [...prev.slice(-30), ...spawned]);
    setTimeout(() => {
      const ids = new Set(spawned.map(p => p.id));
      setParticles(prev => prev.filter(p => !ids.has(p.id)));
    }, 700);
  }, []);

  // ── Scratch handler ──────────────────────────────────────────────────────
  const scratchAt = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || revealed || autoRevealing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, relX, relY } = getPos(e, canvas);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);    // 40 px brush radius
    ctx.fill();

    addParticles(relX, relY);

    // Auto-reveal at 60% cleared
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
    }
    if (transparent / (data.length / 4) > 0.6) {
      setAutoRevealing(true);
      setTimeout(doReveal, 400);
    }
  }, [revealed, autoRevealing, doReveal, addParticles]);

  return (
    <>
      {/* Keyframe for gold particle float */}
      <style>{`
        @keyframes goldFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--pDx), var(--pDy)) scale(0); opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-sm mx-auto select-none">
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{
            borderRadius: '16px',
            border: '2px solid #D4AF37',
            boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            minHeight: '300px',
          }}
        >
          {/* ── Revealed content (dark green) ── */}
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ background: '#1B4332', minHeight: '300px', padding: '32px 24px' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
              🎉 ¡Felicidades! Tu descuento es:
            </p>
            <p style={{ color: 'white', fontWeight: 900, fontSize: '68px', lineHeight: 1, marginBottom: '8px' }}>
              30% OFF
            </p>
            <p style={{ color: 'white', fontWeight: 900, fontSize: '26px', marginBottom: '10px' }}>
              $16.99 USD
            </p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>
              Solo por raspar — válido ahora
            </p>
            {countdown !== null && (
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontWeight: 700, marginTop: '16px' }}>
                Continuando en {countdown}s...
              </p>
            )}
          </div>

          {/* ── Golden particles ── */}
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x,
                top:  p.y,
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFE55C, #B8860B)',
                pointerEvents: 'none',
                zIndex: 10,
                ['--pDx' as string]: `${p.dx}px`,
                ['--pDy' as string]: `${p.dy}px`,
                animation: 'goldFloat 0.7s ease-out forwards',
              }}
            />
          ))}

          {/* ── Canvas scratch overlay ── */}
          <canvas
            ref={canvasRef}
            width={320}
            height={300}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            style={{
              transition: 'opacity 0.5s ease',
              opacity: revealed || autoRevealing ? 0 : 1,
              pointerEvents: revealed || autoRevealing ? 'none' : 'auto',
            }}
            onMouseDown={() => { isDrawing.current = true; }}
            onMouseUp={()   => { isDrawing.current = false; }}
            onMouseLeave={() => { isDrawing.current = false; }}
            onMouseMove={scratchAt}
            onTouchStart={e => { e.preventDefault(); isDrawing.current = true; }}
            onTouchEnd={() => { isDrawing.current = false; }}
            onTouchMove={e => { e.preventDefault(); scratchAt(e); }}
          />
        </div>

        {/* Fallback */}
        {!revealed && !autoRevealing && (
          <button
            onClick={doReveal}
            className="mt-2 w-full text-center text-xs text-[#999] underline underline-offset-2"
          >
            ¿No puedes raspar? Toca aquí
          </button>
        )}
      </div>
    </>
  );
};
