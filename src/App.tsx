import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { QuizLayout } from './components/QuizLayout';
import { QuizStep } from './components/QuizStep';
import { OptionCard } from './components/OptionCard';
import { MultiSelect } from './components/MultiSelect';
import { ScaleInput } from './components/ScaleInput';
import { NumberInput } from './components/NumberInput';
import { LandingPage } from './components/LandingPage';
import { LoadingScreen } from './components/LoadingScreen';
import { ProgressChart } from './components/ProgressChart';
import { ScratchCard } from './components/ScratchCard';
import { MotivationalScreen } from './components/MotivationalScreen';
import { calculateIMC, determineHormonalType, calculateProjection } from './utils/calculations';

import { AgeCards } from './components/AgeCards';
// ─── Motivational screen data ─────────────────────────────────────────────
const MOTIVATIONAL = [
  {
    step: 7, // appears at this step number (between Perfil → Alimentación)
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    stat: 'El 78% de las mujeres latinas que cambian su alimentación hormonal pierden más de 4kg en las primeras 4 semanas.',
    message: 'Tu entorno hormonal importa más que las calorías que consumes',
  },
  {
    step: 14, // between Alimentación → Actividad
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    stat: 'Las mujeres con cortisol equilibrado queman 3x más grasa abdominal sin aumentar el ejercicio.',
    message: 'No es fuerza de voluntad. Es química hormonal.',
  },
  {
    step: 19, // between Actividad → Estilo de Vida
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
    stat: 'Solo 7 horas de sueño aumentan la quema de grasa hormonal en un 40%.',
    message: 'Tu cuerpo se transforma mientras duermes',
  },
];



// ─── Step titles ──────────────────────────────────────────────────────────
function getStepTitle(step: number) {
  if (step === 0 || step === 1) return '';
  if (step >= 2 && step <= 6) return 'MI PERFIL';
  if (step === 7) return ''; // motivacional
  if (step >= 8 && step <= 13) return 'ALIMENTACIÓN';
  if (step === 14) return ''; // motivacional
  if (step >= 15 && step <= 18) return 'ACTIVIDAD';
  if (step === 19) return ''; // motivacional
  if (step >= 20 && step <= 23) return 'ESTILO DE VIDA';
  return 'CASI LISTO';
}

// ─── Shared CTA button ────────────────────────────────────────────────────
const ContinueBtn = ({
  onClick,
  disabled,
  label = 'CONTINUAR',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`w-full py-4 rounded-full font-bold text-lg active:scale-95
      ${disabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-[#2C1810] text-white hover:opacity-90'
      }`}
    style={{
      opacity: disabled ? 0.4 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'opacity 300ms ease, background-color 300ms ease, color 300ms ease, transform 100ms ease',
    }}
  >
    {label}
  </button>
);


