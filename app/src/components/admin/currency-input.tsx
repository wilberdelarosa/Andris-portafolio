/**
 * Campo de importe con separador de miles.
 *
 * Mientras el campo tiene el foco se muestra lo que la persona escribe y al
 * salir se formatea. Antes se sincronizaba con un `useEffect` que llamaba a
 * `setState` en cada render del padre, lo que encadenaba renders y ademas
 * reformateaba el texto a media escritura.
 */
"use client";

import { useState, type ChangeEvent } from "react";

const thousands = new Intl.NumberFormat("en-US");

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  currency = "USD",
  placeholder = "Por confirmar",
}: CurrencyInputProps) {
  /** `null` = sin edicion en curso, se muestra el valor formateado. */
  const [draft, setDraft] = useState<string | null>(null);

  const formatted = value ? thousands.format(value) : "";
  const shown = draft ?? formatted;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^\d.]/g, "");
    setDraft(raw);
    const parsed = Number.parseFloat(raw);
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  return (
    <label className="admin-field">
      {label}
      <div className="admin-currency-input">
        <span className="admin-currency-symbol">{currency}</span>
        <input
          type="text"
          inputMode="decimal"
          value={shown}
          onChange={handleChange}
          onFocus={() => setDraft(formatted.replace(/,/g, ""))}
          onBlur={() => setDraft(null)}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}
