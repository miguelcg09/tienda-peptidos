"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCLP } from "@/lib/products";
import { pastelVars } from "@/lib/colors";
import { NavBar } from "./Header";
import { ProductSearch } from "./ProductSearch";
import { VialAuto } from "./Vial";

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
const FALLBACK = "#64748b";
// Ancho y separación de las miniaturas: el indicador que se desliza se calcula con estos valores
const THUMB = 56;
const GAP = 8;

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`text-right text-sm ${mono ? "font-mono text-[0.8rem]" : ""}`}>{value}</dd>
    </div>
  );
}

// Portada: el fondo toma el matiz de la pieza elegida, en pastel; el vial flota y cambia la ficha.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const [sel, setSel] = useState(0);
  const n = items.length;
  const at = Math.min(sel, n - 1);
  const cur = items[at];
  const move = "transition-colors duration-500 motion-reduce:transition-none";

  return (
    <section
      id="portada"
      data-field
      aria-labelledby="titulo-portada"
      className={`pastel-hero overflow-hidden md:rounded-b-[2.5rem] ${move}`}
      style={pastelVars(cur?.color ?? FALLBACK)}
      data-testid="portada"
    >
      <header>
        <NavBar />
      </header>
      {/* Texto a la izquierda; a la derecha la pieza con su ficha encima del vial y, debajo, el selector de piezas */}
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 pb-16 pt-4 md:px-12 md:pb-20 md:pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-x-12">
        <div className="flex min-w-0 flex-col items-start gap-5 md:gap-6">
          <p className="rounded-full bg-surface px-4 py-1.5 text-sm font-medium">Para quienes investigan por su cuenta</p>
          <h1 id="titulo-portada" className="font-display text-[clamp(2.75rem,5.6vw,5.25rem)] font-light leading-[0.98] tracking-[-0.035em]">
            Péptidos de investigación.
            <span className="mt-4 block text-[clamp(1.5rem,2.6vw,2.25rem)] font-normal leading-[1.12] tracking-[-0.02em] text-fg/80">
              Pagas en pesos y sigues tu pedido.
            </span>
          </h1>
          <p className="max-w-[34ch] text-lg leading-snug md:text-xl md:leading-relaxed">
            Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
            <a href="#coleccion" className="btn-primary min-h-14 rounded-full px-8 text-base">
              Ver catálogo
            </a>
            <a href="#despacho" className="inline-flex min-h-11 items-center text-base font-medium u-link">Cómo se despacha</a>
          </div>
          <ProductSearch variant="hero" className="hidden w-full max-w-[34rem] md:block" />
          <p className="max-w-[44ch] text-sm leading-relaxed">
            Solo para uso en investigación. Mayores de 18 años. No aptos para consumo humano ni animal.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:ml-auto lg:w-fit">
          {cur && (
            <div className="flex min-w-0 flex-row-reverse flex-wrap items-end justify-center gap-x-6 gap-y-7 lg:flex-nowrap lg:justify-end lg:gap-x-0">
              <div className="flex min-w-0 flex-[0_1_240px] justify-center">
                {cur.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cur.imageUrl} alt={cur.name} className="animate-float max-h-[520px] w-auto max-w-full object-contain" />
                ) : (
                  <VialAuto color={cur.color} label={cur.name} lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="animate-float h-[360px] w-auto max-w-full lg:h-[500px]" />
                )}
              </div>
              {/* En escritorio la ficha se monta sobre el borde del vial: una sola pieza, no dos cajas lado a lado */}
              <div key={cur.slug} className="animate-slide relative z-10 min-w-0 flex-[0_1_260px] rounded-card bg-surface p-5 text-fg shadow-[0_1px_0_var(--line)] lg:-mr-5 lg:mb-6" data-testid="ficha-pieza" aria-live="polite">
                <p className="font-mono text-xs tracking-widest text-muted">PIEZA {pad(at + 1)} / {pad(n)}</p>
                <p className="pb-3 pt-1 font-display text-[1.9rem] font-medium leading-[1.05] tracking-tight [overflow-wrap:anywhere]">{cur.name}</p>
                <dl>
                  {cur.lot && <Row label="Lote" value={cur.lot} />}
                  <Row label="Formato" value={cur.form} />
                  <Row label="Línea" value={cur.category} mono={false} />
                </dl>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-fg pt-3.5">
                  <span className="whitespace-nowrap text-xl font-semibold">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                  <Link href={`/productos/${cur.slug}`} className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium u-link">Ver pieza →</Link>
                </div>
              </div>
            </div>
          )}

          {n > 1 && (
            <div className="flex min-w-0 flex-col gap-3">
              <p id="elegir-pieza" className="text-sm font-medium">Elegir pieza</p>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group" aria-labelledby="elegir-pieza">
                <div className="relative flex w-max" style={{ gap: GAP }}>
                  {/* El indicador se desliza hasta la pieza elegida */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full rounded-2xl bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ width: THUMB, transform: `translateX(${at * (THUMB + GAP)}px)` }}
                  />
                  {items.map((it, i) => (
                    <button
                      key={it.slug}
                      onClick={() => setSel(i)}
                      aria-label={`${pad(i + 1)}: ${it.name}`}
                      aria-pressed={i === sel}
                      className="relative z-10 flex h-[4.75rem] shrink-0 items-center justify-center rounded-2xl outline-offset-2 transition-opacity hover:opacity-100"
                      style={{ width: THUMB, opacity: i === at ? 1 : 0.62 }}
                    >
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt="" className="h-14 w-auto object-contain" />
                      ) : (
                        <VialAuto decorative color={it.color} label={it.name} format={it.format} kind={it.category === "Accesorios" ? "liquid" : "powder"} className="pointer-events-none h-[3.75rem] w-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
