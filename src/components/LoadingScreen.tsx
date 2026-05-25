import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const TEXTS = [
  'Analizando tu perfil hormonal...',
  'Calculando tu tipo metabólico...',
  'Diseñando tu plan personalizado...',
  '¡Tu plan está casi listo!',
];

const TESTIMONIALS = [
  { name: 'María L.', text: 'Bajé 5kg en 4 semanas', stars: 5 },
  { name: 'Carolina R.', text: 'Por fin entendí mis hormonas', stars: 5 },
  { name: 'Ana P.', text: 'Me siento como nueva', stars: 5 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState<number[]>([]);
  const completedRef = useRef(false);

  const circumference = 2 * Math.PI * 44;

  // Progress timer — 3 seconds total
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(id);
          return 100;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, []);

  // Fire onComplete once, 600ms after 100%
  useEffect(() => {
    if (progress === 100 && !completedRef.current) {
      completedRef.current = true;
      const id = setTimeout(onComplete, 600);
      return () => clearTimeout(id);
    }
  }, [progress, onComplete]);

  // Show testimonials when progress > 60%
  useEffect(() => {
    if (progress >= 60 && !showTestimonials) {
      setShowTestimonials(true);
    }
  }, [progress, showTestimonials]);

  // Stagger testimonials in one by one
  useEffect(() => {
    if (!showTestimonials) return;
    TESTIMONIALS.forEach((_, i) => {
      const id = setTimeout(() => {
        setTestimonialsVisible(prev => [...prev, i]);
      }, i * 350);
      return () => clearTimeout(id);
    });
  }, [showTestimonials]);

  // Text rotation every 800ms
  useEffect(() => {
    const id = setInterval(() => {
      setTextIndex(prev => (prev + 1) % TEXTS.length);
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-[80vh] pt-10 px-6 overflow-hidden">

      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-72 h-72 bg-[#2C1810] rounded-full"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#4CAF50] rounded-full"
        />
      </div>

      {/* SVG Progress Circle */}
      <div className="relative w-36 h-36 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#E5E7EB" strokeWidth="7" />
          {/* Progress arc */}
          <motion.circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#2C1810"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            transition={{ duration: 0.1, ease: 'linear' }}
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.floor(progress / 10)}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black text-[#2C1810]"
          >
            {progress}%
          </motion.span>
          {progress === 100 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="text-green-500 text-xs font-bold"
            >
              ✓ Listo
            </motion.span>
          )}
        </div>
      </div>

      {/* Rotating text */}
      <div className="min-h-[3.5rem] mb-2 flex items-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={textIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-[#1A1A1A] text-center"
          >
            {TEXTS[textIndex]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <p className="text-[#666666] text-sm text-center mb-8">
        Personalizando tu plan de alimentación hormonal
      </p>

      {/* Testimonials — slide up after 60% */}
      <AnimatePresence>
        {showTestimonials && (
          <div className="w-full space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <AnimatePresence key={i}>
                {testimonialsVisible.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-[#F5F0EB] border border-[#E8DDD5] rounded-2xl px-4 py-3 flex items-center gap-3"
                  >
                    {/* Avatar initials */}
                    <div className="w-9 h-9 rounded-full bg-[#2C1810] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-black">{t.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#1A1A1A]">{t.name}</span>
                        <span className="text-yellow-400 text-xs">{'⭐'.repeat(t.stars)}</span>
                      </div>
                      <p className="text-xs text-[#666666] truncate">"{t.text}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
