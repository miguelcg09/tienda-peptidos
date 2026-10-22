"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { formatCLP } from "@/lib/products";
import { Icon } from "./Icon";
import { Vial } from "./Vial";
import { Watermark } from "./Watermark";

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
const FALLBACK = "#5b4fe6";
const hue = (color: string) => ({ "--hue": color || FALLBACK }) as CSSProperties;

function Row({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`text-right text-sm ${mono ? "font-mono text-[0.8rem]" : ""}`}>{value}</dd>
    </div>
  );
}

const arrow = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-control text-fg transition-colors hover:border-accent hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-control disabled:hover:bg-transparent";

// Portada: el título al centro y, debajo, un escenario con el vial sobre el nombre de la pieza en letras gigantes y tenues.
// Se elige la pieza en un carrusel manual (sin movimiento automático); el panel toma un toque del color de la pieza.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const [sel, setSel] = useState(0);
  const rail = useRef<HTMLUListElement>(null);
  const n = items.length;
  const at = Math.min(sel, n - 1);
  const cur = items[at];

  function pick(i: number) {
    const next = Math.max(0, Math.min(n - 1, i));
    setSel(next);
    const el = rail.current;
    const li = el?.children[next] as HTMLElement | undefined;
    if (el && li) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: Math.max(0, li.offsetLeft - (el.clientWidth - li.offsetWidth) / 2), behavior: calm ? "auto" : "smooth" });
    }
  }

  return (
    <section id="portada" aria-labelledby="titulo-portada" className="wrap pb-6 pt-5 md:pt-8" data-testid="portada">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center md:gap-5">
        <p className="chip">Para quienes investigan por su cuenta</p>
        <h1 id="titulo-portada" className="font-display text-[clamp(2.6rem,6.2vw,4.9rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
          Péptidos de investigación.
          <span className="mt-4 block text-[clamp(1.3rem,2.6vw,1.95rem)] font-medium leading-[1.15] tracking-[-0.02em] text-muted">
            Pagas en pesos y sigues tu pedido.
          </span>
        </h1>
        <p className="max-w-[48rem] text-lg">Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#coleccion" className="btn-primary min-h-14 px-6 text-base sm:px-8">Ver catálogo</a>
          <a href="#despacho" className="btn-ghost min-h-14 px-6 text-base sm:px-8">Cómo se despacha</a>
        </div>
      </div>

      {cur && (
        <>
          {/* Escenario: panel redondeado con el color de la pieza, su nombre gigante detrás y el vial al centro */}
          <div className="panel-hue relative isolate mt-7 overflow-hidden rounded-[2rem] [--hue-base:82%] [container-type:inline-size] md:mt-9 md:rounded-[2.75rem] dark:[--hue-base:74%]" style={hue(cur.color)}>
            <Watermark key={cur.slug} name={cur.name} max={15} className="inset-x-0 top-0 h-[21rem] sm:h-[24rem] lg:h-[28rem] xl:inset-0 xl:h-auto xl:[--wm-share:0.68]" />
            <div className="relative flex min-h-[26rem] flex-col items-center justify-center gap-6 px-4 pb-4 pt-8 md:min-h-[31rem] md:pb-6">
              <div key={cur.slug} className="animate-pop">
                <div className="animate-float">
                  {cur.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cur.imageUrl} alt={cur.name} className="h-[17rem] w-auto max-w-full object-contain sm:h-[20rem] lg:h-[24rem]" />
                  ) : (
                    <Vial color={cur.color} label={cur.name} lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="h-[17rem] w-auto sm:h-[20rem] lg:h-[24rem]" />
                  )}
                </div>
              </div>
              {/* La ficha de la pieza: debajo del vial en celular y tablet, abajo a la derecha del escenario en pantallas anchas */}
              <div className="relative z-10 w-full max-w-sm rounded-[1.75rem] bg-surface p-5 text-fg xl:absolute xl:bottom-7 xl:right-7 xl:w-[17.5rem]" data-testid="ficha-pieza" aria-live="polite">
                <p className="font-mono text-xs tracking-widest text-muted">PIEZA {pad(at + 1)} / {pad(n)}</p>
                <p className="pb-3 pt-1 font-display text-[1.65rem] font-semibold leading-[1.05] tracking-tight [overflow-wrap:anywhere]">{cur.name}</p>
                <dl>
                  {cur.lot && <Row label="Lote" value={cur.lot} />}
                  <Row label="Formato" value={cur.form} />
                  <Row label="Línea" value={cur.category} mono={false} />
                </dl>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-3.5">
                  <span className="whitespace-nowrap text-xl font-semibold">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                  <Link href={`/productos/${cur.slug}`} className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-[var(--btn-hover)]">
                    Ver pieza <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {n > 1 && (
            <div className="mt-4">
              <p id="elegir-pieza" className="px-1 text-sm font-medium text-muted">Elegir pieza</p>
              <ul
                ref={rail}
                aria-labelledby="elegir-pieza"
                className="relative mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {items.map((it, i) => {
                  const on = i === at;
                  return (
                    <li key={it.slug} className="shrink-0 basis-[13.5rem] snap-start">
                      <button
                        type="button"
                        onClick={() => pick(i)}
                        aria-pressed={on}
                        className={`flex min-h-[4.75rem] w-full items-center gap-3 rounded-[1.25rem] border-2 bg-surface p-2.5 pr-4 text-left transition-colors ${on ? "border-accent" : "border-line hover:border-control"}`}
                      >
                        <span aria-hidden="true" className="panel-hue grid h-[3.75rem] w-12 shrink-0 place-items-center rounded-xl" style={hue(it.color)}>
                          {it.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.imageUrl} alt="" className="h-12 w-auto object-contain" />
                          ) : (
                            <Vial color={it.color} label={it.name} kind={it.category === "Accesorios" ? "liquid" : "powder"} className="h-12 w-auto" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-base font-semibold leading-tight">{it.name}</span>
                          <span className="block font-mono text-xs text-muted">{pad(i + 1)} · {formatCLP(it.from)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${((at + 1) / n) * 100}%` }} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => pick(at - 1)} disabled={at === 0} className={arrow} aria-label="Pieza anterior">
                    <Icon name="arrow" size={20} className="rotate-180" />
                  </button>
                  <button type="button" onClick={() => pick(at + 1)} disabled={at === n - 1} className={arrow} aria-label="Pieza siguiente">
                    <Icon name="arrow" size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <p className="mx-auto mt-6 max-w-[60ch] text-balance text-center text-sm text-muted">
        Solo para uso en investigación. Mayores de 18 años. No aptos para consumo humano ni animal.
      </p>
    </section>
  );
}
