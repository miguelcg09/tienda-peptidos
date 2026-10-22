"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DEFAULT_PALETTE, PALETTES, PALETTE_COOKIE, type PaletteId } from "@/lib/preview-palette";
import { Icon } from "./Icon";

// Selector de paleta, solo para las vistas previas: cambia el atributo data-palette de <html> al instante
// y lo guarda en una cookie para que el servidor pinte la misma paleta en la próxima página.
export function PalettePicker({ initial = DEFAULT_PALETTE }: { initial?: PaletteId }) {
  const [current, setCurrent] = useState<PaletteId>(initial);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  function pick(id: PaletteId) {
    setCurrent(id);
    document.documentElement.dataset.palette = id;
    document.cookie = `${PALETTE_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
  }

  const now = PALETTES.find((p) => p.id === current) ?? PALETTES[0];
  return (
    <div ref={root} className="fixed bottom-[4.75rem] left-4 z-40 print:hidden">
      {open && (
        <div id={listId} role="group" aria-label="Paleta de colores" className="animate-pop mb-2 w-52 rounded-3xl border border-line bg-surface p-2">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted">Probar paleta (solo vista previa)</p>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p.id)}
              aria-pressed={p.id === current}
              className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium transition-colors hover:bg-surface-2 ${p.id === current ? "bg-surface-2" : ""}`}
            >
              <span aria-hidden="true" className="h-5 w-5 shrink-0 rounded-full border-2 border-surface" style={{ background: p.swatch, boxShadow: "0 0 0 1px var(--line)" }} />
              {p.label}
              {p.id === current && <Icon name="check" size={16} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-colors hover:bg-surface-2"
      >
        <span aria-hidden="true" className="h-4 w-4 rounded-full" style={{ background: now.swatch }} />
        Paleta: {now.label}
        <Icon name="palette" size={18} />
      </button>
    </div>
  );
}
