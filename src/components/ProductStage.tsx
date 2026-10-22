"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatCLP, type Product } from "@/lib/products";
import type { Settings } from "@/lib/config";
import { useCart } from "./CartProvider";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";
import { Newsletter } from "./Newsletter";
import { Ruler } from "./Ruler";
import { Stars } from "./Stars";

type IndexItem = { id: string; label: string };

// Hoja técnica del producto: a la izquierda el espécimen (vial grande), a la derecha nombre, compra y tabla de datos.
// Debajo, un índice con las secciones y el contenido (children). La presentación elegida se comparte con el botón flotante.
export function ProductStage({
  product,
  settings,
  index,
  specs,
  showCertificates = false,
  children,
}: {
  product: Product;
  settings: Settings;
  index: IndexItem[];
  specs: string[][];
  showCertificates?: boolean;
  children: ReactNode;
}) {
  const { add, lines, settings: store } = useCart();
  const { payments } = store;
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.stock !== 0)?.id ?? product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // En celular, cuando el bloque de compra sale de pantalla aparece un botón flotante.
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
  const tag = "border border-line-2 px-3 py-1.5 font-mono text-xs";

  return (
    <>
      <section className="grid border border-fg bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Espécimen: el vial grande entre filetes, con su regla */}
        <div className="flex min-w-0 flex-col border-b border-fg lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="label text-fg">Espécimen</span>
            <span className="label min-w-0 truncate">{product.lot ? `Lote ${product.lot}` : product.category}</span>
          </div>
          <div className="relative grid flex-1 place-items-center px-8 py-10 md:py-14">
            <Ruler />
            <ProductImage product={product} className="h-[280px] w-auto max-w-full md:h-[420px]" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
            <span className="label">Formato</span>
            <span className="min-w-0 text-right font-mono text-[0.8125rem] [overflow-wrap:anywhere]">{product.form}</span>
          </div>
        </div>

        {/* Hoja: nombre, compra y datos */}
        <div className="flex min-w-0 flex-col">
          <div className="border-b border-line p-5 sm:p-8">
            <p className="label flex items-center gap-2.5 text-fg"><span className="mark" aria-hidden="true" />{product.category}</p>
            <h1 className="mt-4 break-words font-display text-[clamp(2.25rem,6vw,4.25rem)] font-medium leading-[0.96] tracking-[-0.045em]">{product.name}</h1>
            <p className="mt-4 max-w-[46ch] text-lg text-muted">{product.short}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              <li className={`${tag} bg-fg text-bg`}>{stockLine}</li>
              {showCertificates && <li className={tag}>Pureza {product.purity.replace(" (HPLC)", "")}</li>}
              {showCertificates && <li className={tag}>COA por lote</li>}
              {product.rating && (
                <li>
                  <a href="#resenas" className={`${tag} flex items-center gap-1.5 transition-colors hover:bg-fg hover:text-bg`}>
                    <Stars value={product.rating.avg} className="text-sm" />
                    {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · {product.rating.count} {product.rating.count === 1 ? "reseña" : "reseñas"}
                  </a>
                </li>
              )}
              {product.cas && <li className={tag}>CAS {product.cas}</li>}
            </ul>
          </div>

          {/* Compra */}
          <div ref={cardRef} className="border-b border-line p-5 sm:p-8">
            <p id="presentacion" className="label text-fg">Presentación</p>
            <div role="group" aria-labelledby="presentacion" className="mt-3 divide-y divide-line border border-fg">
              {product.variants.map((v) => {
                const on = v.id === variant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setVariantId(v.id); setQty(1); }}
                    aria-pressed={on}
                    className={`flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors ${on ? "bg-fg text-bg" : "hover:bg-surface-2"} ${v.stock === 0 ? "opacity-60" : ""}`}
                  >
                    <span aria-hidden="true" className={`grid h-4 w-4 shrink-0 place-items-center border-2 ${on ? "border-bg bg-signal" : "border-line-2"}`} />
                    <span className="min-w-0 grow font-medium [overflow-wrap:anywhere]">{v.label}</span>
                    {v.stock === 0 ? (
                      <span className={`shrink-0 text-xs ${on ? "text-bg/80" : "text-muted"}`}>Sin stock</span>
                    ) : (
                      <span className="shrink-0 text-right font-mono">
                        <span className="block font-medium">{formatCLP(v.price)}</span>
                        {v.compareAt && v.compareAt > v.price && <span className={`block text-[0.8125rem] line-through ${on ? "text-bg/80" : "text-muted"}`}>{formatCLP(v.compareAt)}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p key={variant.id} className="animate-fade font-display text-5xl font-medium leading-none tracking-[-0.04em]">{formatCLP(variant.price)}</p>
                <p className="label mt-2">IVA incluido</p>
              </div>
              {discount > 0 && (
                <span className="bg-signal px-2.5 py-1 font-mono text-xs font-semibold text-[#111111]">-{pct}% · Ahorras {formatCLP(discount)}</span>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <div className="flex items-center border border-line-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-12 w-11 place-items-center text-lg transition-colors hover:bg-surface-2" aria-label="Menos"><span aria-hidden="true">−</span></button>
                <span className="w-8 text-center font-mono text-sm">{qty}</span>
                <button onClick={() => setQty(Math.min(max, qty + 1))} className="grid h-12 w-11 place-items-center text-lg transition-colors hover:bg-surface-2" aria-label="Más"><span aria-hidden="true">+</span></button>
              </div>
              <button disabled={soldOut} onClick={() => add(variant.id, qty)} className="btn-primary min-h-12 flex-1">
                {soldOut ? "Agotado" : inCart > 0 ? `En carrito · ${inCart}` : "Agregar al carrito"}
              </button>
            </div>

            {soldOut && (
              <div className="mt-4 border border-line-2 bg-surface-2 p-4 text-sm">
                <p className="font-medium">¿Te avisamos cuando vuelva?</p>
                <div className="mt-2"><Newsletter source="stock" product={product.slug} cta="Avísame" done="Listo: te escribimos cuando vuelva a estar disponible." compact /></div>
              </div>
            )}

            <ul className="mt-5 space-y-1.5 text-sm text-muted">
              {[
                settings.shippingNote,
                `Envío gratis sobre ${formatCLP(settings.freeShippingFrom)}`,
                ...(showCertificates ? ["Certificado de análisis del lote incluido"] : []),
                payLine,
              ].map((t) => (
                <li key={t} className="flex items-start gap-2"><Icon name="check" size={16} className="mt-1 shrink-0 text-fg" />{t}</li>
              ))}
            </ul>
            {product.coaUrl && (
              <a href={product.coaUrl} target="_blank" rel="noreferrer" className="btn-ghost mt-4 w-full text-sm">Ver certificado del lote</a>
            )}
          </div>

          {/* Tabla de datos técnicos */}
          <dl className="mt-auto">
            {specs.map(([k, v]) => (
              <div key={k} className="grid gap-x-4 gap-y-0.5 border-b border-line px-5 py-3 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:px-8">
                <dt className="label pt-0.5">{k}</dt>
                <dd className={`min-w-0 text-[0.9375rem] font-medium [overflow-wrap:anywhere] ${k === "CAS" ? "font-mono" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SectionIndex items={index} />
      <div className="min-w-0">{children}</div>

      {/* Botón flotante en celular cuando el bloque de compra no está a la vista */}
      {!cardVisible && !soldOut && (
        <button
          onClick={() => add(variant.id, qty)}
          className="btn-primary animate-fade fixed bottom-5 right-4 z-40 lg:hidden"
        >
          {inCart > 0 ? `En carrito · ${inCart}` : `Agregar · ${formatCLP(variant.price)}`}
        </button>
      )}
    </>
  );
}

// Índice de secciones: una tira de enlaces que queda fija bajo el encabezado y marca la sección visible.
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
    <nav aria-label="Índice de la ficha" className="z-20 mt-6 border border-fg bg-bg md:sticky md:top-[calc(var(--bar-h)+var(--head-h))]">
      <ol className="flex overflow-x-auto">
        {items.map((it, i) => (
          <li key={it.id} className="shrink-0">
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "true" : undefined}
              className={`flex min-h-12 items-baseline gap-2 border-b-[3px] px-4 py-3 text-sm font-medium transition-colors ${active === it.id ? "border-signal text-fg" : "border-transparent text-muted hover:text-fg"}`}
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
