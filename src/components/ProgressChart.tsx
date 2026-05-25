import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis,
  CartesianGrid, ReferenceDot,
} from 'recharts';
import { motion } from 'framer-motion';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ProgressChartProps {
  pesoActual: number;
  pesoObjetivo: number;
  semanas: number;
  nombre?: string;
  onContinue: () => void;
}

// ── "AHORA" dot — tooltip extends to the right ────────────────────────────────
const AhoraDot: React.FC<{ cx?: number; cy?: number; pesoActual: number }> = ({
  cx, cy, pesoActual,
}) => {
  if (cx == null || cy == null) return null;
  const W = 70, H = 34;
  const tx = cx, ty = cy - H - 10;
  return (
    <g>
      {/* Tooltip bubble */}
      <rect x={tx} y={ty} width={W} height={H} rx={8} fill="#EF4444" />
      <text x={tx + W / 2} y={ty + 12} textAnchor="middle"
        fill="rgba(255,255,255,0.85)" fontSize={9} fontWeight="bold" fontFamily="Inter, sans-serif">
        AHORA
      </text>
      <text x={tx + W / 2} y={ty + 27} textAnchor="middle"
        fill="white" fontSize={13} fontWeight="900" fontFamily="Inter, sans-serif">
        {pesoActual} kg
      </text>
      {/* Arrow pointing down to dot */}
      <polygon points={`${tx + 8},${ty + H} ${tx + 18},${ty + H} ${tx + 13},${ty + H + 7}`}
        fill="#EF4444" />
      {/* Dot */}
      <circle cx={cx} cy={cy} r={5} fill="#EF4444" stroke="white" strokeWidth={2} />
    </g>
  );
};

// ── "Después" dot — tooltip extends to the left ───────────────────────────────
const DespuesDot: React.FC<{ cx?: number; cy?: number; pesoObjetivo: number }> = ({
  cx, cy, pesoObjetivo,
}) => {
  if (cx == null || cy == null) return null;
  const W = 90, H = 34;
  const tx = cx - W, ty = cy - H - 10;
  return (
    <g>
      {/* Pulsing ring */}
      <circle cx={cx} cy={cy} r={8} fill="#22C55E" opacity={0.25}>
        <animate attributeName="r" from="8" to="18" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.25" to="0" dur="1.4s" repeatCount="indefinite" />
      </circle>
      {/* Dot */}
      <circle cx={cx} cy={cy} r={5} fill="#22C55E" stroke="white" strokeWidth={2} />
      {/* Tooltip bubble */}
      <rect x={tx} y={ty} width={W} height={H} rx={8} fill="#1A1A1A" />
      <text x={tx + W / 2} y={ty + 12} textAnchor="middle"
        fill="rgba(255,255,255,0.72)" fontSize={9} fontWeight="bold" fontFamily="Inter, sans-serif">
        Después 4 sem.
      </text>
      <text x={tx + W / 2} y={ty + 27} textAnchor="middle"
        fill="#22C55E" fontSize={13} fontWeight="900" fontFamily="Inter, sans-serif">
        {pesoObjetivo} kg
      </text>
      {/* Arrow pointing down to dot */}
      <polygon points={`${tx + W - 18},${ty + H} ${tx + W - 8},${ty + H} ${tx + W - 13},${ty + H + 7}`}
        fill="#1A1A1A" />
    </g>
  );
};

// ── Full-screen component ─────────────────────────────────────────────────────
export const ProgressChart: React.FC<ProgressChartProps> = ({
  pesoActual, pesoObjetivo, semanas, nombre, onContinue,
}) => {
  const cappedSemanas = Math.min(Math.max(semanas, 1), 4);
  const diff = pesoActual > pesoObjetivo ? pesoActual - pesoObjetivo : 0;
  const stepSize = diff / cappedSemanas;

  const data = Array.from({ length: cappedSemanas + 1 }, (_, i) => ({
    semana: i === 0 ? 'Hoy' : `Sem ${i}`,
    peso: parseFloat((pesoActual - stepSize * i).toFixed(1)),
  }));

  const lastKey = `Sem ${cappedSemanas}`;
  const endPeso = data[data.length - 1].peso;
  const pesoDropLabel = Math.abs(pesoActual - endPeso).toFixed(1);

  return (
    <div className="w-full max-w-[640px] mx-auto min-h-screen bg-[#FAF8F5] flex flex-col px-5 pt-10 pb-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-2">
          Tu plan personalizado
        </p>
        <h1 className="text-[1.65rem] font-black text-[#1A1A1A] leading-tight">
          {nombre ? <>{nombre}, </> : null}tu plan hormonal<br />
          <span className="text-[#2C1810]">de 4 semanas está listo</span>
        </h1>
      </motion.div>

      {/* ── Chart card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="bg-white rounded-3xl p-5 mb-4"
        style={{ boxShadow: '0 8px 40px rgba(44,24,16,0.10)' }}
      >
        <p className="text-sm font-bold text-[#1A1A1A] mb-0.5">Proyección de resultados</p>
        <p className="text-xs text-[#666666] mb-5">Calculada según tu perfil hormonal único</p>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 58, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pcLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#F87171" />
                  <stop offset="50%"  stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
                <linearGradient id="pcAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22C55E" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F0EC" />
              <XAxis
                dataKey="semana"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#aaa', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              {/* No YAxis — clean BetterMe look */}
              <Area
                type="monotone"
                dataKey="peso"
                stroke="url(#pcLineGrad)"
                strokeWidth={3.5}
                fill="url(#pcAreaGrad)"
                dot={false}
                activeDot={false}
                isAnimationActive={true}
                animationDuration={1400}
                animationEasing="ease-out"
              />

              <ReferenceDot
                x="Hoy"
                y={pesoActual}
                shape={<AhoraDot pesoActual={pesoActual} />}
              />
              <ReferenceDot
                x={lastKey}
                y={endPeso}
                shape={<DespuesDot pesoObjetivo={endPeso} />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Summary row ── */}
        <div className="flex justify-between items-center pt-4 border-t border-[#F3F0EC]">
          <div>
            <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide mb-0.5">Peso hoy</p>
            <p className="text-xl font-black text-[#EF4444]">{pesoActual} kg</p>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-black px-3 py-1.5 rounded-full">
              ↓ {pesoDropLabel} kg en 4 sem.
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#999] uppercase font-bold tracking-wide mb-0.5">Tu meta</p>
            <p className="text-xl font-black text-[#22C55E]">{endPeso} kg</p>
          </div>
        </div>
      </motion.div>

      {/* ── Legal note ── */}
      <p className="text-[10px] text-[#aaa] text-center mb-6 px-2 leading-relaxed">
        *Proyección basada en pérdida de 0.5–1 kg/semana con el Método Hormonal. Los resultados individuales pueden variar según factores hormonales, adherencia y estilo de vida.
      </p>

      <div className="flex-1" />

      {/* ── CONTINUAR ── */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="w-full py-4 rounded-full bg-[#2C1810] text-white font-black text-lg"
      >
        CONTINUAR →
      </motion.button>
    </div>
  );
};