// ─── Main quiz router ─────────────────────────────────────────────────────
const QuizRouter: React.FC = () => {
  const { currentStep, nextStep, prevStep, state, updateState, setStep } = useQuiz();
  const [showLoading, setShowLoading] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const handleNext = () => { setDirection('forward'); nextStep(); };
  const handleBack = () => { setDirection('back'); prevStep(); };

  const handleFinalCalculate = () => {
    const imcData = calculateIMC(state.pesoActual || 70, state.estatura || 160);
    const tipo = determineHormonalType(state);
    const proy = calculateProjection(state.pesoActual || 70, state.pesoObjetivo || 60, 28);
    updateState({
      imc: imcData.value,
      tipoHormonal: tipo,
      pesoEstimadoEvento: proy.pesoEstimadoEvento,
      semanasSolucion: proy.semanasSolucion,
    });
    setShowLoading(true);
  };

  // Loading overlay
  if (showLoading) {
    return (
      <QuizLayout title="" showBack={false}>
        <LoadingScreen onComplete={() => { setShowLoading(false); setStep(97); }} />
      </QuizLayout>
    );
  }

  // Step 97: Weight projection chart (full screen, post-quiz)
  if (currentStep === 97) {
    return (
      <ProgressChart
        pesoActual={state.pesoActual ?? 70}
        pesoObjetivo={state.pesoObjetivo ?? 60}
        semanas={state.semanasSolucion ?? 4}
        nombre={state.nombre}
        onContinue={() => setStep(98)}
      />
    );
  }

  // Step 98: Scratch card screen (full screen, post-quiz)
  if (currentStep === 98) {
    const firstName = (state.nombre || 'USUARIA').split(' ')[0].toUpperCase();
    const code = `${firstName}_MAY26`;
    return (
      <div className="w-full max-w-[640px] mx-auto min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-5 py-10">
        <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-2">
          🎰 ¡Tu premio está aquí!
        </p>
        <h2 className="text-2xl font-black text-center text-[#1A1A1A] mb-2">
          🎁 ¡Raspa tu descuento!
        </h2>
        <p className="text-sm text-[#666666] text-center mb-6">Raspa para revelar tu descuento secreto</p>
        <ScratchCard
          onReveal={() => setStep(99)}
          discountCode={code}
        />
      </div>
    );
  }

  // Step 99: Landing page (after quiz + chart + scratch card)
  if (currentStep === 99) {
    return <LandingPage />;
  }

  return (
    <QuizLayout
      title={getStepTitle(currentStep)}
      showBack={currentStep > 0 && currentStep < 99}
      onBack={handleBack}
    >
      <AnimatePresence mode="wait">
        <QuizStep key={currentStep} direction={direction}>
          {renderStep(currentStep, state, updateState, handleNext, handleFinalCalculate)}
        </QuizStep>
      </AnimatePresence>
    </QuizLayout>
  );
};

