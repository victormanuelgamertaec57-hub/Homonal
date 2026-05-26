import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { IMCBar } from './IMCBar';
import { Check, ShieldCheck, Star } from 'lucide-react';

declare global {
  interface Window { fbq?: (...args: any[]) => void; }
}

const trackEvent = (event: string, params?: object) => {
  window.fbq?.('track', event, params);
};

// ── Fade-up wrapper ────────────────────────────────────────────────────────
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

// ── Flip Timer ─────────────────────────────────────────────────────────────
const FlipDigit: React.FC<{ value: string }> = ({ value }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: 90, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="inline-block font-mono font-black"
      style={{ display: 'inline-block' }}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const FlipTimer: React.FC<{ initialSeconds: number }> = ({ initialSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  return (
    <span className="text-white text-sm font-black tabular-nums">
      <FlipDigit value={m[0]} /><FlipDigit value={m[1]} />
      <span className="mx-0.5">:</span>
      <FlipDigit value={s[0]} /><FlipDigit value={s[1]} />
    </span>
  );
};

// ── Shimmer CTA ────────────────────────────────────────────────────────────
const ShimmerButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({
  onClick, children, className = '',
}) => (
  <button onClick={onClick} className={`relative overflow-hidden ${className}`}>
    <motion.div
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
      className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
    />
    {children}
  </button>
);

// ── Animated progress bar ─────────────────────────────────────────────────
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


// ── Data ──────────────────────────────────────────────────────────────────────

const PLANS = [
  { key: '1_week'   as const, label: 'Acceso de 1 semana',   priceOld: '$27.99', price: '$19.99', perDay: '$2.85/día', popular: false },
  { key: '4_weeks'  as const, label: 'Acceso de 4 semanas',  priceOld: '$47.99', price: '$17.99', perDay: '$0.64/día', popular: true  },
  { key: '12_weeks' as const, label: 'Acceso de 12 semanas', priceOld: '$67.99', price: '$27.99', perDay: '$0.33/día', popular: false },
];

const TESTIMONIALS = [
  {
    name: 'María S.', location: 'Ciudad de México', kg: '-5 kg',
    quote: '"Nunca pensé que comiendo más iba a bajar de peso. El método hormonal me cambió la vida."',
    img: '/testimonio-1.png',
  },
  {
    name: 'Carolina M.', location: 'Bogotá, Colombia', kg: '-7 kg',
    quote: '"El cortisol era mi enemigo sin saberlo. En 4 semanas bajé la barriga hormonal."',
    img: '/testimonio-2.png',
  },
  {
    name: 'Valentina R.', location: 'Lima, Perú', kg: '-6 kg',
    quote: '"Me puse los jeans que llevaban 2 años guardados. ¡Esto funciona de verdad!"',
    img: '/testimonio-3.png',
  },
];

const METRICS = [
  { icon: '🔥', label: 'Tipo hormonal',     valFn: (t: string) => t || 'Cortisol Dominante' },
  { icon: '⚡', label: 'Estilo de vida',     valFn: () => 'Activo moderado' },
  { icon: '💪', label: 'Nivel de actividad', valFn: () => 'En desarrollo' },
  { icon: '🌡️', label: 'Estado metabólico', valFn: () => 'Aceleración posible' },
];

// ─────────────────────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { state } = useQuiz();
  const {
    imc, tipoHormonal, pesoActual, pesoObjetivo,
    eventoProximo, email, nombre,
  } = state;

  const [selectedPlan, setSelectedPlan] = useState<'1_week' | '4_weeks' | '12_weeks'>('4_weeks');

  // Derived values
  const firstNameUpper = nombre ? nombre.split(' ')[0].toUpperCase() : 'USUARIA';
  const discountCode   = `${firstNameUpper}_MAY26`;
  const finalCode      = `${firstNameUpper}_FINAL`;


  const imcLabel = imc == null ? '—'
    : imc < 18.5 ? 'Bajo peso'
    : imc < 25   ? 'Normal'
    : imc < 30   ? 'Sobrepeso'
    : 'Obesidad';

  const imcFilledBars = imc == null ? 1
    : imc < 18.5 ? 1
    : imc < 25   ? 2
    : 3;

  const irAHotmart = () => {
    const url = `https://pay.hotmart.com/I105994163R?checkoutMode=10&name=${encodeURIComponent(nombre || '')}&email=${encodeURIComponent(email || '')}`;
    window.open(url, '_blank');
  };

  useEffect(() => { trackEvent('Lead'); }, []);

  const scrollToPrecios = () => {
    document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-[640px] mx-auto bg-white min-h-screen">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-[#2C1810] px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="text-xs text-white/80 font-medium">
          ⏳ Tu descuento expira en: <FlipTimer initialSeconds={600} />
        </div>
        <ShimmerButton
          onClick={irAHotmart}
          className="bg-[#4CAF50] text-white px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap hover:bg-green-600 active:scale-95 transition-all"
        >
          OBTÉN MI PLAN
        </ShimmerButton>
      </header>

      {/* ── Barra cupos limitados ── */}
      <div style={{
        background: '#1A0A05',
        color: 'white',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        ⚡ Solo quedan <span style={{color: '#FFD700', fontWeight: '900'}}>23 cupos</span> disponibles esta semana ·{' '}
        <span style={{color: '#FFD700'}}>77 mujeres ya activaron su acceso</span>
      </div>

      <main className="px-5 pb-20 space-y-14 pt-6">

        {/* ── Hero / Promesa ── */}
        <FadeUp>
          <section className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-2">
              ¡Lista para ti, {nombre || 'amiga'}!
            </p>
            <h1 className="text-2xl font-black text-[#1A1A1A] mb-6 leading-tight">
              Tu plan hormonal personalizado<br />ya está listo
            </h1>

            {/* ── BetterMe-style comparison card ── */}
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
                {/* Chica AHORA */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src="/chica-ahora.png"
                    alt="antes"
                    style={{
                      width: '140px',
                      height: '280px',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', padding: '8px 0' }}>
                    {pesoActual ?? '70'} kg
                  </span>
                </div>

                {/* Flechas centro */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '40px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                  <span style={{ color: '#9CA3AF', fontSize: '22px', lineHeight: 1 }}>›</span>
                </div>

                {/* Chica OBJETIVO */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src="/chica-objetivo.png"
                    alt="objetivo"
                    style={{
                      width: '140px',
                      height: '280px',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#22C55E', padding: '8px 0' }}>
                    {pesoObjetivo ?? '60'} kg
                  </span>
                </div>
              </div>

              {/* Stats panel */}
              <div className="bg-white border-t border-[#E8DDD5] p-4">
                <div className="flex gap-4">
                  {/* Before stats */}
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
                  {/* After stats */}
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

            {/* IMC strip */}
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

        {/* ── Evento badge ── */}
        {eventoProximo && eventoProximo.length > 0 && eventoProximo[0] !== '✅ No tengo eventos próximos' && (
          <FadeUp>
            <div className="flex justify-center">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-1.5 rounded-full">
                🏆 Justo a tiempo para {eventoProximo[0]}
              </span>
            </div>
          </FadeUp>
        )}

        {/* ── Pricing ── */}
        <FadeUp delay={0.05}>
          <section id="precios">
            <h2 className="text-xl font-black text-center mb-4 text-[#1A1A1A]">
              Obtén tu plan con un descuento mayor
            </h2>

            {/* Promo badge + timer */}
            <div className="bg-[#166534] rounded-2xl p-4 mb-5 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-white/50 line-through">{discountCode}</span>
                <span className="text-white text-xs opacity-60">→</span>
                <span className="font-mono text-sm font-black text-white bg-white/15 px-3 py-0.5 rounded-full">
                  {finalCode}
                </span>
              </div>
              <span className="bg-white text-green-800 font-black text-sm px-4 py-1 rounded-full flex items-center gap-1.5">
                <Check size={13} /> 30% OFF aplicado
              </span>
              <div className="text-white/75 text-xs flex items-center gap-1.5">
                ⏳ Este precio expira en: <FlipTimer initialSeconds={595} />
              </div>
            </div>

            {/* Plan cards */}
            <div className="flex flex-col gap-3 mb-5">
              {PLANS.map(plan => (
                <motion.div
                  key={plan.key}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => { setSelectedPlan(plan.key); trackEvent('InitiateCheckout', { value: 17.99, currency: 'USD' }); }}
                  className={`relative rounded-2xl p-4 cursor-pointer border-2 transition-all flex items-center gap-4
                    ${selectedPlan === plan.key
                      ? 'border-[#2C1810] bg-[#F5F0EB] shadow-lg shadow-[#2C1810]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${selectedPlan === plan.key ? 'border-[#2C1810]' : 'border-gray-300'}`}
                  >
                    {selectedPlan === plan.key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2C1810]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {plan.popular && (
                      <p className="text-[10px] font-black text-[#2C1810] uppercase tracking-widest mb-0.5">✅ Más popular</p>
                    )}
                    <p className={`font-bold text-sm ${selectedPlan === plan.key ? 'text-[#1A1A1A]' : 'text-[#555]'}`}>
                      {plan.label}
                    </p>
                    <p className="text-xs text-[#999]">{plan.perDay}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs line-through text-[#bbb]">{plan.priceOld}</p>
                    <p className={`font-black text-2xl leading-tight ${selectedPlan === plan.key ? 'text-[#2C1810]' : 'text-[#1A1A1A]'}`}>
                      {plan.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <ShimmerButton
              onClick={() => { trackEvent('AddToCart', { content_name: 'El Método Hormonal', value: 17.99, currency: 'USD' }); irAHotmart(); }}
              className="w-full py-4 rounded-full bg-[#2C1810] text-white font-black text-lg mb-3 active:scale-95 transition-transform"
            >
              OBTENER MI PROGRAMA →
            </ShimmerButton>
            <p className="text-center text-xs text-[#999]">
              Pago único. Sin suscripciones ocultas. Sin cargos automáticos.
            </p>
          </section>
        </FadeUp>

        {/* ── PIN de acceso ── */}
        <FadeUp>
          <section style={{
            background: '#F5F0EB',
            borderRadius: '20px',
            padding: '32px 20px',
            textAlign: 'center',
            border: '2px solid #2C1810'
          }}>
            {/* Badge superior */}
            <span style={{
              background: '#2C1810',
              color: 'white',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '2px',
              padding: '6px 16px',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              🔐 ACCESO EXCLUSIVO
            </span>

            <h3 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#1A1A1A',
              margin: '16px 0 8px'
            }}>
              Tu código de activación<br />personal ya está reservado
            </h3>

            <p style={{
              color: '#666',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              Al completar tu compra recibirás inmediatamente tu código único de acceso
            </p>

            {/* El código */}
            <div style={{
              background: '#1A0A05',
              borderRadius: '16px',
              padding: '20px',
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              <p style={{
                color: '#888',
                fontSize: '11px',
                letterSpacing: '3px',
                marginBottom: '8px',
                margin: '0 0 8px'
              }}>TU CÓDIGO DE ACTIVACIÓN</p>
              <p style={{
                color: '#FFD700',
                fontSize: '28px',
                fontWeight: '900',
                letterSpacing: '6px',
                fontFamily: 'monospace',
                margin: 0
              }}>EMH-BETA-2026</p>
            </div>

            {/* Features del acceso */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              textAlign: 'left',
              marginTop: '16px'
            }}>
              {[
                '✅ Acceso activado en 24-48 horas por email',
                '✅ Plan hormonal día por día',
                '✅ Tracker inteligente con IA',
                '✅ Recetas latinas personalizadas',
                '✅ Soporte directo por WhatsApp',
              ].map(item => (
                <p key={item} style={{
                  fontSize: '14px',
                  color: '#1A1A1A',
                  fontWeight: '500',
                  margin: 0
                }}>{item}</p>
              ))}
            </div>

            {/* Urgencia cupos */}
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '12px',
              padding: '12px',
              marginTop: '20px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#92400E',
                fontWeight: '700',
                margin: 0
              }}>
                ⚠️ Solo 23 códigos de activación disponibles esta semana. Una vez agotados el precio sube a $47.99
              </p>
            </div>
          </section>
        </FadeUp>

        {/* ── App Preview ── */}
        <FadeUp>
          <section className="py-12 px-4 bg-white -mx-5">

            {/* Badge superior */}
            <div className="flex justify-center mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full tracking-wide uppercase">
                ✓ Acceso inmediato después del pago
              </span>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-black text-center text-[#1A1A1A] mb-2 leading-tight">
              Esto es lo que recibes
              <span className="text-[#2C1810]"> hoy mismo</span>
            </h2>
            <p className="text-center text-gray-500 mb-10 text-sm">
              Sin descargas. Sin apps. Funciona en cualquier dispositivo desde el navegador.
            </p>

            {/* Mockup principal */}
            <div className="relative flex justify-center mb-10">

              {/* Teléfono principal */}
              <motion.div
                className="relative z-10"
                style={{ width: '220px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
              >
                <div
                  className="bg-[#1A1A1A] rounded-[36px] p-3 shadow-2xl"
                  style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
                >
                  <div className="bg-[#1A1A1A] w-16 h-5 rounded-full mx-auto mb-2 relative z-10" />
                  <div className="bg-[#FAF8F5] rounded-[28px] overflow-hidden" style={{ height: '380px' }}>

                    {/* Header de la app */}
                    <div className="bg-[#2C1810] px-4 py-3 flex items-center justify-between">
                      <span className="text-white text-xs font-bold">El Método Hormonal</span>
                      <div className="w-6 h-6 bg-white/20 rounded-full" />
                    </div>

                    {/* Contenido: Dashboard */}
                    <div className="p-3 space-y-2">
                      <div>
                        <p className="text-[10px] text-gray-400">Buenos días,</p>
                        <p className="text-sm font-black text-[#2C1810]">Día 3 de 28 🔥</p>
                      </div>

                      <div className="bg-gray-100 rounded-full h-2">
                        <div className="bg-[#2C1810] h-2 rounded-full" style={{ width: '12%' }} />
                      </div>
                      <p className="text-[9px] text-gray-400">12% completado</p>

                      <div className="bg-[#2C1810] rounded-xl p-3 text-white">
                        <p className="text-[9px] opacity-70 uppercase tracking-wide">HOY</p>
                        <p className="text-xs font-bold mt-1">🍳 Desayuno hormonal</p>
                        <p className="text-[9px] opacity-80 mt-1">Huevos con aguacate y semillas</p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-white/20 text-[8px] px-2 py-0.5 rounded-full">Alto en proteína</span>
                          <span className="bg-white/20 text-[8px] px-2 py-0.5 rounded-full">15 min</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { label: 'Proteína', val: '45g',   color: 'text-green-600' },
                          { label: 'Cortisol', val: '↓ bajo', color: 'text-blue-600' },
                          { label: 'Energía',  val: '↑ alta', color: 'text-orange-500' },
                        ].map(s => (
                          <div key={s.label} className="bg-white rounded-lg p-1.5 text-center shadow-sm">
                            <p className={`text-[9px] font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white rounded-xl overflow-hidden shadow-sm flex">
                        <img
                          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=80&fit=crop"
                          alt="receta"
                          className="w-16 h-16 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-[9px] font-bold text-[#1A1A1A]">Almuerzo: Bowl de quinoa</p>
                          <p className="text-[8px] text-gray-400 mt-0.5">con pollo y vegetales</p>
                          <span className="text-[8px] text-green-600 font-semibold">✓ Anti-cortisol</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Teléfono secundario (solo sm+) */}
              <motion.div
                className="absolute right-4 top-8 z-0 hidden sm:block"
                style={{ width: '190px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
              >
                <div
                  className="bg-[#1A1A1A] rounded-[30px] p-2.5 shadow-xl opacity-90"
                  style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                >
                  <div className="bg-[#FAF8F5] rounded-[24px] overflow-hidden" style={{ height: '340px' }}>

                    <div className="bg-[#2C1810] px-3 py-2.5">
                      <span className="text-white text-[10px] font-bold">Mi Plan — Semana 1</span>
                    </div>

                    <div className="p-3 space-y-1.5">
                      {[
                        { dia: 'Lun', comida: 'Desayuno hormonal',  done: true  },
                        { dia: 'Mar', comida: 'Bowl anti-cortisol', done: true  },
                        { dia: 'Mié', comida: 'Proteína + grasas',  done: false },
                        { dia: 'Jue', comida: 'Reset metabólico',   done: false },
                        { dia: 'Vie', comida: 'Cena equilibrante',  done: false },
                      ].map(d => (
                        <div
                          key={d.dia}
                          className={`flex items-center gap-2 p-2 rounded-lg ${d.done ? 'bg-green-50' : 'bg-white'} shadow-sm`}
                        >
                          <span className="text-[9px] font-bold text-gray-400 w-6">{d.dia}</span>
                          <span className="text-[9px] text-gray-700 flex-1">{d.comida}</span>
                          <span className={`text-[10px] ${d.done ? 'text-green-500' : 'text-gray-200'}`}>✓</span>
                        </div>
                      ))}

                      <div className="mt-3 bg-[#2C1810] rounded-xl p-2 text-white text-center">
                        <p className="text-[9px] opacity-70">Tu progreso esta semana</p>
                        <p className="text-sm font-black">-0.8 kg 🎉</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                '🗓️ Plan día por día',
                '🍽️ Recetas latinas',
                '📊 Tracker de progreso',
                '💡 Guía hormonal',
                '🔥 Reset 7 días',
                '✅ Sin app que descargar',
              ].map(f => (
                <span
                  key={f}
                  className="bg-[#F5F0EB] text-[#2C1810] text-xs font-semibold px-3 py-2 rounded-full border border-[#E8DDD5]"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={scrollToPrecios}
                className="bg-[#2C1810] text-white font-bold px-8 py-4 rounded-full text-sm shadow-lg active:scale-95 transition-transform"
              >
                Ver mi plan completo →
              </button>
              <p className="text-xs text-gray-400 mt-2">Acceso inmediato • Pago único • Sin suscripciones</p>
            </div>
          </section>
        </FadeUp>

        {/* ── What's included ── */}
        <FadeUp>
          <section className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E8DDD5]">
            <h2 className="text-lg font-black mb-4 text-[#1A1A1A]">Los puntos fuertes de tu programa</h2>
            <ul className="space-y-4">
              {[
                { icon: '📋', title: 'Plan nutricional hormonal personalizado', desc: 'Cada comida diseñada para tu perfil hormonal único' },
                { icon: '🍽️', title: 'Recetas latinas altas en proteína',       desc: 'Baja de peso disfrutando los sabores que amas' },
                { icon: '🥄', title: 'Instrucciones paso a paso',                desc: 'Con ingredientes que encuentras en cualquier mercado' },
                { icon: '💡', title: 'Guía de alimentos hormonales',             desc: 'Para eliminar la grasa abdominal de origen hormonal' },
                { icon: '🎁', title: 'BONO: Reset de 7 días',                    desc: 'El protocolo de emergencia que activa tu quema de grasa' },
              ].map(item => (
                <li key={item.title} className="flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <strong className="block text-sm text-[#1A1A1A]">{item.title}</strong>
                    <span className="text-xs text-[#666666]">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </FadeUp>

        {/* ── Media logos ── */}
        <FadeUp>
          <section className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#666666] uppercase mb-4">Tal como se presenta en</p>
            <div className="flex justify-center gap-5 items-center opacity-40 grayscale flex-wrap">
              {['Forbes', 'Healthline', "Women's Health", 'Glamour'].map(m => (
                <span key={m} className="font-black text-sm text-[#1A1A1A]">{m}</span>
              ))}
            </div>
          </section>
        </FadeUp>

        {/* ── Testimonios — 3 columnas horizontales (estilo BetterMe) ── */}
        <FadeUp>
          <section>
            <h2 className="text-xl font-black text-center mb-5 text-[#1A1A1A]">
              Resultados que nos llenan de orgullo
            </h2>

            {/* Horizontal scroll — 3 portrait cards */}
            <div className="flex gap-3 -mx-5 px-5 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex-none w-[196px] rounded-2xl overflow-hidden border border-[#E8DDD5] bg-white shadow-sm snap-start"
                >
                  {/* Image — full width, full natural height, no crop */}
                  <div className="relative">
                    <img
                      src={t.img}
                      alt={`Antes y después — ${t.name}`}
                      className="w-full block"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                    <span className="absolute bottom-2 left-2 bg-[#EF4444] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                      Antes
                    </span>
                    <span className="absolute bottom-2 right-2 bg-[#22C55E] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                      Después
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <p className="font-black text-sm text-[#1A1A1A]">
                      {t.name}, <span className="text-[#22C55E]">{t.kg}</span>
                    </p>
                    <p className="text-[10px] text-[#666666] mb-1.5">{t.location}</p>
                    <div className="flex text-yellow-400 mb-1.5">
                      {Array(5).fill(0).map((_, j) => <Star key={j} fill="currentColor" size={11} />)}
                    </div>
                    <p className="text-xs text-[#1A1A1A] italic leading-relaxed mb-2 line-clamp-3">{t.quote}</p>
                    <button className="text-xs text-[#2C1810] font-bold underline underline-offset-2">
                      Ver más
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-[#999] text-center mt-3">
              *Los resultados individuales pueden variar. Experiencias reales de usuarias.
            </p>
          </section>
        </FadeUp>

        {/* ── Dark CTA ── */}
        <FadeUp>
          <section className="bg-[#2C1810] rounded-3xl p-6 text-center text-white">
            <h2 className="text-xl font-black mb-1">¡Obtén resultados visibles en 4 semanas!</h2>
            <p className="text-sm opacity-80 mb-4">Únete a 47.000+ mujeres que ya transformaron sus hormonas</p>
            <p className="text-xs bg-white/10 rounded-full px-3 py-1 inline-block mb-4">
              ✅ Código <span className="font-mono">{finalCode}</span> aplicado
            </p>
            <ShimmerButton
              onClick={() => { trackEvent('AddToCart', { content_name: 'El Método Hormonal', value: 17.99, currency: 'USD' }); irAHotmart(); }}
              className="w-full py-4 rounded-full bg-white text-[#2C1810] font-black text-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              OBTENER MI PROGRAMA →
            </ShimmerButton>
            <p className="text-xs opacity-50 mt-3">Pago único. Sin suscripciones.</p>
          </section>
        </FadeUp>

        {/* ── Guarantee ── */}
        <FadeUp>
          <section className="text-center pb-4">
            <div className="inline-flex flex-col items-center border-2 border-green-500 rounded-2xl p-6 bg-green-50 max-w-xs">
              <ShieldCheck size={48} className="text-green-600 mb-3" />
              <h3 className="font-black text-green-800 text-lg mb-2">Garantía de 30 días</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Si sigues el programa y no ves resultados, te devolvemos tu dinero. Sin preguntas.
              </p>
            </div>
          </section>
        </FadeUp>

      </main>
    </div>
  );
};
