"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 border-t border-line py-2.5">
      <dt className="font-mono text-xs uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="min-w-0 text-sm [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

// Portada: ficha técnica. Texto a la izquierda; a la derecha la pieza en un marco con esquinas marcadas,
// sus datos en filas y un selector segmentado que cambia la pieza.
const STEP_MS = 5500;

export function HomeHero({ items }: { items: HeroItem[] }) {
  const [sel, setSel] = useState(0);
  // Las piezas avanzan solas; se detienen al pasar el mouse o el foco por la pieza, con el botón de pausa
  // o si el visitante prefiere menos movimiento. Al elegir una a mano, el aviso para lectores de pantalla se activa.
  const [hold, setHold] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [manual, setManual] = useState(false);
  const n = items.length;
  const i = Math.min(sel, n - 1);
  const cur = items[i];
  const paused = hold || stopped;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setStopped(true);
  }, []);
  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setSel((k) => (k + 1) % n), STEP_MS);
    return () => clearTimeout(t);
  }, [sel, paused, n]);
  const pick = (k: number) => { setSel(k); setManual(true); };

  return (
    <section id="portada" data-field aria-labelledby="titulo-portada" className="border-b bg-ink text-ink-fg [--logo-dot:var(--ink)]" data-testid="portada">
      <header className="border-b">
        <NavBar />
      </header>
      <div className="mx-auto grid w-full max-w-[1280px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6 px-4 py-12 md:px-12 md:py-16 lg:border-r lg:py-20 lg:pl-12 lg:pr-14">
          <p className="eyebrow">Para quienes investigan por su cuenta</p>
          <h1 id="titulo-portada" className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
            <span className="rise block">Péptidos de investigación.</span>
            <span style={{ animationDelay: "160ms" }} className="rise mt-5 block text-[clamp(1.3rem,2.2vw,1.9rem)] font-normal leading-[1.15] tracking-[-0.025em] text-muted">
              Pagas en pesos y <span className="text-fg">sigues tu pedido.</span>
            </span>
          </h1>
          <p className="max-w-[38ch] text-lg leading-relaxed text-ink-fg/85">
            Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#coleccion" className="btn-primary !min-h-13 !px-7">
              Ver catálogo <span aria-hidden="true" className="font-mono">→</span>
            </a>
            <a href="#despacho" className="btn-ghost !min-h-13">Cómo se despacha</a>
          </div>
          <ProductSearch variant="hero" className="hidden w-full max-w-[34rem] md:block" />
          <p className="max-w-[46ch] border-t pt-5 font-mono text-xs uppercase leading-relaxed tracking-[0.08em] text-muted">
            Solo para uso en investigación · Mayores de 18 años · No aptos para consumo humano ni animal
          </p>
        </div>

        {cur && (
          <div className="flex min-w-0 flex-col gap-5 border-t px-4 py-10 md:px-12 lg:border-t-0 lg:py-20 lg:pl-14" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false); }}>
            <div className="frame-ticks relative grid min-h-[340px] place-items-center rounded-card border bg-surface lg:min-h-[420px]">
              <p className="absolute left-4 top-3.5 font-mono text-xs tracking-[0.1em] text-muted">PIEZA {pad(i + 1)} / {pad(n)}</p>
              <p className="absolute right-4 top-3.5 flex items-center gap-2 font-mono text-xs tracking-[0.1em] text-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />EN CATÁLOGO</p>
              <div key={cur.slug} className="animate-vial-in grid place-items-center">
              {cur.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.imageUrl} alt={cur.name} className="max-h-[360px] w-auto max-w-[70%] object-contain" />
              ) : (
                <Vial color={cur.color} label={cur.name} tone="light" lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="h-[280px] w-auto max-w-full lg:h-[340px]" />
              )}
              </div>
              <p key={`lote-${cur.slug}`} className="animate-fade absolute bottom-3.5 left-4 font-mono text-xs tracking-[0.1em] text-muted">{cur.lot ? `LOTE ${cur.lot}` : cur.format.toUpperCase()}</p>
            </div>
            <div key={`ficha-${cur.slug}`} data-testid="ficha-pieza" aria-live={manual ? "polite" : "off"} className="animate-slide">
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 pb-3">
                <p className="t-label text-[1.9rem] [overflow-wrap:anywhere]"><span className="sr-only">PIEZA {pad(i + 1)} / {pad(n)}: </span>{cur.name}</p>
                <p className="whitespace-nowrap text-xl font-semibold tabular-nums">{cur.multi ? <span className="mr-1.5 font-mono text-xs font-normal uppercase tracking-[0.1em] text-muted">Desde</span> : null}{formatCLP(cur.from)}</p>
              </div>
              <dl className="border-b border-line">
                <Row label="Formato" value={cur.form} />
                <Row label="Línea" value={cur.category} />
              </dl>
              <Link href={`/productos/${cur.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline underline-offset-4">Ver ficha técnica <span aria-hidden="true" className="font-mono">→</span></Link>
            </div>
            {n > 1 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p id="elegir-pieza" className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Elegir pieza</p>
                  <button type="button" onClick={() => setStopped((v) => !v)} aria-pressed={stopped} className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg">
                    <span aria-hidden="true" className="inline-flex h-3 w-3 items-center justify-center gap-[2px]">
                      {stopped ? <span className="h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-current" /> : <><span className="h-3 w-[3px] bg-current" /><span className="h-3 w-[3px] bg-current" /></>}
                    </span>
                    {stopped ? "Reanudar" : "Pausar"}<span className="sr-only"> el cambio automático de piezas</span>
                  </button>
                </div>
                <div className="grid grid-flow-col auto-cols-fr overflow-hidden rounded-btn border" role="group" aria-labelledby="elegir-pieza">
                  {items.map((it, k) => (
                    <button
                      key={it.slug}
                      onClick={() => pick(k)}
                      aria-label={`${pad(k + 1)}: ${it.name}`}
                      aria-pressed={k === i}
                      className={`relative h-11 overflow-hidden border-l font-mono text-sm first:border-l-0 transition-colors motion-reduce:transition-none ${k === i ? "bg-accent text-on-accent" : "hover:bg-surface-2"}`}
                    >
                      {pad(k + 1)}
                      {/* Barra de avance de la pieza activa: muestra cuánto falta para la siguiente */}
                      {k === i && !stopped && (
                        <span key={`avance-${sel}`} aria-hidden="true" className="hero-progress absolute inset-x-0 bottom-0 h-[3px] origin-left bg-on-accent/70" style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: hold ? "paused" : "running" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
