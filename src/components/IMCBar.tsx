import React from 'react';
import { motion } from 'framer-motion';

interface IMCBarProps {
  imcValue: number;
}

const SEGMENTS = [
  { label: 'Bajo peso', color: '#60A5FA' },
  { label: 'Normal',    color: '#34D399' },
  { label: 'Sobrepeso', color: '#FBBF24' },
  { label: 'Obesidad',  color: '#F87171' },
];

const IMC_MIN = 15;
const IMC_MAX = 40;

function getCategory(imc: number) {
  if (imc < 18.5) return { label: 'Bajo peso', color: '#60A5FA' };
  if (imc < 25)   return { label: 'Normal ✅', color: '#34D399' };
  if (imc < 30)   return { label: 'Sobrepeso', color: '#FBBF24' };
  return            { label: 'Obesidad',   color: '#F87171' };
}

export const IMCBar: React.FC<IMCBarProps> = ({ imcValue }) => {
  const clamped = Math.min(Math.max(imcValue, IMC_MIN), IMC_MAX);
  const pct     = ((clamped - IMC_MIN) / (IMC_MAX - IMC_MIN)) * 100;
  const { label, color } = getCategory(imcValue);

  return (
    <div className="w-full mt-3">
      {/* Segment labels */}
      <div className="flex justify-between mb-1.5 px-0.5">
        {SEGMENTS.map(s => (
          <span key={s.label} className="text-[9px] font-bold" style={{ color: s.color }}>
            {s.label}
          </span>
        ))}
      </div>

      {/* Colored bar */}
      <div className="relative h-4 w-full rounded-full flex gap-0.5 overflow-visible">
        {SEGMENTS.map(s => (
          <motion.div
            key={s.label}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ backgroundColor: s.color, transformOrigin: 'left', opacity: 0.85 }}
            className="flex-1 h-full rounded-full"
          />
        ))}

        {/* Bouncing indicator pill */}
        <motion.div
          initial={{ left: '0%', scale: 0 }}
          animate={{ left: `calc(${pct}% - 8px)`, scale: 1 }}
          transition={{
            left:  { duration: 1.1, ease: 'easeOut', delay: 0.3 },
            scale: { type: 'spring', stiffness: 400, damping: 12, delay: 0.3 },
          }}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white border-2 border-[#2C1810] rounded-full shadow-md z-10"
        />
      </div>

      {/* Value + badge */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-3xl font-black text-[#2C1810]">{imcValue.toFixed(1)}</span>
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.6 }}
          className="text-sm font-bold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
};