// ─── Step renderer ────────────────────────────────────────────────────────
function renderStep(
  step: number,
  state: any,
  update: (p: any) => void,
  next: () => void,
  finish: () => void
) {
  const singleSelect = (key: string, val: string | number) => {
    update({ [key]: val });
    setTimeout(next, 280);
  };

  const multiToggle = (key: string, val: string, exclusive?: string[]) => {
    const current: string[] = state[key] || [];
    const isExclusive =
      exclusive?.includes(val) ||
      val === '✅ Ninguno de estos' ||
      val === '✅ No tengo eventos próximos' ||
      val === 'Ninguna';

    if (isExclusive) {
      update({ [key]: current.includes(val) ? [] : [val] });
    } else {
      const filtered = current.filter(
        i => i !== '✅ Ninguno de estos' && i !== '✅ No tengo eventos próximos' && i !== 'Ninguna'
      );
      update({
        [key]: filtered.includes(val) ? filtered.filter(i => i !== val) : [...filtered, val],
      });
    }
  };

  // ── MOTIVATIONAL SCREENS ───────────────────────────────────────────────
  const motivational = MOTIVATIONAL.find(m => m.step === step);
  if (motivational) {
    return (
      <MotivationalScreen
        imageUrl={motivational.imageUrl}
        stat={motivational.stat}
        message={motivational.message}
        onContinue={next}
      />
    );
  }

  switch (step) {
    // ── STEP 0: Age selection ──────────────────────────────────────────
    case 0: {
      const selectedAge = state.ageGroup as string | undefined;
      const handleAgeSelect = (label: string) => {
        update({ ageGroup: label });
        setTimeout(next, 400);
      };

      return (
        <AgeCards
          selectedAge={selectedAge}
          onSelect={handleAgeSelect}
        />
      );
    }


    // ── STEP 1: Social proof ───────────────────────────────────────────
    case 1:
      return (
        <div className="flex flex-col h-full items-center text-center">
          <p className="text-xs font-bold tracking-widest text-[#2C1810] uppercase mb-4">
            Únete a nuestra comunidad
          </p>
          <h2 className="text-3xl font-black mb-2 text-[#1A1A1A]">Más de 47.000</h2>
          <h2 className="text-3xl font-black mb-2 text-[#1A1A1A]">mujeres latinas</h2>
          <p className="text-lg text-[#666666] mb-6">ya recuperaron el control de sus hormonas</p>

          <div className="w-full rounded-3xl overflow-hidden mb-6 relative" style={{ height: 240 }}>
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
              alt="Mujeres latinas felices"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/40 to-transparent" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {[
              { val: '47K+', desc: 'Usuarias' },
              { val: '4.8★', desc: 'Calificación' },
              { val: '28d', desc: 'Resultados' },
            ].map(s => (
              <div key={s.val} className="bg-[#F5F0EB] rounded-2xl py-3 px-2 text-center">
                <p className="font-black text-[#2C1810] text-xl">{s.val}</p>
                <p className="text-xs text-[#666666]">{s.desc}</p>
              </div>
            ))}
          </div>

          <ContinueBtn onClick={next} />
        </div>
      );

    // ── STEP 2: Main goal ──────────────────────────────────────────────
    case 2:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Cuál es tu objetivo principal?</h2>
          <p className="text-sm text-[#666666] mb-6">Elige el que más te representa</p>
          {['🏃 Perder peso hormonal', '💪 Tonificar mi cuerpo', '🌱 Desarrollar hábitos saludables', '✨ Mejorar mi bienestar general'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.objetivo === opt} onClick={() => singleSelect('objetivo', opt)} />
          ))}
        </div>
      );

    // ── STEP 3: Current body ───────────────────────────────────────────
    case 3:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Cómo describes tu cuerpo actualmente?</h2>
          <p className="text-sm text-[#666666] mb-6">Se honesta contigo misma — sin juicios aquí</p>
          {['Delgada', 'Media', 'Con curvas', 'Sobrepeso importante'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.cuerpoActual === opt} onClick={() => singleSelect('cuerpoActual', opt)} />
          ))}
        </div>
      );

    // ── STEP 4: Dream body ─────────────────────────────────────────────
    case 4:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Cuál es el cuerpo de tus sueños?</h2>
          <p className="text-sm text-[#666666] mb-6">Tu meta nos ayuda a personalizar tu plan</p>
          {['Delgada', 'Tonificada', 'Con curvas y definición', 'Media'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.cuerpoSoñado === opt} onClick={() => singleSelect('cuerpoSoñado', opt)} />
          ))}
        </div>
      );

    // ── STEP 5: Weight evolution ───────────────────────────────────────
    case 5:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cómo evoluciona tu peso generalmente?</h2>
          {['Subo rápido y bajo muy lento', 'Subo y bajo con facilidad', 'Me cuesta subir o ganar músculo'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.evolucionPeso === opt} onClick={() => singleSelect('evolucionPeso', opt)} />
          ))}
        </div>
      );

    // ── STEP 6: Last time feeling good ────────────────────────────────
    case 6:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuándo fue la última vez que te sentiste bien en tu cuerpo?</h2>
          {['Hace menos de 1 año', 'Hace 1 a 2 años', 'Hace más de 3 años', 'Nunca me he sentido bien'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.ultimaVezBien === opt} onClick={() => singleSelect('ultimaVezBien', opt)} />
          ))}
        </div>
      );

    // ── STEP 7: Motivational (between blocks) — handled above ──────────

    // ── STEP 8: Meals per day ──────────────────────────────────────────
    case 8:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuántas veces comes al día?</h2>
          {['2 veces', '3 veces', '4 o más', 'Depende del día'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.comidasDia === opt} onClick={() => singleSelect('comidasDia', opt)} />
          ))}
        </div>
      );

    // ── STEP 9: Lunch/dinner type ──────────────────────────────────────
    case 9:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Qué comes normalmente en almuerzo o cena?</h2>
          {['🌮 Arroz, frijoles, tortillas o arepas', '🥗 Sopas o ensaladas', '🍔 Comida rápida o frituras', '🔀 De todo un poco'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.tipoAlmuerzo === opt} onClick={() => singleSelect('tipoAlmuerzo', opt)} />
          ))}
        </div>
      );

    // ── STEP 10: Cook time ─────────────────────────────────────────────
    case 10:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuánto tiempo tienes para cocinar al día?</h2>
          {['⏱ Menos de 30 min', '⏱ 30-60 min', '⏱ Más de 1 hora', '⏱ No cocino, no tengo tiempo'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.tiempoCocina === opt} onClick={() => singleSelect('tiempoCocina', opt)} />
          ))}
        </div>
      );

    // ── STEP 11: Bad habits (multi) ────────────────────────────────────
    case 11:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Con qué hábitos luchas más?</h2>
          <p className="text-sm text-[#666666] mb-5">Puedes elegir varios</p>
          {['😢 Comer por estrés o emociones', '🌙 Comer de noche sin control', '⏭ Saltarme comidas por ocupada', '😴 Comer sin concentración (TV, celular)', '🔁 Hacer dieta y luego recaer', '✅ Ninguno de estos'].map(opt => (
            <MultiSelect key={opt} label={opt} selected={state.habitosMalos.includes(opt)} onClick={() => multiToggle('habitosMalos', opt)} />
          ))}
          <ContinueBtn onClick={next} disabled={state.habitosMalos.length === 0} label="PRÓXIMA ETAPA" />
        </div>
      );

    // ── STEP 12: Cravings (multi) ──────────────────────────────────────
    case 12:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Qué antojos te dominan más?</h2>
          <p className="text-sm text-[#666666] mb-5">Puedes elegir varios</p>
          {['🍫 Dulces y chocolates', '🧂 Snacks salados', '🍟 Comida rápida o frita', '🥤 Bebidas azucaradas o gaseosas', '✅ Ninguno de estos'].map(opt => (
            <MultiSelect key={opt} label={opt} selected={state.antojos.includes(opt)} onClick={() => multiToggle('antojos', opt)} />
          ))}
          <ContinueBtn onClick={next} disabled={state.antojos.length === 0} label="PRÓXIMA ETAPA" />
        </div>
      );

    // ── STEP 13: Scale — relapse ───────────────────────────────────────
    case 13:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-2 text-[#1A1A1A]">
            "Como bien un tiempo y luego vuelvo a mis viejos hábitos"
          </h2>
          <p className="text-sm text-[#666666] mb-2">¿Cuánto te identifica esto?</p>
          <ScaleInput value={state.escalaRecaida} onChange={val => singleSelect('escalaRecaida', val)} />
        </div>
      );

    // ── STEP 14: Motivational (between blocks) — handled above ─────────

    // ── STEP 15: Exercise frequency ────────────────────────────────────
    case 15:
      return (
        <div className="flex flex-col h-full">
          {/* Decorative image */}
          <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ height: 160 }}>
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"
              alt="Mujer ejercitando"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Con qué frecuencia haces ejercicio?</h2>
          {['Casi todos los días', 'Varias veces a la semana', 'Varias veces al mes', 'Casi nunca'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.frecuenciaEjercicio === opt} onClick={() => singleSelect('frecuenciaEjercicio', opt)} />
          ))}
        </div>
      );

    // ── STEP 16: Body zones (multi) ────────────────────────────────────
    case 16:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Cuáles son tus zonas que más quieres trabajar?</h2>
          <p className="text-sm text-[#666666] mb-5">Puedes elegir varias</p>
          {['🔥 Vientre / abdomen', '🍑 Glúteos', '🦵 Piernas y muslos', '💪 Brazos y pecho'].map(opt => (
            <MultiSelect key={opt} label={opt} selected={state.zonasCuerpo.includes(opt)} onClick={() => multiToggle('zonasCuerpo', opt)} />
          ))}
          <ContinueBtn onClick={next} disabled={state.zonasCuerpo.length === 0} label="PRÓXIMA ETAPA" />
        </div>
      );

    // ── STEP 17: Limitations (multi) ───────────────────────────────────
    case 17:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">¿Tienes alguna limitación física?</h2>
          <p className="text-sm text-[#666666] mb-5">Personalizaremos tu plan según esto</p>
          {['🔙 Espalda sensible', '🦵 Rodillas sensibles', '✅ Ninguna limitación'].map(opt => (
            <MultiSelect key={opt} label={opt} selected={state.limitacionesFisicas.includes(opt)} onClick={() => multiToggle('limitacionesFisicas', opt)} />
          ))}
          <ContinueBtn onClick={next} disabled={state.limitacionesFisicas.length === 0} label="PRÓXIMA ETAPA" />
        </div>
      );

    // ── STEP 18: Cardio level ──────────────────────────────────────────
    case 18:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Te cansas subiendo escaleras?</h2>
          {['Me agito tanto que no puedo hablar', 'Me agito levemente pero puedo hablar', 'Estoy bien después de un tramo', 'Puedo subir varios pisos sin problema'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.nivelCardio === opt} onClick={() => singleSelect('nivelCardio', opt)} />
          ))}
        </div>
      );

    // ── STEP 19: Motivational (between blocks) — handled above ─────────

    // ── STEP 20: Work schedule ─────────────────────────────────────────
    case 20:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuáles son tus horarios?</h2>
          {['💻 De 9am a 5pm — trabajo de oficina', '🎨 Horarios flexibles — trabajo independiente', '🌙 Trabajo nocturno o turnos rotativos', '🏠 Estoy en casa / no trabajo actualmente'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.horarios === opt} onClick={() => singleSelect('horarios', opt)} />
          ))}
        </div>
      );

    // ── STEP 21: Energy levels ─────────────────────────────────────────
    case 21:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cómo son tus niveles de energía durante el día?</h2>
          {['🔴 Baja energía todo el día, siempre cansada', '🟡 Bajón fuerte después del almuerzo', '🟠 Lenta y pesada antes de comer', '🟢 Alta y regular durante todo el día'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.nivelEnergia === opt} onClick={() => singleSelect('nivelEnergia', opt)} />
          ))}
        </div>
      );

    // ── STEP 22: Sleep ─────────────────────────────────────────────────
    case 22:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuántas horas duermes normalmente?</h2>
          {['Menos de 5 horas', '5-6 horas', '7-8 horas', 'Más de 8 horas'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.horasSueño === opt} onClick={() => singleSelect('horasSueño', opt)} />
          ))}
        </div>
      );

    // ── STEP 23: Water ─────────────────────────────────────────────────
    case 23:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuánta agua tomas al día?</h2>
          {['☕ Solo café o té, casi no tomo agua', '🥛 Unos 2 vasos (500ml)', '💧 2 a 6 vasos (500-1500ml)', '💧💧 Más de 6 vasos (más de 1.5L)'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.consumoAgua === opt} onClick={() => singleSelect('consumoAgua', opt)} />
          ))}
        </div>
      );

    // ── STEP 24: Main reason ───────────────────────────────────────────
    case 24:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-6 text-[#1A1A1A]">¿Cuál es tu principal razón para querer recuperar tu figura?</h2>
          {['💃 Tener más confianza en mi cuerpo', '⚡ Sentirme más saludable y con energía', '👗 Volver a ponerme mi ropa favorita', '👶 Recuperarme después del embarazo', '🏆 Otra razón personal'].map(opt => (
            <OptionCard key={opt} label={opt} selected={state.razonPrincipal === opt} onClick={() => singleSelect('razonPrincipal', opt)} />
          ))}
        </div>
      );

    // ── STEP 25: Height ────────────────────────────────────────────────
    case 25:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-2 text-center text-[#1A1A1A]">¿Cuál es tu estatura?</h2>
          <p className="text-sm text-[#666666] text-center mb-2">Necesitamos esto para calcular tu IMC</p>
          <NumberInput
            value={state.estatura}
            onChange={val => update({ estatura: val })}
            unit="cm"
            toggleUnit="ft"
            siblingValue={state.pesoActual}
            siblingType="height"
            min={140}
            max={210}
          />
          <div className="mt-auto">
            <ContinueBtn
              onClick={next}
              disabled={!state.estatura || state.estatura < 140 || state.estatura > 210}
              label="PRÓXIMA ETAPA"
            />
          </div>
        </div>
      );

    // ── STEP 26: Current weight ────────────────────────────────────────
    case 26:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-2 text-center text-[#1A1A1A]">¿Cuál es tu peso actual?</h2>
          <p className="text-sm text-[#666666] text-center mb-2">Es confidencial y solo lo usamos para tu plan</p>
          <NumberInput
            value={state.pesoActual}
            onChange={val => update({ pesoActual: val })}
            unit="kg"
            toggleUnit="lbs"
            siblingValue={state.estatura}
            siblingType="weight"
            min={40}
            max={200}
          />
          <div className="mt-auto">
            <ContinueBtn
              onClick={next}
              disabled={!state.pesoActual || state.pesoActual < 40 || state.pesoActual > 200}
              label="PRÓXIMA ETAPA"
            />
          </div>
        </div>
      );

    // ── STEP 27: Goal weight ───────────────────────────────────────────
    case 27:
      return (
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-black mb-2 text-center text-[#1A1A1A]">¿Cuál es tu peso objetivo?</h2>
          <p className="text-sm text-[#666666] text-center mb-2">¿A dónde quieres llegar en 4 semanas?</p>
          <NumberInput
            value={state.pesoObjetivo}
            onChange={val => update({ pesoObjetivo: val })}
            unit="kg"
            toggleUnit="lbs"
            min={40}
            max={150}
          />
          <div className="mt-auto">
            <ContinueBtn
              onClick={next}
              disabled={!state.pesoObjetivo || state.pesoObjetivo < 40 || state.pesoObjetivo > 150}
              label="PRÓXIMA ETAPA"
            />
          </div>
        </div>
      );

    // ── STEP 28: Email ─────────────────────────────────────────────────
    case 28:
      return (
        <div className="flex flex-col h-full items-center text-center">
          <div className="w-16 h-16 bg-[#F5F0EB] rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-black mb-1 text-[#1A1A1A]">Introduce tu correo para recibir</h2>
          <h3 className="text-xl font-black text-[#2C1810] mb-6">tu plan hormonal personalizado.</h3>

          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={state.email}
            onChange={e => update({ email: e.target.value })}
            className="w-full text-center text-lg font-medium border-b-2 border-gray-300 focus:border-[#2C1810] outline-none py-3 mb-4 bg-transparent transition-colors"
            style={{ fontSize: '16px' }} // prevents iOS zoom
          />

          <p className="text-xs text-[#666666] mb-8 flex items-center gap-1">
            🔒 Respetamos tu privacidad y protegemos tus datos personales.
          </p>

          <ContinueBtn onClick={next} disabled={!state.email.includes('@') || !state.email.includes('.')} />
        </div>
      );

    // ── STEP 29: Name ──────────────────────────────────────────────────
    case 29:
      return (
        <div className="flex flex-col h-full items-center text-center">
          <div className="w-16 h-16 bg-[#F5F0EB] rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-3xl font-black mb-2 text-[#1A1A1A]">¿Cómo te llamas?</h2>
          <p className="text-sm text-[#666666] mb-8">Personalizaremos tu plan con tu nombre</p>

          <input
            type="text"
            placeholder="Tu nombre"
            value={state.nombre}
            onChange={e => update({ nombre: e.target.value })}
            className="w-full text-center text-2xl font-black text-[#2C1810] border-b-4 border-gray-300 focus:border-[#2C1810] outline-none py-3 mb-10 bg-transparent transition-colors"
            style={{ fontSize: '24px' }}
          />

          <ContinueBtn onClick={finish} disabled={state.nombre.length < 2} label="CREAR MI PLAN" />
        </div>
      );

    // ── DEFAULT: Skip to finish ────────────────────────────────────────
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-[#666666] text-sm">Paso {step}</p>
          <ContinueBtn onClick={finish} label="FINALIZAR QUIZ" />
        </div>
      );
  }
}

// ─── Root ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <QuizProvider>
      <QuizRouter />
    </QuizProvider>
  );
}

export default App;
