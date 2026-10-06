"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCLP } from "@/lib/products";
import { onColor } from "@/lib/colors";
import { NavBar } from "./Header";
import { Vial } from "./Vial";

export type HeroItem = {
  slug: string;
  name: string;
  category: string;
  color: string;
  imageUrl?: string;
  lot?: string;
  form: string;
  format: string;
  from: number;
  multi: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const words = ["Cero", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"];
const FALLBACK = "#0b0f10";

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-t border-[#e3e8e9] py-2.5">
      <dt className="font-mono text-[0.7rem] uppercase tracking-widest text-[#5b676b]">{label}</dt>
      <dd className={`text-right text-sm ${mono ? "font-mono text-[0.8rem]" : ""}`}>{value}</dd>
    </div>
  );
}

// Portada: el fondo toma el color de la pieza elegida; el vial queda quieto y cambia la ficha.
export function HomeHero({ items, total }: { items: HeroItem[]; total: number }) {
  const [sel, setSel] = useState(0);
  const n = items.length;
  const cur = items[Math.min(sel, n - 1)];
  const color = cur?.color ?? FALLBACK;
  const fg = onColor(color);
  const count = total === 1 ? "Un compuesto" : `${words[total] ?? total} compuestos`;
  const move = "transition-colors duration-500 motion-reduce:transition-none";

  return (
    <section aria-labelledby="titulo-portada" className={move} style={{ backgroundColor: color, color: fg }} data-testid="portada">
      <header>
        <NavBar />
      </header>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 pb-16 pt-4 md:flex-row md:flex-wrap md:items-center md:gap-x-12 md:gap-y-14 md:px-12 md:pt-6">
        {/* En celular la pieza va antes del selector; en escritorio el selector queda bajo el texto */}
        <div className="contents md:flex md:min-w-0 md:flex-[1_1_420px] md:flex-col md:gap-6">
          <div className="flex min-w-0 flex-col gap-6">
            <p className="font-mono text-xs uppercase tracking-[0.14em]">Colección · {pad(total)} {total === 1 ? "pieza" : "piezas"}</p>
            <h1 id="titulo-portada" className="font-display text-[clamp(3rem,6vw,5.75rem)] font-light leading-[0.98] tracking-[-0.035em]">
              Péptidos de investigación.
            </h1>
            <p className="max-w-[32ch] text-xl leading-relaxed opacity-90">
              {count}, cada uno con su lote impreso en el vial y despacho con seguimiento a todo Chile.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
              <a href="#coleccion" className={`inline-flex min-h-14 items-center rounded-btn px-8 text-base font-semibold ${move}`} style={{ backgroundColor: fg, color }}>
                Ver la colección
              </a>
              <a href="#despacho" className="text-base font-medium underline underline-offset-[5px]">Cómo se despacha</a>
            </div>
          </div>
          {n > 1 && (
            <div className="order-3 flex flex-col gap-3 md:order-none md:pt-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-85">Elegir pieza</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Elegir pieza">
                {items.map((it, i) => (
                  <button
                    key={it.slug}
                    onClick={() => setSel(i)}
                    aria-label={`Ver ${it.name}`}
                    aria-pressed={i === sel}
                    className={`h-12 w-12 rounded-btn border border-current font-mono text-sm font-medium ${move} ${i === sel ? "" : "opacity-70 hover:opacity-100"}`}
                    style={i === sel ? { backgroundColor: fg, color } : undefined}
                  >
                    {pad(i + 1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {cur && (
          <div className="order-2 flex min-w-0 flex-[1.1_1_460px] flex-row-reverse flex-wrap items-end justify-center gap-x-6 gap-y-7 md:order-none md:min-h-[560px]">
            <div className="flex min-w-0 flex-[0_1_220px] justify-center">
              {cur.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.imageUrl} alt={cur.name} className="max-h-[520px] w-auto max-w-full object-contain" />
              ) : (
                <Vial color={cur.color} label={cur.name} tone="field" lot={cur.lot} format={cur.format} className="h-[360px] w-auto max-w-full md:h-[470px]" />
              )}
            </div>
            <div className="min-w-0 flex-[0_1_260px] rounded-card bg-white p-5 text-[#0b0f10]" data-testid="ficha-pieza">
              <p className="font-mono text-xs tracking-widest text-[#5b676b]">PIEZA {pad(Math.min(sel, n - 1) + 1)} / {pad(n)}</p>
              <p className="pb-3 pt-1 font-display text-[1.9rem] font-medium leading-[1.05] tracking-tight [overflow-wrap:anywhere]">{cur.name}</p>
              <dl>
                {cur.lot && <Row label="Lote" value={cur.lot} />}
                <Row label="Formato" value={cur.form} />
                <Row label="Línea" value={cur.category} mono={false} />
              </dl>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[#0b0f10] pt-3.5">
                <span className="whitespace-nowrap text-xl font-semibold">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                <Link href={`/productos/${cur.slug}`} className="whitespace-nowrap text-sm font-medium underline underline-offset-4">Ver pieza →</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
