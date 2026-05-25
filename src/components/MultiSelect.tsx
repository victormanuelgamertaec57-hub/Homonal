import React from 'react';
import { Check } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  icon?: React.ReactNode;
  image?: string;
  selected: boolean;
  onClick: () => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, icon, image, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 mb-3 transition-all duration-150 relative overflow-hidden flex items-center
        ${selected 
          ? 'border-[var(--color-primary)] bg-[#F5F0EB]' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
    >
      {/* Checkbox en la esquina superior derecha si se pide, pero un checkbox a la derecha es mejor */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
            {image && <img src={image} alt={label} className="w-16 h-16 rounded-xl object-cover border border-black/5" />}
            {icon && <div className="text-2xl">{icon}</div>}
            <span className="font-semibold text-[var(--color-text-main)] text-lg">{label}</span>
        </div>
        
        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
          ${selected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
          {selected && <Check size={16} className="text-white" />}
        </div>
      </div>
    </button>
  );
};
