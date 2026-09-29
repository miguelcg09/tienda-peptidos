"use client";

import { useState } from "react";

const num = (s: string) => {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const fmt = (n: number, max = 3) => (Number.isFinite(n) ? n.toLocaleString("es-CL", { maximumFractionDigits: max }) : "—");

// Calculadora de laboratorio: concentración = mg / mL y volumen de una alícuota = cantidad / concentración.
export function Calculadora() {
  const [vial, setVial] = useState("5");
  const [diluent, setDiluent] = useState("2");
  const [amount, setAmount] = useState("250"); // mcg de muestra a medir

  const mg = num(vial);
  const ml = num(diluent);
  const mcg = num(amount);
  const valid = mg > 0 && ml > 0;
  const mgPerMl = valid ? mg / ml : NaN;
  const mcgPerMl = mgPerMl * 1000;
  const volMl = mcg > 0 && valid ? mcg / mcgPerMl : NaN;
  const aliquots = mcg > 0 && valid ? (mg * 1000) / mcg : NaN;

  const chip = (value: string, set: (v: string) => void, options: string[], unit: string) => (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => set(o)} aria-pressed={value === o} className={`rounded-full border px-3 py-1 text-xs transition ${value === o ? "border-accent bg-accent text-on-accent" : "hover:border-accent"}`}>
          {o} {unit}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
      <div className="space-y-5 rounded-card border bg-surface p-5">
        <label className="block text-sm">Contenido del vial (mg)
          <input value={vial} onChange={(e) => setVial(e.target.value)} inputMode="decimal" className="field" data-testid="vial" />
          {chip(vial, setVial, ["2", "5", "10", "15"], "mg")}
        </label>
        <label className="block text-sm">Diluyente agregado (mL)
          <input value={diluent} onChange={(e) => setDiluent(e.target.value)} inputMode="decimal" className="field" data-testid="diluyente" />
          {chip(diluent, setDiluent, ["1", "2", "3", "5"], "mL")}
        </label>
        <label className="block text-sm">Cantidad de muestra a medir (mcg)
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="field" data-testid="cantidad" />
        </label>
      </div>

      <div className="space-y-3 rounded-card border bg-surface-2 p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Resultado</p>
        <div>
          <p className="text-sm text-muted">Concentración</p>
          <p className="font-display text-3xl font-bold" data-testid="concentracion">{fmt(mgPerMl)} <span className="text-base font-medium text-muted">mg/mL</span></p>
          <p className="text-sm text-muted">{fmt(mcgPerMl, 0)} mcg/mL</p>
        </div>
        <div className="border-t pt-3">
          <p className="text-sm text-muted">Volumen para {fmt(mcg, 0)} mcg</p>
          <p className="font-display text-2xl font-bold" data-testid="volumen">{fmt(volMl)} <span className="text-base font-medium text-muted">mL</span> <span className="text-base font-medium text-muted">({fmt(volMl * 1000, 1)} µL)</span></p>
        </div>
        <div className="border-t pt-3">
          <p className="text-sm text-muted">Alícuotas de esa cantidad por vial</p>
          <p className="font-display text-2xl font-bold" data-testid="alicuotas">{fmt(Math.floor(aliquots), 0)}</p>
        </div>
        {!valid && <p className="text-xs text-red-600 dark:text-red-300">Escribe números mayores a cero en el vial y el diluyente.</p>}
      </div>

      <p className="text-xs text-muted md:col-span-2">
        Cálculo de laboratorio: concentración = mg del vial ÷ mL de diluyente; volumen = cantidad ÷ concentración. No constituye indicación de uso ni de dosis en personas ni animales.
        Todos los productos son solo para investigación.
      </p>
    </div>
  );
}
