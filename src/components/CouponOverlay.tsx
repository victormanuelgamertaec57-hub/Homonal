import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CouponOverlayProps {
  onClaim: () => void;
}

const PARTICLE_POSITIONS = [
  { left: '10%', top: '20%' },
  { left: '85%', top: '15%' },
  { left: '5%',  top: '60%' },
  { left: '90%', top: '55%' },
  { left: '20%', top: '85%' },
  { left: '75%', top: '80%' },
  { left: '50%', top: '5%'  },
  { left: '50%', top: '95%' },
];

export const CouponOverlay: React.FC<CouponOverlayProps> = ({ onClaim }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [revealed, setRevealed] = useState(false);
  const [boxShadow, setBoxShadow] = useState('0 4px 20px rgba(201,168,76,0.3)');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!revealed) return;

    // Confetti explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#BF953F', '#FCF6BA', '#B38728', '#FFF', '#C9A84C'],
      startVelocity: 45,
      gravity: 0.8,
      ticks: 200,
    });

    // Button pulse
    let toggle = false;
    const id = setInterval(() => {
      toggle = !toggle;
      setBoxShadow(
        toggle
          ? '0 4px 40px rgba(201,168,76,0.8)'
          : '0 4px 20px rgba(201,168,76,0.3)'
      );
    }, 1800);
    return () => clearInterval(id);
  }, [revealed]);

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
        if (cleared / (canvas.width * canvas.height) > 0.6) {
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
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #0F0F0F 0%, #1A1A1A 50%, #0F0F0F 100%)',
          borderRadius: '24px',
          padding: '28px 20px',
          maxWidth: '340px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(201,168,76,0.5)',
          boxShadow: '0 0 60px rgba(201,168,76,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Floating ✨ particles on reveal */}
        {revealed && PARTICLE_POSITIONS.map((pos, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: -60 }}
            transition={{ duration: 1.2, delay: i * 0.1 }}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              fontSize: '20px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            ✨
          </motion.span>
        ))}

        {/* Timer header */}
        <p style={{
          color: 'rgba(201,168,76,0.7)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          margin: '0 0 4px',
        }}>
          OFERTA EXPIRA EN
        </p>

        {/* Timer digits — metallic gold gradient text */}
        <p
          style={{
            background: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728, #FBF5B7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '4rem',
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '4px',
            margin: '0 0 20px',
            lineHeight: 1,
          }}
        >
          {mm}:{ss}
        </p>

        {/* Exclusive badge */}
        <div
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #AA771C 100%)',
            borderRadius: '9999px',
            padding: '6px 22px',
            marginBottom: '20px',
          }}
        >
          <span style={{
            color: '#1A1A1A',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '3px',
          }}>
            ★ EXCLUSIVO PARA TI ★
          </span>
        </div>

        {/* Scratch / reveal area */}
        <div
          style={{
            position: 'relative',
            marginBottom: '22px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #242424 100%)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
        >
          {/* Content underneath gold layer */}
          <div
            style={{
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              Tu descuento especial
            </p>

            {/* 30% — spring entry + glow pulse */}
            <motion.p
              initial={{ scale: 0, rotate: -15, opacity: 0 }}
              animate={revealed
                ? {
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    textShadow: [
                      '0 0 20px rgba(201,168,76,0.4)',
                      '0 0 60px rgba(201,168,76,0.9)',
                      '0 0 20px rgba(201,168,76,0.4)',
                    ],
                  }
                : { scale: 1, rotate: 0, opacity: 1 }
              }
              transition={revealed
                ? {
                    scale: { type: 'spring', stiffness: 300, damping: 15 },
                    rotate: { type: 'spring', stiffness: 300, damping: 15 },
                    opacity: { duration: 0.3 },
                    textShadow: { duration: 1.5, repeat: Infinity, delay: 0.5 },
                  }
                : { duration: 0 }
              }
              style={{
                background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 60%, #FBF5B7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '5rem',
                fontWeight: 900,
                lineHeight: 1,
                margin: 0,
              }}
            >
              30%
            </motion.p>

            <p style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 800, letterSpacing: '3px', margin: 0 }}>
              DE DESCUENTO
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '6px 0 0' }}>
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
          /* Layered gold button with pulse animation */
          <div
            style={{
              background: 'linear-gradient(to bottom, #917100, #EAD98F)',
              borderRadius: '9999px',
              padding: '1.5px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(to bottom, #FFFDDD, #856807, #FFF1B3)',
                borderRadius: '9999px',
                padding: '2px',
              }}
            >
              <button
                onClick={onClaim}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(to bottom, #FFEBA1, #9B873F)',
                  color: '#3D2B00',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  boxShadow: boxShadow,
                  transition: 'box-shadow 0.6s ease',
                }}
              >
                ¡Reclamar mi 30% OFF! →
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
            Raspa el área dorada para revelar tu descuento
          </p>
        )}
      </div>
    </div>
  );
};
