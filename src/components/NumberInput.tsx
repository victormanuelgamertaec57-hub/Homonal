import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Unit conversions ──────────────────────────────────────────────────────
function convert(val: number, from: string, to: string): number {
  if (from === to || !val) return val;
  if (from === 'cm' && to === 'ft')  return Math.round(val * 0.0328084 * 10) / 10;
  if (from === 'ft' && to === 'cm')  return Math.round(val * 30.48);
  if (from === 'kg' && to === 'lbs') return Math.round(val * 2.20462 * 10) / 10;
  if (from === 'lbs' && to === 'kg') return Math.round((val / 2.20462) * 10) / 10;
  return val;
}

// ── IMC helpers ───────────────────────────────────────────────────────────
function calcIMC(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
}

function imcCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Bajo peso',  color: '#60A5FA' };
  if (imc < 25)   return { label: 'Normal ✅',   color: '#34D399' };
  if (imc < 30)   return { label: 'Sobrepeso',   color: '#FBBF24' };
  return            { label: 'Obesidad',     color: '#F87171' };
}

// ── Props ─────────────────────────────────────────────────────────────────
interface NumberInputProps {
  /** Raw value stored in state — always in the primary unit (cm, kg) */
  value: number | null;
  onChange: (val: number | null) => void;
  unit: 'cm' | 'kg';
  toggleUnit?: 'ft' | 'lbs';
  min?: number;
  max?: number;
  /** Pass the sibling (height when on weight screen, or weight when on height) to show live IMC */
  siblingValue?: number | null;
  siblingType?: 'height' | 'weight';
  // legacy compat — ignored but accepted
  placeholder?: string;
  onToggle?: (unit: string) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  unit,
  toggleUnit,
  min,
  max,
  siblingValue,
  siblingType,
}) => {
  const [displayUnit, setDisplayUnit] = useState<string>(unit);
  // displayValue is what the user sees in the input (may be converted)
  const [displayValue, setDisplayValue] = useState<string>(
    value ? String(value) : ''
  );
  const [shake, setShake] = useState(false);
  const [outOfRange, setOutOfRange] = useState(false);
  const [focused, setFocused] = useState(false);

  // ── Handle input change ────────────────────────────────────────────────
  const handleChange = (raw: string) => {
    // Allow empty
    if (raw === '' || raw === '-') {
      setDisplayValue(raw);
      onChange(null);
      setOutOfRange(false);
      return;
    }

    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return;

    setDisplayValue(raw);

    // Convert display value back to primary unit for state
    const primaryValue = displayUnit !== unit
      ? convert(parsed, displayUnit, unit)
      : parsed;

    // Range check against primary-unit bounds
    const effectiveMin = min ?? -Infinity;
    const effectiveMax = max ?? Infinity;
    if (primaryValue < effectiveMin || primaryValue > effectiveMax) {
      setOutOfRange(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      // Still allow writing — just flag it
    } else {
      setOutOfRange(false);
    }

    onChange(primaryValue);
  };

  // ── Toggle unit ────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (!toggleUnit) return;
    const nextUnit = displayUnit === unit ? toggleUnit : unit;

    // Convert current display value
    let nextDisplay = displayValue;
    if (displayValue !== '' && !isNaN(parseFloat(displayValue))) {
      const converted = convert(parseFloat(displayValue), displayUnit, nextUnit);
      nextDisplay = String(converted);
    }

    setDisplayUnit(nextUnit);
    setDisplayValue(nextDisplay);
  };

  // ── Live IMC ───────────────────────────────────────────────────────────
  let liveIMC: { label: string; color: string; value: number } | null = null;
  if (value && siblingValue) {
    let imc: number | null = null;
    if (siblingType === 'weight') {
      // this input is weight, sibling is height
      imc = calcIMC(value, siblingValue);
    } else if (siblingType === 'height') {
      // this input is height, sibling is weight
      imc = calcIMC(siblingValue, value);
    }
    if (imc) liveIMC = { ...imcCategory(imc), value: imc };
  }

  // ── Validity ───────────────────────────────────────────────────────────
  const hasValidValue = value !== null && value !== 0 && !outOfRange;

  // ── inputMode: decimal for weight, numeric for height ─────────────────
  const inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] =
    unit === 'kg' ? 'decimal' : 'numeric';

  return (
    <div className="w-full flex flex-col items-center mt-6 gap-2">

      {/* ── Big number input ─────────────────────────────────────── */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="relative flex items-end justify-center gap-3"
      >
        <input
          type="number"
          inputMode={inputMode}
          pattern="[0-9]*"
          value={displayValue}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          className="bg-transparent border-none outline-none text-center font-black text-[#1A1A1A] placeholder:text-gray-300"
          style={{
            fontSize: '72px',
            lineHeight: 1,
            width: '200px',
            caretColor: '#2C1810',
            // Prevent iOS auto-zoom (needs >= 16px computed, but we use large size anyway)
          }}
        />

        {/* Unit label beside the number */}
        <span className="text-2xl font-semibold text-[#888] mb-3 flex-shrink-0">
          {displayUnit}
        </span>
      </motion.div>

      {/* ── Animated underline ───────────────────────────────────── */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: '240px', height: '3px', backgroundColor: '#E5E7EB' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: outOfRange ? '#F87171' : '#2C1810', transformOrigin: 'left' }}
          animate={{ scaleX: (focused || displayValue !== '') ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          initial={{ scaleX: 0 }}
        />
      </div>

      {/* ── Out-of-range error ───────────────────────────────────── */}
      <AnimatePresence>
        {outOfRange && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 font-medium mt-1"
          >
            Valor fuera de rango ({min}–{max} {displayUnit})
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Toggle unit button ───────────────────────────────────── */}
      {toggleUnit && (
        <button
          onClick={handleToggle}
          className="mt-3 px-5 py-2 rounded-full border-2 border-gray-200 text-sm font-semibold text-[#666666] hover:bg-gray-50 active:scale-95 transition-all"
        >
          Cambiar a {displayUnit === unit ? toggleUnit : unit}
        </button>
      )}

      {/* ── Live IMC badge ──────────────────────────────────────── */}
      <AnimatePresence>
        {liveIMC && hasValidValue && (
          <motion.div
            key={liveIMC.label}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="mt-4 px-5 py-2 rounded-full font-bold text-sm text-white flex items-center gap-2 shadow-md"
            style={{ backgroundColor: liveIMC.color }}
          >
            <span className="opacity-80">IMC:</span>
            <span className="font-black">{liveIMC.value}</span>
            <span>— {liveIMC.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
