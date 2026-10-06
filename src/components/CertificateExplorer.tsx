"use client";

import { useState } from "react";

const rows = [
  { id: "lote", label: "Lote", value: "HX-2409-A", note: "El número impreso en la etiqueta de tu vial debe ser idéntico a este. Así sabes que el certificado es de tu lote y no de otro." },
  { id: "hplc", label: "Pureza (HPLC)", value: "99,4%", note: "Porcentaje del área del pico principal en el cromatograma. Buscamos 98% o más en cada lote." },
  { id: "ms", label: "Masa (MS)", value: "Conforme", note: "La masa medida debe coincidir con la masa teórica del péptido. Es la prueba de que el vial contiene lo que dice la etiqueta." },
  { id: "fecha", label: "Fecha del análisis", value: "12 sept 2026", note: "Cuándo se analizó el lote. Un certificado reciente respalda el producto que realmente recibes." },
] as const;

// Certificado de ejemplo con cuatro datos que se explican al pasar el cursor o tocar cada fila.
export function CertificateExplorer({ product }: { product: string }) {
  const [active, setActive] = useState<(typeof rows)[number]["id"]>("lote");
  const current = rows.find((r) => r.id === active) ?? rows[0];
  return (
    <div data-testid="certificado-ejemplo">
      <div className="rounded-card border bg-surface p-5 shadow-lg md:p-6">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <p className="font-display text-lg font-bold">Certificado de análisis</p>
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[0.8125rem] font-semibold uppercase tracking-wider text-accent">Aprobado</span>
        </div>
        <p className="mt-3 flex justify-between text-sm"><span className="text-muted">Producto</span><span className="font-medium">{product}</span></p>
        <div className="mt-2 divide-y" role="group" aria-label="Datos del certificado">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={active === r.id}
              onClick={() => setActive(r.id)}
              onMouseEnter={() => setActive(r.id)}
              onFocus={() => setActive(r.id)}
              className={`-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-3 text-left text-sm transition ${active === r.id ? "bg-accent/10" : "hover:bg-surface-2"}`}
            >
              <span className="text-muted">{r.label}</span>
              <span className={`font-medium ${active === r.id ? "text-accent" : ""}`}>{r.value}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.8125rem] text-muted">Ejemplo ilustrativo. El certificado real de tu lote viaja con el pedido.</p>
      </div>
      <p className="mt-4 rounded-card border border-accent/30 bg-accent/5 p-4 text-sm" aria-live="polite" data-testid="certificado-nota">
        <strong className="font-semibold">{current.label}.</strong> {current.note}
      </p>
    </div>
  );
}
