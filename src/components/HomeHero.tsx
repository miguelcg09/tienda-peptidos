"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { formatCLP } from "@/lib/products";
import { Icon } from "./Icon";
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

const FALLBACK = "#07687b";
const hue = (color: string) => ({ "--hue": color || FALLBACK }) as CSSProperties;

const arrow = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-control text-fg transition-colors hover:border-accent hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-control disabled:hover:bg-transparent";

// Portada: un bloque oscuro con el título y, debajo, un carrusel de piezas grandes que se desliza a mano o con las flechas.
// Cada tarjeta lleva el tono del color de su vial y enlaza a la ficha. Sin movimiento automático.
export function HomeHero({ items }: { items: HeroItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const n = items.length;

  function measure() {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }
  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  // Una tarjeta por clic: el paso es el ancho de la primera más el espacio entre tarjetas.
  function go(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const first = el.querySelector("li") as HTMLElement | null;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * ((first?.offsetWidth ?? 300) + 16), behavior: calm ? "auto" : "smooth" });
  }

  return (
    <section id="portada" aria-labelledby="titulo-portada" data-testid="portada">
      <div className="inverse night border-b border-line">
        <div className="wrap flex flex-col items-center gap-5 pb-14 pt-12 text-center md:gap-6 md:pb-24 md:pt-20">
          <p className="chip rise" style={{ "--i": 0 } as CSSProperties}><Icon name="flask" size={16} />Para quienes investigan por su cuenta</p>
          <h1 id="titulo-portada" style={{ "--i": 1 } as CSSProperties} className="rise max-w-[16ch] font-display text-[clamp(2.7rem,7.2vw,5.6rem)] font-bold leading-[0.96] tracking-[-0.03em] md:max-w-[18ch]">
            Péptidos de investigación.
          </h1>
          <p style={{ "--i": 2 } as CSSProperties} className="rise font-display text-[clamp(1.3rem,2.6vw,1.95rem)] font-medium leading-[1.15] tracking-[-0.02em]">
            Pagas en pesos y sigues tu pedido.
          </p>
          <p style={{ "--i": 3 } as CSSProperties} className="rise max-w-[46rem] text-lg text-muted">Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.</p>
          <div style={{ "--i": 4 } as CSSProperties} className="rise flex flex-wrap items-center justify-center gap-3">
            <a href="#coleccion" className="btn-primary group/btn min-h-14 px-6 text-base sm:px-8">Ver catálogo <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" /></a>
            <a href="#despacho" className="btn-ghost min-h-14 px-6 text-base sm:px-8">Cómo se despacha</a>
          </div>
          <p className="max-w-[60ch] text-balance text-sm text-muted">
            Solo para uso en investigación. Mayores de 18 años. No aptos para consumo humano ni animal.
          </p>
        </div>
      </div>

      {n > 0 && (
        <div className="wrap pb-4 pt-10 md:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 id="elegir-pieza" className="t-h2">Elige una pieza</h2>
              <p className="mt-1 text-muted">Desliza para ver más. Cada pieza lleva a su ficha.</p>
            </div>
            {n > 1 && (
              <div className="flex gap-2">
                <button type="button" onClick={() => go(-1)} disabled={edge.start} className={arrow} aria-label="Pieza anterior">
                  <Icon name="arrow" size={20} className="rotate-180" />
                </button>
                <button type="button" onClick={() => go(1)} disabled={edge.end} className={arrow} aria-label="Pieza siguiente">
                  <Icon name="arrow" size={20} />
                </button>
              </div>
            )}
          </div>

          <div
            ref={track}
            onScroll={measure}
            role="region"
            aria-labelledby="elegir-pieza"
            tabIndex={0}
            data-testid="carrusel-piezas"
            className="relative -mx-4 mt-6 snap-x snap-mandatory overflow-x-auto px-4 pb-4 [scrollbar-width:thin] scroll-px-4 md:-mx-12 md:px-12 md:scroll-px-12"
          >
            <ul className="flex w-max gap-4">
              {items.map((it) => (
                <li key={it.slug} className="w-[min(19rem,78vw)] shrink-0 snap-start sm:w-[20rem]">
                  <article className="group/card lift flex h-full flex-col rounded-[1.75rem] border border-line bg-surface p-2.5 hover:border-control" style={hue(it.color)}>
                    {/* La imagen también es un enlace para quien usa mouse o toque; el del nombre es el que leen el teclado y los lectores de pantalla */}
                    <Link
                      href={`/productos/${it.slug}`}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="panel-hue grid place-items-center rounded-[1.3rem] py-8 [--hue-base:82%] [--panel-base:var(--surface)]"
                    >
                      <span className="transition-transform duration-500 ease-out group-hover/card:-translate-y-1.5 group-hover/card:rotate-[-3deg] group-hover/card:scale-[1.05]">
                        {it.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt="" className="h-[15rem] w-auto max-w-full object-contain" />
                        ) : (
                          <Vial color={it.color} label={it.name} lot={it.lot} format={it.format} kind={it.category === "Accesorios" ? "liquid" : "powder"} className="h-[15rem] w-auto" />
                        )}
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2 pt-4">
                      <h3 className="break-words font-display text-[1.35rem] font-semibold leading-tight tracking-tight">
                        <Link href={`/productos/${it.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{it.name}</Link>
                      </h3>
                      <p className="font-mono text-xs text-muted">{it.form}{it.format ? ` · ${it.format}` : ""}</p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
                        <p className="whitespace-nowrap text-lg font-semibold">
                          {it.multi && <span className="text-sm font-normal text-muted">Desde </span>}
                          {formatCLP(it.from)}
                        </p>
                        <Link href={`/productos/${it.slug}`} className="group/ver inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-[var(--btn-hover)]">
                          Ver pieza<span className="sr-only"> {it.name}</span> <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover/ver:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
