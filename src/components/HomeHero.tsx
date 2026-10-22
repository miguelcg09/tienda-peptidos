"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCLP } from "@/lib/products";
import { ProductSearch } from "./ProductSearch";
import { Ruler } from "./Ruler";
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
  formats: string;
  cas?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-t border-line py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`min-w-0 text-right text-sm [overflow-wrap:anywhere] ${mono ? "font-mono text-[0.8125rem]" : ""}`}>{value}</dd>
    </div>
  );
}

// Portada: título grande a la izquierda; a la derecha el espécimen elegido (vial y hoja de datos) y debajo
// el índice numerado de piezas, que cambia el espécimen. La barra bermellón se desliza de una pieza a otra.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const [sel, setSel] = useState(0);
  const n = items.length;
  const i = Math.min(sel, n - 1);
  const cur = items[i];

  return (
    <section id="portada" aria-labelledby="titulo-portada" className="border-b border-fg" data-testid="portada">
      <div className="wrap grid gap-x-12 gap-y-12 py-10 md:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex min-w-0 flex-col gap-6 md:gap-7">
          <p className="label flex items-center gap-2.5 text-fg">
            <span className="mark" aria-hidden="true" />
            Para quienes investigan por su cuenta
          </p>
          <h1 id="titulo-portada" className="font-display text-[clamp(2.6rem,5.3vw,4.75rem)] font-medium leading-[0.95] tracking-[-0.045em]">
            Péptidos de investigación.
            <span className="mt-5 block max-w-[24ch] text-[clamp(1.25rem,2vw,1.75rem)] font-normal leading-[1.15] tracking-[-0.02em] text-muted">
              Pagas en pesos y sigues tu pedido.
            </span>
          </h1>
          <p className="max-w-[36ch] text-lg leading-snug md:text-xl md:leading-relaxed">
            Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#coleccion" className="btn-primary min-h-14 px-8 text-base">Ver catálogo</a>
            <a href="#despacho" className="inline-flex min-h-11 items-center text-base font-medium u-link">Cómo se despacha</a>
          </div>
          <ProductSearch variant="hero" className="hidden w-full max-w-[34rem] md:block" />
          <p className="max-w-[46ch] border-l-2 border-signal pl-4 text-sm leading-relaxed">
            Solo para uso en investigación. Mayores de 18 años. No aptos para consumo humano ni animal.
          </p>
        </div>

        {cur && (
          <div className="min-w-0 border border-fg bg-surface" data-testid="ficha-pieza" aria-live="polite">
            <div className="flex items-center justify-between gap-3 border-b border-fg px-4 py-2.5">
              <span className="label text-fg">Espécimen {pad(i + 1)} / {pad(n)}</span>
              <span className="label min-w-0 truncate">{cur.category}</span>
            </div>
            <div className="grid sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="relative grid place-items-center border-b border-line px-6 py-8 sm:border-b-0 sm:border-r sm:px-8">
                <Ruler />
                <div key={cur.slug} className="animate-swap flex w-full justify-center">
                  {cur.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cur.imageUrl} alt={cur.name} className="max-h-[380px] w-auto max-w-full object-contain" />
                  ) : (
                    <Vial color={cur.color} label={cur.name} lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="h-[280px] w-auto max-w-full sm:h-[360px]" />
                  )}
                </div>
              </div>
              <div className="flex min-w-0 flex-col p-5 sm:p-6">
                <p key={`n-${cur.slug}`} className="animate-swap pb-4 font-display text-[1.75rem] font-medium leading-[1.05] tracking-tight [overflow-wrap:anywhere] sm:text-[2rem]">{cur.name}</p>
                <dl>
                  {cur.lot && <Row label="Lote" value={cur.lot} />}
                  <Row label="Formato" value={cur.form} />
                  <Row label="Presentaciones" value={cur.formats} />
                  {cur.cas && <Row label="CAS" value={cur.cas} />}
                  <Row label="Línea" value={cur.category} mono={false} />
                </dl>
                <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-fg pt-4">
                  <span className="whitespace-nowrap font-mono text-xl font-medium">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                  <Link href={`/productos/${cur.slug}`} className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium u-link">Ver pieza →</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="wrap pb-10 md:pb-14">
          <p id="elegir-pieza" className="label mb-3 text-fg">Elegir pieza</p>
          <div className="overflow-x-auto border border-fg">
            <div className="relative w-full" style={{ minWidth: `${n * 9.5}rem` }}>
            <ul
              aria-labelledby="elegir-pieza"
              className="grid w-full"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
            >
              {items.map((it, k) => {
                const on = k === i;
                return (
                  <li key={it.slug} className="border-r border-line last:border-r-0">
                    <button
                      onClick={() => setSel(k)}
                      aria-label={`${pad(k + 1)} ${it.name}`}
                      aria-pressed={on}
                      className={`flex h-full min-h-[5.25rem] w-full flex-col items-start gap-1 px-4 pb-3 pt-4 text-left transition-colors duration-200 ${on ? "bg-fg text-bg" : "hover:bg-surface-2"}`}
                    >
                      <span className={`font-mono text-xs ${on ? "text-bg/75" : "text-muted"}`}>{pad(k + 1)}</span>{" "}
                      <span className="font-medium leading-tight [overflow-wrap:anywhere]">{it.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-1 bg-signal transition-transform duration-300 ease-out"
              style={{ width: `${100 / n}%`, transform: `translateX(${i * 100}%)` }}
            />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
