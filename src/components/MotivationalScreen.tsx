import React from 'react';

interface MotivationalScreenProps {
  imageUrl: string;
  stat: string;
  message: string;
  onContinue: () => void;
}

export const MotivationalScreen: React.FC<MotivationalScreenProps> = ({
  imageUrl,
  stat,
  message,
  onContinue,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Large image */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-5" style={{ height: '260px' }}>
        <img
          src={imageUrl}
          alt="Motivacional"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Stat card */}
      <div className="bg-[#F5F0EB] rounded-2xl p-5 mb-4 border border-[#E8DDD5]">
        <p className="text-sm leading-relaxed text-[#1A1A1A] font-medium mb-0">
          <span className="text-[#2C1810] font-black text-base block mb-1">📊 Dato:</span>
          {stat}
        </p>
      </div>

      {/* Message */}
      <p className="text-xl font-black text-[#1A1A1A] leading-tight mb-8 text-center px-2">
        {message}
      </p>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-full bg-[#2C1810] text-white font-bold text-lg mt-auto hover:opacity-90 active:scale-95 transition-all"
      >
        CONTINUAR
      </button>
    </div>
  );
};
