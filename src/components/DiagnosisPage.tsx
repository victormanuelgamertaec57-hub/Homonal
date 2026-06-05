import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { IMCBar } from './IMCBar';
import { CouponOverlay } from './CouponOverlay';

interface DiagnosisPageProps {
  onContinue: () => void;
  showCoupon?: boolean;
  onCouponClaim?: () => void;
}

const FadeUp: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};

const ProgressBars: React.FC<{ filled: number; total?: number; color: string; delay?: number }> = ({
  filled, total = 3, color, delay = 0,
}) => (
  <div className="flex gap-1 mt-1.5">
    {Array.from({ length: total }, (_, i) => (
      <motion.div
        key={i}
        className="h-1.5 flex-1 rounded-full"
        style={{ backgroundColor: i < filled ? color : '#E5E7EB', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: delay + i * 0.1 }}
      />
    ))}
  </div>
);

const METRICS = [
  { icon: '🔥', label: 'Tipo hormonal',     valFn: (t: string) => t || 'Cortisol Dominante' },
  { icon: '⚡', label: 'Estilo de vida',     valFn: () => 'Activo moderado' },
  { icon: '💪', label: 'Nivel de actividad', valFn: () => 'En desarrollo' },
  { icon: '🌡️', label: 'Estado metabólico', valFn: () => 'Aceleración posible' },
];

