'use client';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  color?: string;
}

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  unit = '',
  description,
  color = 'var(--accent)',
}: ParameterSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-[var(--muted)] font-mono">
          {value.toFixed(2)}{unit}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, var(--border) ${percentage}%, var(--border) 100%)`,
          }}
        />
      </div>

      {description && (
        <p className="text-xs text-[var(--muted)] mt-1">{description}</p>
      )}
    </div>
  );
}
