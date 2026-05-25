import React, { useState } from 'react';

const AGE_CARDS_DATA = [
  {
    label: '18-29',
    img: '/edad-18-29.png',
    fallbackGradient: 'linear-gradient(160deg, #E8A87C, #C4614A)',
    emoji: '🏃‍♀️',
  },
  {
    label: '30-39',
    img: '/edad-30-39.png',
    fallbackGradient: 'linear-gradient(160deg, #D4956A, #A0522D)',
    emoji: '💪',
  },
  {
    label: '40-49',
    img: '/edad-40-49.png',
    fallbackGradient: 'linear-gradient(160deg, #C4814A, #8B4513)',
    emoji: '🌺',
  },
  {
    label: '50+',
    img: '/edad-50plus.png',
    fallbackGradient: 'linear-gradient(160deg, #B8763A, #7A4010)',
    emoji: '🌟',
  },
];

interface AgeCardsProps {
  selectedAge?: string;
  onSelect: (label: string) => void;
}

export const AgeCards: React.FC<AgeCardsProps> = ({ selectedAge, onSelect }) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (label: string) => {
    setImgErrors(prev => ({ ...prev, [label]: true }));
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAF8F5' }}>
      {/* Header */}
      <div className="text-center pt-2 pb-5 px-4">
        <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] leading-tight mb-1">
          PLAN HORMONAL PERSONALIZADO
        </h1>
        <p className="text-[13px] font-semibold text-[#888] tracking-widest uppercase">
          SEGÚN TU EDAD Y PERFIL
        </p>
      </div>

      {/* 2-col grid — flex-1 so it fills remaining height */}
      <div className="grid grid-cols-2 gap-3 px-4" style={{ flex: 1, alignContent: 'start' }}>
        {AGE_CARDS_DATA.map(({ label, img, fallbackGradient, emoji }) => {
          const isSelected = selectedAge === label;
          const hasError = imgErrors[label];

          return (
            <button
              key={label}
              onPointerDown={() => onSelect(label)} // fires immediately on touch
              className="relative overflow-hidden focus:outline-none select-none"
              style={{
                height: 220,
                borderRadius: 16,
                border: isSelected ? '3px solid #ffffff' : '3px solid transparent',
                boxShadow: isSelected ? '0 0 0 2px #2C1810' : 'none',
                background: hasError ? fallbackGradient : '#e5e5e5',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Photo (hidden if error) */}
              {!hasError && (
                <img
                  src={img}
                  alt={`Mujer ${label} años`}
                  onError={() => handleImgError(label)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: 'center top',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              )}

              {/* Fallback emoji — centered, shown when image errors */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-80">
                  {emoji}
                </div>
              )}

              {/* Bottom dark gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isSelected
                    ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 60%)',
                  transition: 'background 0.2s ease',
                }}
              />

              {/* Age label — bottom left */}
              <div className="absolute bottom-0 left-0 p-4 text-left">
                <p className="text-white font-black text-2xl leading-none">{label}</p>
                <p className="text-white/90 text-sm font-normal mt-0.5">años</p>
              </div>

              {/* Checkmark badge — top right when selected */}
              <div
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center"
                style={{
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected ? 'scale(1)' : 'scale(0.5)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7L5.5 10.5L12 3.5"
                    stroke="#2C1810"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legal text */}
      <p className="text-[11px] text-[#AAA] leading-relaxed text-center px-6 pt-4 pb-3">
        Al indicar tu edad y continuar, aceptas nuestros{' '}
        <span className="underline cursor-pointer">Términos de uso</span>{' '}y{' '}
        <span className="underline cursor-pointer">Política de privacidad</span>.
      </p>
    </div>
  );
};
