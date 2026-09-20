/**
 * Contador con botones de mas y menos para cantidades pequenas
 * (habitaciones, banos, parqueos, ano de entrega).
 */
"use client";

import { Minus, Plus } from "@phosphor-icons/react";

interface NumberPickerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export function NumberPicker({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helpText,
}: NumberPickerProps) {
  /** Todo valor escrito a mano se recorta al rango permitido. */
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <label className="admin-field">
      {label}
      <div className="admin-number-picker">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Restar ${step} a ${label}`}
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            onChange(Number.isFinite(parsed) ? clamp(parsed) : min);
          }}
          min={min}
          max={max}
          step={step}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Sumar ${step} a ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
      {helpText && <small className="admin-field-help">{helpText}</small>}
    </label>
  );
}
