import React from 'react';
import { motion } from 'framer-motion';

interface QuizStepProps {
  children: React.ReactNode;
  direction?: 'forward' | 'back';
}

export const QuizStep: React.FC<QuizStepProps> = ({ children, direction = 'forward' }) => {
  const xIn  = direction === 'forward' ?  50 : -50;
  const xOut = direction === 'forward' ? -50 :  50;

  return (
    <motion.div
      initial={{ opacity: 0, x: xIn }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: xOut }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col h-full w-full"
    >
      {children}
    </motion.div>
  );
};
