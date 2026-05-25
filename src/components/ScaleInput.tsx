import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScaleInputProps {
  value: number;
  onChange: (val: number) => void;
  labelMin?: string;
  labelMax?: string;
}

export const ScaleInput: React.FC<ScaleInputProps> = ({
  value,
  onChange,
  labelMin = 'Nada que ver conmigo',
  labelMax = 'Me describe perfectamente',
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [shake, setShake] = useState<number | null>(null);

  const handleClick = (opt: number) => {
    onChange(opt);
    // Simulate haptic feedback with a quick shake
    setShake(opt);
    setTimeout(() => setShake(null), 300);
  };

  const getOpacity = (opt: number): number => {
    if (value === 0 && hovered === null) return 1;
    if (value !== 0 && opt !== value) return 0.35;
    if (hovered !== null && opt !== hovered && value === 0) return 0.5;
    return 1;
  };

  return (
    <div className="w-full my-8">
      {/* Buttons row */}
      <div className="flex justify-between items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(opt => {
          const isSelected = value === opt;
          const isHovered = hovered === opt;

          return (
            <motion.button
              key={opt}
              onClick={() => handleClick(opt)}
              onHoverStart={() => setHovered(opt)}
              onHoverEnd={() => setHovered(null)}
              animate={{
                scale: isSelected ? 1.2 : isHovered ? 1.08 : 1,
                opacity: getOpacity(opt),
                x: shake === opt ? [0, -3, 3, -2, 2, 0] : 0,
              }}
              transition={
                shake === opt
                  ? { duration: 0.25, type: 'tween' }
                  : { type: 'spring', stiffness: 300, damping: 22 }
              }
              className={`flex-1 aspect-square rounded-xl text-lg font-black border-2 flex items-center justify-center
                ${isSelected
                  ? 'bg-[#2C1810] text-white border-[#2C1810] shadow-lg'
                  : 'bg-white text-[#666666] border-gray-200'
                }`}
              style={{ willChange: 'transform, opacity' }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-[#666666] font-medium px-1">
        <span className="w-2/5 text-left leading-tight">{labelMin}</span>
        <span className="w-2/5 text-right leading-tight">{labelMax}</span>
      </div>

      {/* Selected label */}
      <AnimatePresence>
        {value !== 0 && (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-center mt-4 text-sm font-bold text-[#2C1810]"
          >
            {value <= 2 ? labelMin : value >= 4 ? labelMax : 'Término medio'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
