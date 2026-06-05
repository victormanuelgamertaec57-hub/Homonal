import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { Check, ShieldCheck, Star } from 'lucide-react';

declare global {
  interface Window { fbq?: (...args: any[]) => void; }
}

const generateEventId = (eventName: string) =>
  `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const trackEvent = (event: string, params?: object) => {
  const eventId = generateEventId(event);
  window.fbq?.('track', event, params, { eventID: eventId });
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

// ── Data ──────────────────────────────────────────────────────────────────────


const TESTIMONIALS = [
  {
    name: 'María Sánchez', location: 'Ciudad de México', kg: '-4 kg',
    quote: '"La verdad yo ya no creía en nada. He probado de todo... la dieta keto, el ayuno, hasta unas pastillas que me mandó mi cuñada. Nada. Con esto en la tercera semana me subí a la báscula y dije \'esto no puede ser\'. Bajé 4 kilos sin pasar un solo día de hambre. Mi esposo me preguntó qué estaba haciendo diferente."',
    img: '/testimonio-1.png',
  },
  {
    name: 'Carolina Mendoza', location: 'Bogotá, Colombia', kg: '-7 kg',
    quote: '"Yo llegué a pensar que era mi edad. Que después de los 40 el cuerpo ya no responde. Me hice el quiz casi por curiosidad... y cuando vi los resultados entendí por qué nada me había funcionado antes. En 4 semanas bajé 7 kilos. La barriga que tenía hace años. No lo puedo creer todavía."',
    img: '/testimonio-2.png',
  },
  {
    name: 'Valentina Ríos', location: 'Lima, Perú', kg: '-6 kg',
    quote: '"Me probé unos jeans que tenía guardados desde hace como dos años. Los tenía ahí como \'algún día\'. El otro día los agarré casi como chiste... y me cerraron. Lloré, ¿sabes? De verdad lloré. Le mandé foto a mi hermana de inmediato. Ella ya también está haciendo el quiz."',
    img: '/testimonio-3.png',
  },
];

const BONOS = [
  {
    img: '/bono-1.png',
    nombre: 'Guía de Alimentos Anti-Cortisol',
    desc: 'Descubre exactamente qué alimentos están elevando tu cortisol sin que lo sepas — y cuáles lo bajan desde la primera semana.',
  },
  {
    img: '/bono-2.png',
    nombre: 'Protocolo Nocturno de 5 Días',
    desc: 'Las 5 noches que resetean tu metabolismo hormonal mientras duermes. Sin ejercicio. Sin dieta. Solo mientras descansas.',
  },
  {
    img: '/bono-3.png',
    nombre: 'SOS Ansiedad por Comida',
    desc: 'Para el momento exacto en que tu cuerpo pide azúcar o harinas. El protocolo de emergencia que corta el ciclo hormonal del antojo en menos de 10 minutos.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { state } = useQuiz();
  const {
    tipoHormonal,
    eventoProximo, email, nombre,
  } = state;

  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number>>(new Set());

  const toggleTestimonial = (i: number) => {
    setExpandedTestimonials(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

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
          <span className="text-yellow-300 font-bold">🌿 Tu plan + 30% OFF está listo</span>
        </div>
        <button
          onClick={irAHotmart}
          className="relative overflow-hidden text-white px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap active:scale-95 transition-all"
          style={{ background: '#4CAF50' }}
        >
          OBTÉN MI PLAN
        </button>
      </header>

      <main className="px-5 pb-20 space-y-14 pt-6">

        {/* ── Hero / Promesa ── */}
        <FadeUp>
          <section className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-2">
              ¡Lista para ti, {nombre || 'amiga'}!
            </p>
            <h1 className="text-2xl font-black text-[#1A1A1A] mb-4 leading-tight">
              Tu plan hormonal personalizado<br />ya está listo
            </h1>
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl px-5 py-3 inline-flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="text-green-800 font-black text-base">Tu descuento del 30% está activo</span>
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

        {/* ── BLOQUE 3: Transición natural hacia el programa ── */}
        <FadeUp>
          <section style={{ background: 'white', textAlign: 'center', padding: '8px 4px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1A1A1A', marginBottom: '12px', lineHeight: 1.3 }}>
              Tu plan hormonal personalizado ya está listo
            </h2>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.65, marginBottom: '20px' }}>
              Basado en tu perfil de <strong style={{ color: '#2C1810' }}>{tipoHormonal || 'Estrés Metabólico'}</strong>, diseñamos un protocolo de 28 días específico para bajar el cortisol, reactivar tu metabolismo y eliminar la grasa abdominal hormonal — sin dietas extremas, sin ejercicio intenso.
            </p>
            <div style={{ borderTop: '1px solid #E8DDD5', paddingTop: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#666', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Esto es lo que incluye tu programa:
              </p>
            </div>
          </section>
        </FadeUp>

        {/* ── Pricing ── */}
        <FadeUp delay={0.05}>
          <section id="precios">
            <h2 className="text-xl font-black text-center mb-4 text-[#1A1A1A]">
              Obtén tu plan con un descuento mayor
            </h2>

            {/* Single price card */}
            <div className="bg-[#166534] rounded-2xl p-5 mb-5 flex flex-col items-center gap-3">
              <span className="bg-white text-green-800 font-black text-sm px-5 py-1.5 rounded-full flex items-center gap-2">
                <Check size={14} /> PRECIO DE LANZAMIENTO BETA
              </span>
              <div className="flex items-center gap-4">
                <span className="text-white font-black text-5xl leading-none">$16.99</span>
              </div>
              <p className="text-white/70 text-xs text-center">
                Precio de lanzamiento beta · Pago único · Acceso de por vida
              </p>
            </div>

            {/* ── Bonos section ── */}
            <FadeUp>
              <div style={{
                background: '#FFF8F0',
                border: '2px solid #F59E0B',
                borderRadius: '20px',
                padding: '24px 20px',
                marginBottom: '20px',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '900',
                  color: '#1A1A1A',
                  textAlign: 'center',
                  marginBottom: '4px',
                }}>
                  🎁 Bonos exclusivos incluidos con tu programa
                </h3>
                <p style={{
                  textAlign: 'center',
                  color: '#DC2626',
                  fontWeight: '700',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}>
                  ⚠️ Solo disponibles si completas tu acceso hoy
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {BONOS.map((bono, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        border: '1px solid #F3E8D0',
                      }}
                    >
                      <img
                        src={bono.img}
                        alt={bono.nombre}
                        style={{
                          width: 'clamp(120px, 22vw, 140px)',
                          height: 'auto',
                          objectFit: 'contain',
                          flexShrink: 0,
                          borderRadius: '8px',
                          alignSelf: 'center',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '800', fontSize: '14px', color: '#1A1A1A', marginBottom: '6px', lineHeight: 1.3 }}>
                          {bono.nombre}
                        </p>
                        <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.5, marginBottom: '10px' }}>
                          {bono.desc}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                            Valor: $19.99
                          </span>
                          <span style={{
                            background: '#16A34A',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            letterSpacing: '0.5px',
                          }}>
                            INCLUIDO GRATIS
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Urgencia bonos */}
                <div style={{
                  background: '#7F1D1D',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginTop: '18px',
                }}>
                  <p style={{
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    🚨 Si sales de esta página ahora, estos bonos NO estarán disponibles cuando regreses. Tu descuento y bonos expiran con esta sesión.
                  </p>
                </div>
              </div>
            </FadeUp>

            <ShimmerButton
              onClick={() => { trackEvent('AddToCart', { content_name: 'El Método Hormonal', value: 16.99, currency: 'USD' }); irAHotmart(); }}
              className="w-full py-4 rounded-full bg-[#2C1810] text-white font-black text-lg mb-3 active:scale-95 transition-transform"
            >
              Obtener mi plan con 30% OFF →
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
                '✅ Tu plan hormonal se construye en 24 horas — recibes acceso por email mañana',
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
          </section>
        </FadeUp>

        {/* ── App Preview ── */}
        <FadeUp>
          <section className="py-12 px-4 bg-white -mx-5">

            {/* Badge superior */}
            <div className="flex justify-center mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full tracking-wide uppercase">
                📧 Recibes tu acceso por email en menos de 24 horas
              </span>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-black text-center text-[#1A1A1A] mb-2 leading-tight">
              Esto es lo que recibes
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
              <p className="text-xs text-gray-400 mt-2">Acceso en 24 horas • Pago único • Sin suscripciones</p>
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

        {/* ── Credibilidad (reemplaza logos de medios) ── */}
        <FadeUp>
          <section className="text-center">
            <p className="text-xs font-bold tracking-widest text-[#666666] uppercase mb-3">
              Desarrollado con base en
            </p>
            <p className="text-base font-black text-[#2C1810] leading-snug max-w-xs mx-auto">
              Perfiles hormonales reales de mujeres latinoamericanas
            </p>
            <p className="text-xs text-[#999] mt-2">
              Programa en acceso beta — plazas limitadas esta semana
            </p>
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
                    <p
                      className={`text-xs text-[#1A1A1A] italic leading-relaxed mb-2 transition-all duration-300 ${expandedTestimonials.has(i) ? '' : 'line-clamp-3'}`}
                    >
                      {t.quote}
                    </p>
                    <button
                      onClick={() => toggleTestimonial(i)}
                      className="text-xs text-[#2C1810] font-bold underline underline-offset-2"
                    >
                      {expandedTestimonials.has(i) ? 'Ver menos' : 'Ver más'}
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

        {/* ── ¿Por qué funciona cuando todo lo demás falló? ── */}
        <FadeUp>
          <section style={{
            background: '#F5F0EB',
            borderRadius: '24px',
            padding: '28px 20px',
            border: '1px solid #E8DDD5',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '900',
              color: '#1A1A1A',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.3,
            }}>
              ¿Por qué funciona cuando todo lo demás falló?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  icon: '🔬',
                  title: 'Basado en tu perfil hormonal único',
                  desc: 'No es una dieta genérica. Cada plan se genera según tu tipo hormonal específico detectado en el quiz.',
                },
                {
                  icon: '🌎',
                  title: 'Diseñado para la mujer latinoamericana',
                  desc: 'Con alimentos reales que encuentras en cualquier mercado de México, Colombia, Argentina, Chile o Perú.',
                },
                {
                  icon: '💬',
                  title: 'Soporte ilimitado por WhatsApp',
                  desc: 'No estás sola. Tienes acceso ilimitado a soporte real — sin límite de preguntas, sin límite de tiempo.',
                },
              ].map((item, i) => (
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
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '14px', color: '#1A1A1A', marginBottom: '4px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeUp>

        {/* ── Dark CTA ── */}
        <FadeUp>
          <section className="bg-[#2C1810] rounded-3xl p-6 text-center text-white">
            <h2 className="text-xl font-black mb-1">¡Obtén resultados visibles en 4 semanas!</h2>
            <p className="text-sm opacity-80 mb-4">Programa en acceso beta — plazas limitadas esta semana</p>
            <p className="text-xs bg-white/10 rounded-full px-3 py-1 inline-block mb-4">
              ✅ PRECIO DE LANZAMIENTO BETA
            </p>
            <ShimmerButton
              onClick={() => { trackEvent('AddToCart', { content_name: 'El Método Hormonal', value: 16.99, currency: 'USD' }); irAHotmart(); }}
              className="w-full py-4 rounded-full bg-white text-[#2C1810] font-black text-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Obtener mi plan con 30% OFF →
            </ShimmerButton>
            <p className="text-xs opacity-50 mt-3">Pago único. Sin suscripciones.</p>
          </section>
        </FadeUp>

        {/* ── Guarantee ── */}
        <FadeUp>
          <section className="text-center pb-4">
            <div className="inline-flex flex-col items-center border-2 border-green-500 rounded-2xl p-6 bg-green-50 w-full max-w-sm mx-auto">
              <div style={{
                background: '#16A34A',
                borderRadius: '50%',
                width: '72px',
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ShieldCheck size={40} className="text-white" />
              </div>
              <span style={{
                background: '#16A34A',
                color: 'white',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '2px',
                padding: '4px 14px',
                borderRadius: '20px',
                marginBottom: '12px',
                display: 'inline-block',
              }}>
                GARANTÍA 30 DÍAS SIN RIESGO
              </span>
              <h3 className="font-black text-green-800 text-xl mb-3">Tu inversión está 100% protegida</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                Si en 30 días sigues el programa y no notas ningún cambio en cómo te sientes, te devolvemos cada centavo. Sin preguntas. Sin formularios. Solo escríbenos por WhatsApp.
              </p>
            </div>
          </section>
        </FadeUp>

      </main>
    </div>
  );
};
