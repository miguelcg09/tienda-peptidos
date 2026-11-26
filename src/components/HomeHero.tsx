"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCLP } from "@/lib/products";
import { NavBar } from "./Header";
import { ProductSearch } from "./ProductSearch";
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

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-t border-[#e6e3da] py-2.5">
      <dt className="text-sm text-[#58625c]">{label}</dt>
      <dd className={`text-right text-sm ${mono ? "font-mono text-[0.8rem]" : ""}`}>{value}</dd>
    </div>
  );
}

// Portada: campo verde botella fijo; el vial (con la tapa del color de cada pieza) y su ficha cambian con el selector.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const [sel, setSel] = useState(0);
  const n = items.length;
  const cur = items[Math.min(sel, n - 1)];
  const move = "transition-colors duration-200 motion-reduce:transition-none";

  return (
    <section id="portada" data-field aria-labelledby="titulo-portada" className="bg-ink text-ink-fg [--logo-dot:var(--ink)]" data-testid="portada">
      <header>
        <NavBar />
      </header>
      {/* Texto a la izquierda; a la derecha la pieza con su ficha encima del vial y, alineado con la ficha, el selector que la cambia */}
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 pb-16 pt-4 md:px-12 md:pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-x-12">
        <div className="flex min-w-0 flex-col gap-5 md:gap-6">
          <p className="eyebrow !text-ink-muted"><span className="text-ink-fg">Para quienes investigan por su cuenta</span></p>
          <h1 id="titulo-portada" className="font-display text-[clamp(2.6rem,5.4vw,5rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
            Péptidos de investigación.
            <span className="mt-4 block text-[clamp(1.4rem,2.4vw,2.1rem)] font-medium leading-[1.12] tracking-[-0.02em] text-mark [font-stretch:100%]">
              Pagas en pesos y sigues tu pedido.
            </span>
          </h1>
          <p className="max-w-[34ch] text-lg leading-snug text-ink-fg/90 md:text-xl md:leading-relaxed">
            Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
            <a href="#coleccion" className="inline-flex min-h-14 items-center gap-2 rounded-btn bg-mark px-8 text-base font-semibold text-mark-fg transition-colors hover:bg-[#e8f29b]">
              Ver catálogo <span aria-hidden="true">→</span>
            </a>
            <a href="#despacho" className="inline-flex min-h-11 items-center text-base font-medium u-link">Cómo se despacha</a>
          </div>
          <ProductSearch variant="hero" className="hidden w-full max-w-[34rem] md:block" />
          <p className="max-w-[44ch] text-sm leading-relaxed text-ink-muted">
            Solo para uso en investigación. Mayores de 18 años. No aptos para consumo humano ni animal.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:ml-auto lg:w-fit">
          {cur && (
            <div className="flex min-w-0 flex-row-reverse flex-wrap items-end justify-center gap-x-6 gap-y-7 lg:flex-nowrap lg:justify-end lg:gap-x-0">
              <div className="flex min-w-0 flex-[0_1_240px] justify-center">
                {cur.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cur.imageUrl} alt={cur.name} className="max-h-[520px] w-auto max-w-full object-contain" />
                ) : (
                  <Vial color={cur.color} label={cur.name} tone="field" lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="h-[360px] w-auto max-w-full lg:h-[500px]" />
                )}
              </div>
              {/* En escritorio la ficha se monta sobre el borde del vial: una sola pieza, no dos cajas lado a lado */}
              <div className="relative z-10 min-w-0 flex-[0_1_260px] rounded-card bg-[#fbfaf6] p-5 text-[#14201b] shadow-[0_1px_0_rgb(0_0_0/0.25),0_18px_40px_-18px_rgb(0_0_0/0.55)] lg:-mr-5 lg:mb-6" data-testid="ficha-pieza" aria-live="polite">
                <p className="font-mono text-xs tracking-widest text-[#58625c]">PIEZA {pad(Math.min(sel, n - 1) + 1)} / {pad(n)}</p>
                <p className="pb-3 pt-1.5 t-label text-[1.55rem] [overflow-wrap:anywhere]">{cur.name}</p>
                <dl>
                  {cur.lot && <Row label="Lote" value={cur.lot} />}
                  <Row label="Formato" value={cur.form} />
                  <Row label="Línea" value={cur.category} mono={false} />
                </dl>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[#14201b] pt-3.5">
                  <span className="whitespace-nowrap text-xl font-semibold">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                  <Link href={`/productos/${cur.slug}`} className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium u-link">Ver pieza →</Link>
                </div>
              </div>
            </div>
          )}

          {n > 1 && (
            <div className="flex flex-col gap-3">
              <p id="elegir-pieza" className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">Elegir pieza</p>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="elegir-pieza">
                {items.map((it, i) => (
                  <button
                    key={it.slug}
                    onClick={() => setSel(i)}
                    aria-label={`${pad(i + 1)}: ${it.name}`}
                    aria-pressed={i === sel}
                    className={`h-12 w-12 rounded-btn border font-mono text-sm font-medium ${move} ${i === sel ? "border-mark bg-mark text-mark-fg" : "border-ink-line hover:border-ink-fg/60 hover:bg-ink-2"}`}
                  >
                    {pad(i + 1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
