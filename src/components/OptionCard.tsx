import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptionCardProps {
  label: string;
  icon?: React.ReactNode;
  image?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label, icon, image, selected, onClick, className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: [1, 1.025, 1] } : { scale: 1 }}
      transition={selected ? { duration: 0.18 } : { duration: 0.1 }}
      className={`w-full text-left p-4 rounded-2xl border-2 mb-3 flex items-center justify-between shadow-sm
        ${selected
          ? 'border-[#2C1810] bg-[#F5F0EB]'
          : 'border-gray-200 bg-white hover:border-[#2C1810]/40 hover:bg-[#FAF8F5]'
        } ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* Left content */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {image && (
          <img src={image} alt="" className="w-12 h-12 rounded-xl object-cover border border-black/5 flex-shrink-0" />
        )}
        {icon && <div className="text-2xl flex-shrink-0">{icon}</div>}
        <span className="font-semibold text-[#1A1A1A] text-[15px] leading-snug">{label}</span>
      </div>

      {/* Animated radio */}
      <div className="ml-4 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
          style={{ borderColor: selected ? '#2C1810' : '#D1D5DB' }}
        >
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-2.5 h-2.5 rounded-full bg-[#2C1810]"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background pulse on select */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="pulse"
            initial={{ opacity: 0.4, scale: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-2xl bg-[#2C1810]/10 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};
