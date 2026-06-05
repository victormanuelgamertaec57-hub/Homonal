import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CouponOverlayProps {
  onClaim: () => void;
}

export const CouponOverlay: React.FC<CouponOverlayProps> = ({ onClaim }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#D4A017');
    grad.addColorStop(0.5, '#FFD700');
    grad.addColorStop(1, '#C9A84C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(100, 65, 0, 0.65)';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  RASPA AQUÍ  ✦', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(100, 65, 0, 0.45)';
    ctx.fillText('para revelar tu descuento', canvas.width / 2, canvas.height / 2 + 14);
  }, []);

  const doScratch = useCallback(
    (clientX: number, clientY: number) => {
      if (revealed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();
      strokesRef.current++;
      if (strokesRef.current % 8 === 0) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let cleared = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 128) cleared++;
        }
        if (cleared / (canvas.width * canvas.height) > 0.4) {
          setRevealed(true);
        }
      }
    },
    [revealed]
  );

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.87)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#1C0D05',
          borderRadius: '24px',
          padding: '28px 20px',
          maxWidth: '340px',
          width: '100%',
          textAlign: 'center',
          border: '2px solid #C9A84C',
          boxShadow: '0 0 50px rgba(201,168,76,0.25)',
        }}
      >
        {/* Timer */}
        <p style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', margin: '0 0 4px' }}>
          OFERTA EXPIRA EN
        </p>
        <p style={{ color: '#FFD700', fontSize: '42px', fontWeight: 900, fontFamily: 'monospace', margin: '0 0 20px', letterSpacing: '4px' }}>
          {mm}:{ss}
        </p>

        {/* Exclusive badge */}
        <div
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #C9A84C 0%, #FFD700 100%)',
            borderRadius: '100px',
            padding: '6px 22px',
            marginBottom: '20px',
          }}
        >
          <span style={{ color: '#1C0D05', fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>
            ★ EXCLUSIVO PARA TI ★
          </span>
        </div>

        {/* Scratch area */}
        <div
          style={{
            position: 'relative',
            marginBottom: '22px',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Content underneath gold layer */}
          <div
            style={{
              background: '#2D1810',
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              Tu descuento especial
            </p>
            <p style={{ color: '#FFD700', fontSize: '64px', fontWeight: 900, lineHeight: 1, margin: 0 }}>
              30%
            </p>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: 800, letterSpacing: '1px', margin: 0 }}>
              DE DESCUENTO
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '6px 0 0' }}>
              Aplicado automáticamente
            </p>
          </div>

          {/* Canvas scratch overlay */}
          {!revealed && (
            <canvas
              ref={canvasRef}
              width={300}
              height={168}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                cursor: 'crosshair',
                touchAction: 'none',
              }}
              onPointerDown={e => {
                isDrawingRef.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                doScratch(e.clientX, e.clientY);
              }}
              onPointerMove={e => {
                if (isDrawingRef.current) doScratch(e.clientX, e.clientY);
              }}
              onPointerUp={() => { isDrawingRef.current = false; }}
              onPointerCancel={() => { isDrawingRef.current = false; }}
            />
          )}
        </div>

        {revealed ? (
          <button
            onClick={onClaim}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #C9A84C 0%, #FFD700 100%)',
              color: '#1C0D05',
              borderRadius: '100px',
              fontWeight: 900,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            ¡Reclamar mi 30% OFF! →
          </button>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
            Raspa el área dorada para revelar tu descuento
          </p>
        )}
      </div>
    </div>
  );
};
