"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { formatCLP } from "@/lib/products";
import { Icon, categoryIcon, type IconName } from "./Icon";
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
const FALLBACK = "#00789a";
const hue = (color: string) => ({ "--hue": color || FALLBACK }) as CSSProperties;

function Row({ label, value, icon, mono = true }: { label: string; value: string; icon: IconName; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2">
      <dt className="flex items-center gap-2 text-sm text-muted"><Icon name={icon} size={16} className="shrink-0" />{label}</dt>
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
  const stage = useRef<HTMLDivElement>(null);
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

  // El vial se inclina un poco hacia el mouse y el nombre gigante se desplaza al revés (solo con mouse y sin "reducir movimiento")
  function track(e: PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty("--ty", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  }
  function rest() {
    stage.current?.style.setProperty("--tx", "0");
    stage.current?.style.setProperty("--ty", "0");
  }

  return (
    <section id="portada" aria-labelledby="titulo-portada" className="wrap pb-6 pt-5 md:pt-8" data-testid="portada">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center md:gap-5">
        <p className="chip rise" style={{ "--i": 0 } as CSSProperties}><Icon name="flask" size={16} />Para quienes investigan por su cuenta</p>
        <h1 id="titulo-portada" style={{ "--i": 1 } as CSSProperties} className="rise font-display text-[clamp(2.6rem,6.2vw,4.9rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
          Péptidos de investigación.
          <span className="mt-4 block text-[clamp(1.3rem,2.6vw,1.95rem)] font-medium leading-[1.15] tracking-[-0.02em] text-muted">
            Pagas en pesos y sigues tu pedido.
          </span>
        </h1>
        <p style={{ "--i": 2 } as CSSProperties} className="rise max-w-[48rem] text-lg">Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.</p>
        <div style={{ "--i": 3 } as CSSProperties} className="rise flex flex-wrap items-center justify-center gap-3">
          <a href="#coleccion" className="btn-primary group/btn min-h-14 px-6 text-base sm:px-8">Ver catálogo <Icon name="arrow" size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" /></a>
          <a href="#despacho" className="btn-ghost min-h-14 px-6 text-base sm:px-8">Cómo se despacha</a>
        </div>
      </div>

      {cur && (
        <>
          {/* Escenario: panel redondeado con el color de la pieza, su nombre gigante detrás y el vial al centro */}
          <div ref={stage} onPointerMove={track} onPointerLeave={rest} style={{ ...hue(cur.color), "--i": 4 } as CSSProperties} className="rise panel-hue relative isolate mt-7 overflow-hidden rounded-[2rem] [--hue-base:91%] [--panel-base:var(--soft)] [container-type:inline-size] md:mt-9 md:rounded-[2.75rem] dark:[--hue-base:76%]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out [transform:translate(calc(var(--tx,0)*-16px),calc(var(--ty,0)*-8px))]">
              <Watermark key={cur.slug} name={cur.name} max={15} className="inset-x-0 top-0 h-[21rem] sm:h-[24rem] lg:h-[28rem] xl:inset-0 xl:h-auto xl:[--wm-share:0.68]" />
            </div>
            {/* Fichas flotantes con los datos de la pieza: decoración, la información real está en la ficha de abajo */}
            <ul key={`chips-${cur.slug}`} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
              <li className="animate-pop absolute left-[8%] top-[20%] lg:left-[14%]"><span className="animate-float-b inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold"><Icon name="flask" size={18} className="text-accent-2" />{cur.form}</span></li>
              {cur.format && <li className="animate-pop absolute bottom-[34%] left-[9%] lg:left-[18%]" style={{ animationDelay: "90ms" }}><span className="animate-float-c inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold"><Icon name="ruler" size={18} className="text-accent-2" />{cur.format}</span></li>}
              <li className="animate-pop absolute right-[8%] top-[14%] lg:right-[24%]" style={{ animationDelay: "180ms" }}><span className="animate-float-b inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold"><Icon name={categoryIcon(cur.category)} size={18} className="text-accent-2" />{cur.category}</span></li>
            </ul>
            <div className="relative flex min-h-[26rem] flex-col items-center justify-center gap-6 px-4 pb-4 pt-8 md:min-h-[31rem] md:pb-6">
              <div key={cur.slug} className="animate-pop">
                <div className="animate-float">
                  <div className="transition-transform duration-300 ease-out [transform:perspective(1100px)_rotateY(calc(var(--tx,0)*9deg))_rotateX(calc(var(--ty,0)*-6deg))]">
                    {cur.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cur.imageUrl} alt={cur.name} className="h-[17rem] w-auto max-w-full object-contain sm:h-[20rem] lg:h-[24rem]" />
                    ) : (
                      <Vial color={cur.color} label={cur.name} lot={cur.lot} format={cur.format} kind={cur.category === "Accesorios" ? "liquid" : "powder"} className="h-[17rem] w-auto sm:h-[20rem] lg:h-[24rem]" />
                    )}
                  </div>
                </div>
              </div>
              {/* La ficha de la pieza: debajo del vial en celular y tablet, abajo a la derecha del escenario en pantallas anchas */}
              <div className="relative z-10 w-full max-w-sm rounded-[1.75rem] bg-surface p-5 text-fg xl:absolute xl:bottom-7 xl:right-7 xl:w-[17.5rem]" data-testid="ficha-pieza" aria-live="polite">
                <p className="font-mono text-xs tracking-widest text-muted">PIEZA {pad(at + 1)} / {pad(n)}</p>
                <p className="pb-3 pt-1 font-display text-[1.65rem] font-semibold leading-[1.05] tracking-tight [overflow-wrap:anywhere]">{cur.name}</p>
                <dl>
                  {cur.lot && <Row icon="tag" label="Lote" value={cur.lot} />}
                  <Row icon="flask" label="Formato" value={cur.form} />
                  <Row icon={categoryIcon(cur.category)} label="Línea" value={cur.category} mono={false} />
                </dl>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-3.5">
                  <span className="whitespace-nowrap text-xl font-semibold">{cur.multi ? "Desde " : ""}{formatCLP(cur.from)}</span>
                  <Link href={`/productos/${cur.slug}`} className="group/ver inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition-colors hover:bg-[var(--btn-hover)]">
                    Ver pieza <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover/ver:translate-x-0.5" />
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
                        className={`flex min-h-[4.75rem] w-full items-center gap-3 rounded-[1.25rem] border-2 bg-surface p-2.5 pr-4 text-left transition-[transform,border-color] duration-300 ${on ? "-translate-y-1 border-accent" : "border-line hover:-translate-y-0.5 hover:border-control"}`}
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
