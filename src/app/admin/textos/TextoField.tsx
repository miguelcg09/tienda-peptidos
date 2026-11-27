"use client";

import { useRef, useState } from "react";

// Campo de texto con su original a la vista y un botón para volver a él.
export function TextoField({ name, label, def, value, long, hint }: { name: string; label: string; def: string; value: string; long?: boolean; hint?: string }) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [current, setCurrent] = useState(value || def);
  const changed = current.trim() !== def;
  const id = `t-${name.replace(/\./g, "-")}`;
  const props = { id, name, ref, value: current, onChange: (e: { target: { value: string } }) => setCurrent(e.target.value), className: "field" };
  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-medium">
          {label}
          {changed && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Cambiado</span>}
        </label>
        {changed && (
          <button type="button" onClick={() => { setCurrent(def); ref.current?.focus(); }} className="min-h-8 text-xs text-muted underline underline-offset-2 hover:text-fg">
            Volver al original
          </button>
        )}
      </div>
      {long ? <textarea rows={3} {...props} /> : <input {...props} />}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {changed && <p className="mt-1 text-xs text-muted">Original: {def}</p>}
    </div>
  );
}
