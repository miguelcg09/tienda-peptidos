"use client";

import { useEffect, useState } from "react";
import { useStore } from "./CartProvider";

const KEY = "research-ack-v1";

// Aviso de ingreso: confirma mayoría de edad y uso exclusivo en investigación.
export function ResearchGate() {
  const { settings } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="animate-fade fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="relative max-w-md overflow-hidden rounded-3xl border bg-surface p-7 shadow-2xl">
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-accent">Aviso importante</p>
        <h2 className="relative mt-2 font-display text-2xl font-bold">Solo para investigación</h2>
        <p className="relative mt-3 text-sm text-muted">{settings.disclaimer}</p>
        <p className="relative mt-3 text-sm text-muted">
          Al continuar declaras ser mayor de 18 años y que adquirirás los productos solo con fines de investigación.
        </p>
        <div className="relative mt-6 flex gap-3">
          <button
            onClick={() => {
              try { localStorage.setItem(KEY, "1"); } catch {}
              setShow(false);
            }}
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
