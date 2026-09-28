"use client";

import { useEffect, useState } from "react";
import { RESEARCH_DISCLAIMER } from "@/lib/config";

const KEY = "research-ack-v1";

// Aviso de ingreso: confirma mayoría de edad y uso exclusivo en investigación.
export function ResearchGate() {
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
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4">
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">Aviso importante</h2>
        <p className="mt-3 text-sm text-slate-600">{RESEARCH_DISCLAIMER}</p>
        <p className="mt-3 text-sm text-slate-600">
          Al continuar declaras ser mayor de 18 años y que adquirirás los productos solo con fines de investigación.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              try { localStorage.setItem(KEY, "1"); } catch {}
              setShow(false);
            }}
            className="flex-1 rounded-full bg-brand py-2.5 text-sm font-medium text-white"
          >
            Entiendo y acepto
          </button>
          <a href="https://www.google.cl" className="flex-1 rounded-full border py-2.5 text-center text-sm font-medium">
            Salir
          </a>
        </div>
      </div>
    </div>
  );
}
