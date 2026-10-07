"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatCLP, type Product } from "@/lib/products";
import type { Settings } from "@/lib/config";
import { useCart } from "./CartProvider";
import { field, onColor } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { Newsletter } from "./Newsletter";
import { Stars } from "./Stars";

type IndexItem = { id: string; label: string };

// Zona superior de la ficha: portada con el producto, columna de contenido (children),
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
      {/* Portada: campo plano del color del producto, texto a la izquierda y vial a la derecha */}
      <section className="relative overflow-hidden rounded-card" style={{ background: field(product.color), color: onColor(field(product.color)) }}>
        <div className="relative grid gap-6 p-6 md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-12 md:py-9">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium opacity-90">{product.category}</p>
            <h1 className="mt-3 font-display text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">{product.name}</h1>
            <p className="mt-5 max-w-md text-lg opacity-90">{product.short}</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
              <li className="rounded-btn bg-[#0b0f10] px-3 py-1.5 text-[#f4f6f6]">{stockLine}</li>
              {showCertificates && <li className="rounded-btn border border-current px-3 py-1.5">Pureza {product.purity.replace(" (HPLC)", "")}</li>}
              {showCertificates && <li className="rounded-btn border border-current px-3 py-1.5">COA por lote</li>}
              {product.rating && (
                <li>
                  <a href="#resenas" className="flex items-center gap-1.5 rounded-btn border border-current px-3 py-1.5 transition-opacity hover:opacity-70">
                    <Stars value={product.rating.avg} className="text-sm" />
                    {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · {product.rating.count} {product.rating.count === 1 ? "reseña" : "reseñas"}
                  </a>
                </li>
              )}
              {product.cas && <li className="rounded-btn border border-current px-3 py-1.5">CAS {product.cas}</li>}
            </ul>
          </div>
          <div className="relative grid min-h-[220px] place-items-center md:min-h-0">
            <ProductImage product={product} tone="field" className="relative h-56 w-auto max-w-full md:h-[16.5rem]" />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-[150px_minmax(0,1fr)_360px]">
        <SectionIndex items={index} />
        <div className="min-w-0">{children}</div>

        {/* Tarjeta de compra: fija mientras se lee el contenido */}
        <aside className="order-first md:order-none">
          <div ref={cardRef} className="rounded-card border bg-surface p-5 shadow-lg md:sticky md:top-32">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Presentación</p>
            <div className="mt-2 divide-y rounded-card border">
              {product.variants.map((v) => {
                const on = v.id === variant.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setVariantId(v.id); setQty(1); }}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition first:rounded-t-card last:rounded-b-card ${
                      on ? "bg-accent/10" : "hover:bg-surface-2"
                    } ${v.stock === 0 ? "opacity-50" : ""}`}
                  >
                    <span className={`grid h-4 w-4 place-items-center rounded-full border ${on ? "border-accent bg-accent text-on-accent" : ""}`}>
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-on-accent" />}
                    </span>
                    <span className="grow font-medium">{v.label}</span>
                    {v.stock === 0 ? (
                      <span className="text-xs text-muted">Sin stock</span>
                    ) : (
                      <span className="text-right">
                        <span className="block font-semibold">{formatCLP(v.price)}</span>
                        {v.compareAt && v.compareAt > v.price && <span className="block text-[0.8125rem] text-muted line-through">{formatCLP(v.compareAt)}</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p key={variant.id} className="animate-fade font-display text-4xl font-bold">{formatCLP(variant.price)}</p>
                <p className="text-xs text-muted">IVA incluido</p>
              </div>
              {discount > 0 && (
                <span className="rounded-btn bg-accent-2 px-2.5 py-1 text-xs font-bold text-white">-{pct}% · Ahorras {formatCLP(discount)}</span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex items-center rounded-btn border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted hover:text-fg" aria-label="Menos">−</button>
                <span className="w-6 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(Math.min(max, qty + 1))} className="px-3 py-2 text-muted hover:text-fg" aria-label="Más">+</button>
              </div>
              <button disabled={soldOut} onClick={() => add(variant.id, qty)} className="btn-primary flex-1">
                {soldOut ? "Agotado" : inCart > 0 ? `En carrito · ${inCart}` : "Agregar al carrito"}
              </button>
            </div>

            {soldOut && (
              <div className="mt-4 rounded-card border bg-surface-2 p-3 text-sm">
                <p className="font-medium">¿Te avisamos cuando vuelva?</p>
                <div className="mt-2"><Newsletter source="stock" product={product.slug} cta="Avísame" done="Listo: te escribimos cuando vuelva a estar disponible." compact /></div>
              </div>
            )}

            <ul className="mt-5 space-y-1.5 border-t pt-4 text-xs text-muted">
              <li>✓ {settings.shippingNote}</li>
              <li>✓ Envío gratis sobre {formatCLP(settings.freeShippingFrom)}</li>
              {showCertificates && <li>✓ Certificado de análisis del lote incluido</li>}
              <li>✓ {payLine}</li>
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
          className="btn-primary animate-fade fixed bottom-5 right-4 z-40 shadow-2xl md:hidden"
        >
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
    <nav aria-label="Índice de la ficha" className="hidden md:block">
      <ol className="sticky top-32 space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`flex items-baseline gap-2 rounded-lg px-2 py-1.5 transition ${active === it.id ? "bg-accent/10 text-accent" : "text-muted hover:text-fg"}`}
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