const DIAGNOSTICOS: Record<string, { icon: string; titulo: string; texto: string }[]> = {
  'Estrés Metabólico': [
    {
      icon: '🔥',
      titulo: 'Tu cortisol está elevado',
      texto: 'Cuando el cortisol se mantiene alto, tu cuerpo activa un mecanismo de emergencia: almacena grasa abdominal como \'reserva de supervivencia\'. Por eso comes bien y no bajas.',
    },
    {
      icon: '⚡',
      titulo: 'Tu metabolismo está en modo ahorro',
      texto: 'Con estrés metabólico crónico, tu cuerpo quema hasta 40% menos calorías de lo normal. No es falta de voluntad — es química hormonal.',
    },
    {
      icon: '🌙',
      titulo: 'Tu ciclo de sueño afecta tu peso',
      texto: 'El cortisol elevado interrumpe la producción de melatonina y leptina — la hormona que le dice a tu cuerpo cuándo parar de comer. El resultado: antojos nocturnos que no puedes controlar.',
    },
  ],
  'Cortisol Dominante': [
    {
      icon: '🔥',
      titulo: 'Tu cortisol está crónicamente elevado',
      texto: 'Cuando el cortisol domina, tu cuerpo prioriza almacenar grasa abdominal como \'reserva de emergencia\'. Por eso el ejercicio y las dietas no funcionan como deberían.',
    },
    {
      icon: '⚡',
      titulo: 'Tu metabolismo está bloqueado',
      texto: 'El cortisol dominante bloquea las hormonas que regulan cuánta energía quemas. Tu cuerpo trabaja contra ti, no contigo — por eso el esfuerzo no se traduce en resultados.',
    },
    {
      icon: '🌙',
      titulo: 'Tu ritmo de cortisol interrumpe el sueño',
      texto: 'El cortisol normal baja de noche. Con cortisol dominante se mantiene alto, interrumpiendo la melatonina y creando el ciclo de insomnio, fatiga y antojos nocturnos.',
    },
  ],
  'Insulino Resistente': [
    {
      icon: '🍬',
      titulo: 'Tu insulina no está respondiendo bien',
      texto: 'Cuando las células resisten la insulina, el azúcar no llega a los músculos — se convierte directamente en grasa. Por eso sientes hambre poco después de comer.',
    },
    {
      icon: '⚡',
      titulo: 'Tus bajones de energía son metabólicos',
      texto: 'Los bajones después del almuerzo son señal clara de resistencia a la insulina. Tu cuerpo no convierte la glucosa en energía de forma eficiente — y eso frena la quema de grasa.',
    },
    {
      icon: '🌙',
      titulo: 'Los antojos de dulces tienen causa hormonal',
      texto: 'El antojo constante de dulces no es falta de disciplina — es tu insulina buscando compensación. El ciclo se rompe desde la raíz hormonal, no con fuerza de voluntad.',
    },
  ],
  'En Transición Hormonal': [
    {
      icon: '🌸',
      titulo: 'Tu cuerpo está en una transición hormonal real',
      texto: 'A partir de los 45, los niveles de estrógeno y progesterona fluctúan. Esto hace que la grasa se redistribuya hacia el abdomen aunque no hayas cambiado tus hábitos.',
    },
    {
      icon: '⚡',
      titulo: 'Tu metabolismo cambió, no tú',
      texto: 'La caída de estrógeno reduce hasta 30% la capacidad muscular de quemar glucosa. Lo que funcionaba antes ya no funciona — porque tu biología cambió, no tu disciplina.',
    },
    {
      icon: '🌙',
      titulo: 'El sueño y el peso están conectados',
      texto: 'En la transición hormonal, el sueño fragmentado eleva el cortisol y reduce la hormona de crecimiento — dos claves para quemar grasa mientras duermes.',
    },
  ],
};

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({
  onContinue,
  showCoupon = false,
  onCouponClaim,
}) => {
  const { state } = useQuiz();
  const { imc, tipoHormonal, pesoActual, pesoObjetivo, nombre } = state;

  const imcLabel = imc == null ? '—'
    : imc < 18.5 ? 'Bajo peso'
    : imc < 25   ? 'Normal'
    : imc < 30   ? 'Sobrepeso'
    : 'Obesidad';

  const imcFilledBars = imc == null ? 1
    : imc < 18.5 ? 1
    : imc < 25   ? 2
    : 3;

  const tipo = tipoHormonal || 'Estrés Metabólico';
  const bloques = DIAGNOSTICOS[tipo] ?? DIAGNOSTICOS['Estrés Metabólico'];

  return (
    <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">

      {showCoupon && onCouponClaim && (
        <CouponOverlay onClaim={onCouponClaim} />
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-[#2C1810] px-4 py-2.5 text-center">
        <span className="text-yellow-300 font-bold text-xs">
          🧬 Tu diagnóstico hormonal personalizado
        </span>
      </header>

      <main className="px-5 pb-20 space-y-10 pt-6">

        {/* Hero */}
        <FadeUp>
          <section className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-2">
              ¡Hola, {nombre || 'amiga'}!
            </p>
            <h1 className="text-2xl font-black text-[#1A1A1A] mb-6 leading-tight">
              Tu diagnóstico hormonal<br />completo está listo
            </h1>

            {/* Comparison card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#E8DDD5] shadow-xl shadow-[#2C1810]/6 mb-5 text-left">

              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderBottom: '1px solid #E5E7EB',
                background: 'white',
                borderRadius: '16px 16px 0 0',
              }}>
                <div style={{ textAlign: 'center', padding: '12px', borderRight: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#9CA3AF' }}>
                    AHORA
                  </span>
                </div>
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#9CA3AF' }}>
                    OBJETIVO
                  </span>
                </div>
              </div>

              {/* Characters */}
              <div style={{
                background: '#F5F0EB',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: '0 8px',
                minHeight: '320px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src="/chica-ahora.png"
                    alt="antes"
                    style={{ width: '140px', height: '280px', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                  />
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', padding: '8px 0' }}>
                    {pesoActual ?? '70'} kg
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '40px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src="/chica-objetivo.png"
                    alt="objetivo"
                    style={{ width: '140px', height: '280px', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                  />
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#22C55E', padding: '8px 0' }}>
                    {pesoObjetivo ?? '60'} kg
                  </span>
                </div>
              </div>

              {/* Stats panel */}
              <div className="bg-white border-t border-[#E8DDD5] p-4">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#999] uppercase tracking-wider mb-0.5">grasa corporal</p>
                    <p className="font-bold text-sm text-[#1A1A1A]">{imcLabel}</p>
                    <ProgressBars filled={imcFilledBars} color="#2C1810" delay={0.6} />
                    <p className="text-[10px] text-[#999] uppercase tracking-wider mt-3 mb-0.5">tipo hormonal</p>
                    <p className="font-bold text-sm text-[#1A1A1A] leading-tight truncate">
                      {tipoHormonal || 'Sin equilibrar'}
                    </p>
                  </div>
                  <div className="w-px bg-[#E8DDD5] flex-shrink-0 self-stretch" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#999] uppercase tracking-wider mb-0.5">grasa corporal</p>
                    <p className="font-bold text-sm text-[#22C55E]">Normal ✅</p>
                    <ProgressBars filled={3} color="#22C55E" delay={0.8} />
                    <p className="text-[10px] text-[#999] uppercase tracking-wider mt-3 mb-0.5">tipo hormonal</p>
                    <p className="font-bold text-sm text-[#22C55E]">Equilibrado ✨</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hormonal profile */}
            <div className="bg-[#F5F0EB] rounded-2xl p-4 text-left border border-[#E8DDD5]">
              <h3 className="font-black text-[#1A1A1A] mb-1 text-sm">Tu Perfil Hormonal completo</h3>
              <p className="text-xs text-[#666666] mb-3">
                Tipo: <strong className="text-[#2C1810]">{tipoHormonal || 'Metabolismo Lento'}</strong>
              </p>
              {imc && <IMCBar imcValue={imc} />}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {METRICS.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + i * 0.12 }}
                    className="bg-white rounded-xl p-3 border border-[#E8DDD5]"
                  >
                    <div className="text-base mb-0.5">{m.icon}</div>
                    <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wide">{m.label}</p>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-tight">
                      {m.valFn(tipoHormonal || '')}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeUp>

        {/* Diagnosis cards */}
        <FadeUp>
          <section style={{ background: '#F5F0E8', borderRadius: '24px', padding: '28px 20px', border: '1px solid #E8DDD5' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', marginBottom: '6px', lineHeight: 1.3 }}>
              Esto es lo que está pasando en tu cuerpo
            </h2>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px', fontWeight: 500 }}>
              Basado en tus respuestas del quiz
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bloques.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <span style={{ fontSize: '26px', flexShrink: 0, lineHeight: 1.2 }}>{b.icon}</span>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '14px', color: '#1A1A1A', marginBottom: '5px' }}>{b.titulo}</p>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.55, margin: 0 }}>{b.texto}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p style={{ marginTop: '20px', fontWeight: 800, fontSize: '14px', color: '#166534', textAlign: 'center' }}>
              ✅ La buena noticia: este patrón tiene solución específica.
            </p>
          </section>
        </FadeUp>

        {/* CTA button */}
        <FadeUp>
          <button
            onClick={onContinue}
            style={{
              width: '100%',
              padding: '18px',
              background: '#2C1810',
              color: 'white',
              borderRadius: '100px',
              fontWeight: 900,
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            Ver mi plan completo →
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Tu plan está personalizado para tu perfil hormonal
          </p>
        </FadeUp>

      </main>
    </div>
  );
};
