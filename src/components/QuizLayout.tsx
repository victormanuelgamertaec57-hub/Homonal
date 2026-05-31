import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { ArrowLeft, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

// Step ranges for each block (used to color the 5 segments)
const BLOCKS = [
  { label: 'Mi Perfil',   start: 0,  end: 3  },
  { label: 'Mis Hábitos', start: 4,  end: 5  },
  { label: 'Mi Rutina',   start: 7,  end: 8  },
  { label: 'Mi Cuerpo',   start: 9,  end: 11 },
  { label: 'Casi Listo',  start: 12, end: 13 },
];

function getActiveBlock(step: number): number {
  // Returns index 0-4 of which block is active, or -1 if none
  for (let i = 0; i < BLOCKS.length; i++) {
    if (step >= BLOCKS[i].start && step <= BLOCKS[i].end) return i;
    if (i < BLOCKS.length - 1 && step > BLOCKS[i].end && step < BLOCKS[i + 1].start) return i;
  }
  if (step >= BLOCKS[BLOCKS.length - 1].end) return BLOCKS.length - 1;
  return -1;
}

export const QuizLayout: React.FC<QuizLayoutProps> = ({ children, title, showBack = true, onBack }) => {
  const { currentStep, prevStep } = useQuiz();
  const handleBack = onBack ?? prevStep;
  const activeBlock = getActiveBlock(currentStep);

  const showHeader = currentStep > 0 && currentStep < 99;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-sm relative flex flex-col">

        {/* Header */}
        {showHeader && (
          <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              {/* Back button */}
              <div className="w-9">
                {showBack && currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={20} className="text-[#2C1810]" />
                  </button>
                )}
              </div>

              {/* Logo center */}
              <div className="flex-1 text-center">
                <span className="text-[11px] font-black tracking-[0.15em] uppercase text-[#2C1810]">
                  El Método Hormonal
                </span>
              </div>

              {/* Hamburger */}
              <div className="w-9 flex justify-end">
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <Menu size={20} className="text-[#2C1810]" />
                </button>
              </div>
            </div>

            {/* 5-segment progress bar */}
            {activeBlock >= 0 && (
              <div className="flex gap-1.5">
                {BLOCKS.map((block, i) => (
                  <div key={block.label} className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#2C1810]"
                      initial={{ width: 0 }}
                      animate={{ width: i <= activeBlock ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Block label */}
            {title && (
              <p className="text-[10px] text-[#666666] font-semibold tracking-widest uppercase mt-1.5 text-center">
                {title}
              </p>
            )}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 flex flex-col px-6 pt-6 pb-32 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
