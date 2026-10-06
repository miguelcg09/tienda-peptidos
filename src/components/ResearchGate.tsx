"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "./CartProvider";
import { useDialog } from "@/lib/useDialog";

const KEY = "research-ack-v1";

// Aviso de ingreso: confirma mayoría de edad y uso exclusivo en investigación.
export function ResearchGate() {
  const { settings } = useStore();
  const [show, setShow] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDialog(box, show);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="animate-fade fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/80 p-4">
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="aviso-titulo" aria-describedby="aviso-texto" className="relative max-w-md overflow-hidden rounded-card border bg-surface p-7 shadow-2xl">
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-accent">Aviso importante</p>
        <h2 id="aviso-titulo" className="relative mt-2 font-display text-2xl font-bold">Solo para investigación</h2>
        <p id="aviso-texto" className="relative mt-3 text-sm text-muted">{settings.disclaimer}</p>
        <p className="relative mt-3 text-sm text-muted">
          Al continuar declaras ser mayor de 18 años y que adquirirás los productos solo con fines de investigación.
        </p>
        <div className="relative mt-6 flex gap-3">
          <button
            onClick={() => {
              try { localStorage.setItem(KEY, "1"); } catch {}
              setShow(false);
            }}
            data-autofocus
            className="btn-primary flex-1 text-sm"
          >
            Entiendo y acepto
          </button>
          <a href="https://www.google.cl" className="btn-ghost flex-1 text-sm">Salir</a>
        </div>
      </div>
    </div>
  );
}
