"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { formatCLP, type Product } from "@/lib/products";
import type { Settings } from "@/lib/config";
import { useCart } from "./CartProvider";
import { Icon, categoryIcon, type IconName } from "./Icon";
import { ProductImage } from "./ProductImage";
import { Newsletter } from "./Newsletter";
import { Stars } from "./Stars";
import { Watermark } from "./Watermark";

type IndexItem = { id: string; label: string };

const tag = "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium";

// Ficha flotante junto al vial: dato real de la pieza con su ícono. Es decoración (los mismos datos están en texto en la página).
function Floater({ icon, text, className }: { icon: IconName; text: string; className: string }) {
  return (
    <span aria-hidden="true" className={`absolute hidden max-w-[11rem] items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3.5 text-xs font-semibold md:inline-flex ${className}`}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={icon} size={14} /></span>
      <span className="truncate">{text}</span>
    </span>
  );
}

// Zona superior de la ficha: escenario con el producto, columna de contenido (children),
// índice lateral y tarjeta de compra fija al hacer scroll. La presentación elegida se comparte entre todo.
export function ProductStage({
  product,
  settings,
  index,
  showCertificates = false,
  children,
}: {
  product: Product;
  settings: Settings;
  index: IndexItem[];
  showCertificates?: boolean;
  children: ReactNode;
}) {
  const { add, lines, settings: store } = useCart();
  const { payments } = store;
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.stock !== 0)?.id ?? product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  // El vial se inclina apenas hacia el puntero (solo con mouse y sin "reducir movimiento").
  function onMove(e: React.PointerEvent<HTMLElement>) {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  }
  function onLeave() {
    tilt.current?.style.setProperty("--ry", "0deg");
    tilt.current?.style.setProperty("--rx", "0deg");
  }

  // En celular, cuando la tarjeta de compra sale de pantalla aparece un botón flotante.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCardVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return <p className="text-muted">Sin presentaciones disponibles.</p>;
  const soldOut = variant.stock === 0;
  const max = variant.stock == null ? 99 : Math.min(99, variant.stock);
  const inCart = lines.find((l) => l.variantId === variant.id)?.qty ?? 0;
  const discount = variant.compareAt && variant.compareAt > variant.price ? variant.compareAt - variant.price : 0;
  const pct = discount ? Math.round((discount / variant.compareAt!) * 100) : 0;
  const payLine =
    payments.card && payments.transfer ? "Pago con tarjeta, Webpay o transferencia"
    : payments.card ? "Pago seguro con tarjeta o Webpay"
    : payments.transfer ? "Pago por transferencia bancaria"
    : "Pedidos por WhatsApp o correo";
  const stockLine = soldOut
    ? "Sin stock por ahora"
    : variant.stock == null || variant.stock > 20
      ? "En stock · Más de 20 unidades"
      : variant.stock === 1
        ? "En stock · Queda 1 unidad"
        : `En stock · Quedan ${variant.stock} unidades`;

  return (
    <>
      {/* Escenario: panel con un toque del color del producto, su nombre gigante y tenue a la derecha y el vial encima */}
      <section onPointerMove={onMove} onPointerLeave={onLeave} className="panel-hue relative isolate overflow-hidden rounded-[2rem] [container-type:inline-size] md:rounded-[2.75rem]" style={{ "--hue": product.color } as CSSProperties}>
        <Watermark
          name={product.name}
          max={9}
          className="inset-x-0 bottom-0 h-[52%] [--wm-share:1] md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[56%] md:[--wm-share:0.56]"
        />
        <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-8 md:px-12 md:py-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="chip rise w-fit bg-surface" style={{ "--i": 0 } as CSSProperties}><Icon name={categoryIcon(product.category)} size={16} className="text-accent-2" />{product.category}</p>
            <h1 className="rise mt-4 break-words font-display text-[clamp(2.1rem,9vw,3rem)] font-semibold leading-[0.98] tracking-[-0.04em] md:text-[clamp(2.5rem,5.4vw,4.5rem)]" style={{ "--i": 1 } as CSSProperties}>{product.name}</h1>
            <p className="rise mt-4 max-w-md text-lg" style={{ "--i": 2 } as CSSProperties}>{product.short}</p>
            <ul className="rise mt-6 flex flex-wrap gap-2" style={{ "--i": 3 } as CSSProperties}>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-fg px-3.5 py-1.5 text-xs font-semibold text-bg"><Icon name={soldOut ? "close" : "check"} size={14} />{stockLine}</li>
              {showCertificates && <li className={tag}><Icon name="shield" size={14} className="text-accent-2" />Pureza {product.purity.replace(" (HPLC)", "")}</li>}
              {showCertificates && <li className={tag}><Icon name="doc" size={14} className="text-accent-2" />COA por lote</li>}
              {product.rating && (
                <li>
                  <a href="#resenas" className={`${tag} gap-1.5 transition-colors hover:border-control`}>
                    <Stars value={product.rating.avg} className="text-sm" />
                    {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · {product.rating.count} {product.rating.count === 1 ? "reseña" : "reseñas"}
                  </a>
                </li>
              )}
              {product.cas && <li className={tag}><Icon name="tag" size={14} className="text-accent-2" />CAS {product.cas}</li>}
            </ul>
          </div>
          <div className="relative grid min-h-[240px] min-w-0 place-items-center md:min-h-0">
            <Floater icon="flask" text={product.form} className="animate-float-b left-0 top-2 lg:-left-2" />
            <Floater icon="ruler" text={variant.label} className="animate-float-c bottom-4 left-0 lg:-left-6" />
            {product.cas && <Floater icon="tag" text={`CAS ${product.cas}`} className="animate-float-b right-0 top-12 [animation-delay:-3s] lg:-right-2" />}
            <div ref={tilt} className="transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none" style={{ transform: "perspective(900px) rotateY(var(--ry, 0deg)) rotateX(var(--rx, 0deg))" }}>
              <div className="animate-float">
                <ProductImage product={product} className="relative h-60 w-auto max-w-full md:h-[19rem]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[150px_minmax(0,1fr)_360px]">
        <SectionIndex items={index} />
        <div className="flex min-w-0 flex-col gap-4">{children}</div>

        {/* Tarjeta de compra: fija mientras se lee el contenido */}
        <aside className="rise order-first lg:order-none" style={{ "--i": 3 } as CSSProperties}>
          <div ref={cardRef} className="rounded-[1.75rem] border border-line bg-surface p-5 lg:sticky lg:top-[calc(var(--bar-h)+6.5rem)]">
            <p className="text-sm font-semibold text-muted" id="presentacion">Presentación</p>
            <div className="mt-2 grid gap-2" role="group" aria-labelledby="presentacion">
              {product.variants.map((v) => {
                const on = v.id === variant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setVariantId(v.id); setQty(1); }}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                      on ? "border-accent bg-surface-2" : "border-line hover:border-control"
                    } ${v.stock === 0 ? "opacity-60" : ""}`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-accent bg-accent text-on-accent" : "border-control"}`}>
                      {on && <Icon name="check" size={12} />}
                    </span>
                    <span className="min-w-0 grow font-medium [overflow-wrap:anywhere]">{v.label}</span>
                    {v.stock === 0 ? (
                      <span className="shrink-0 text-xs text-muted">Sin stock</span>
                    ) : (
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold">{formatCLP(v.price)}</span>
                        {v.compareAt && v.compareAt > v.price && <span className="block text-[0.8125rem] text-muted line-through">{formatCLP(v.compareAt)}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p key={variant.id} className="animate-fade font-display text-4xl font-semibold tracking-tight">{formatCLP(variant.price)}</p>
                <p className="text-xs text-muted">IVA incluido</p>
              </div>
              {discount > 0 && (
                <span className="rounded-full bg-accent-2 px-3 py-1 text-xs font-bold text-on-accent">-{pct}% · Ahorras {formatCLP(discount)}</span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex items-center rounded-full border border-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg" aria-label="Menos"><Icon name="minus" size={18} /></button>
                <span className="w-7 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(max, qty + 1))} className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg" aria-label="Más"><Icon name="plus" size={18} /></button>
              </div>
              <button disabled={soldOut} onClick={() => add(variant.id, qty)} className="btn-primary group/add flex-1">
                {!soldOut && <Icon name="cart" size={18} className="transition-transform group-hover/add:-rotate-12" />}
                {soldOut ? "Agotado" : inCart > 0 ? `En carrito · ${inCart}` : "Agregar al carrito"}
              </button>
            </div>

            {soldOut && (
              <div className="mt-4 rounded-2xl bg-surface-2 p-4 text-sm">
                <p className="font-medium">¿Te avisamos cuando vuelva?</p>
                <div className="mt-2"><Newsletter source="stock" product={product.slug} cta="Avísame" done="Listo: te escribimos cuando vuelva a estar disponible." compact /></div>
              </div>
            )}

            <ul className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm text-muted">
              {([
                ["truck", settings.shippingNote],
                ["tag", `Envío gratis sobre ${formatCLP(settings.freeShippingFrom)}`],
                ...(showCertificates ? [["doc", "Certificado de análisis del lote incluido"]] : []),
                [payments.card || payments.transfer ? "card" : "chat", payLine],
              ] as [IconName, string][]).map(([ic, t]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={ic} size={15} /></span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ul>
            {product.coaUrl && (
              <a href={product.coaUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-4 w-full text-sm">Ver certificado del lote</a>
            )}
          </div>
        </aside>
      </div>

      {/* Botón flotante en celular cuando la tarjeta de compra no está a la vista */}
      {!cardVisible && !soldOut && (
        <button
          onClick={() => add(variant.id, qty)}
          className="btn-primary animate-fade fixed bottom-5 right-4 z-40 shadow-xl lg:hidden"
        >
          <Icon name="cart" size={18} />
          {inCart > 0 ? `En carrito · ${inCart}` : `Agregar · ${formatCLP(variant.price)}`}
        </button>
      )}
    </>
  );
}

// Índice lateral con resaltado de la sección visible.
function SectionIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="Índice de la ficha" className="hidden xl:block">
      <ol className="sticky top-[calc(var(--bar-h)+6.5rem)] space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`flex items-baseline gap-2 rounded-full px-3 py-2 transition-colors ${active === it.id ? "bg-surface font-semibold text-fg" : "text-muted hover:text-fg"}`}
              aria-current={active === it.id ? "location" : undefined}
            >
              <span className="font-mono text-[0.8125rem]">{String(i + 1).padStart(2, "0")}</span>
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
