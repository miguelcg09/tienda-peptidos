"use client";

import { useState } from "react";
import { formatCLP, type Product } from "@/lib/products";
import type { Settings } from "@/lib/config";
import { useCart } from "./CartProvider";

// Cabecera de la ficha (título, insignias, selector de presentación) y barra de compra fija.
// Ambas partes comparten la presentación elegida, por eso viven en el mismo componente.
export function ProductPurchase({ product, settings }: { product: Product; settings: Settings }) {
  const { add, lines } = useCart();
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.stock !== 0)?.id ?? product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  if (!variant) return <p className="text-muted">Sin presentaciones disponibles.</p>;

  const soldOut = variant.stock === 0;
  const max = variant.stock == null ? 99 : Math.min(99, variant.stock);
  const inCart = lines.find((l) => l.variantId === variant.id)?.qty ?? 0;
  const discount = variant.compareAt && variant.compareAt > variant.price ? variant.compareAt - variant.price : 0;
  const pct = discount ? Math.round((discount / variant.compareAt!) * 100) : 0;

  const stockBadge = soldOut
    ? { text: "Sin stock", cls: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300" }
    : variant.stock == null || variant.stock > 20
      ? { text: "En stock · Más de 20 unidades", cls: "border-accent/40 bg-accent/10 text-lime" }
      : { text: `En stock · Quedan ${variant.stock} unidades`, cls: "border-accent-2/40 bg-accent-2/10 text-accent-2" };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            {product.name} <span className="text-accent">· {variant.label}</span>
          </h1>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs font-medium md:pt-8">
          <li className={`rounded-full border px-3 py-1.5 ${stockBadge.cls}`}>{stockBadge.text}</li>
          <li className="rounded-full border bg-surface px-3 py-1.5">Pureza {product.purity.replace(" (HPLC)", "")}</li>
          <li className="rounded-full border bg-surface px-3 py-1.5">Certificado por lote</li>
        </ul>
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Tamaño del vial</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((v) => {
          const on = v.id === variant.id;
          return (
            <button
              key={v.id}
              onClick={() => { setVariantId(v.id); setQty(1); }}
              aria-pressed={on}
              className={`min-w-[7rem] rounded-2xl border px-4 py-3 text-left transition ${
                on ? "border-accent bg-accent/10 shadow-sm" : "bg-surface hover:border-accent/60"
              } ${v.stock === 0 ? "opacity-60" : ""}`}
            >
              <span className={`block font-display text-lg font-bold ${on ? "text-accent" : ""}`}>{v.label}</span>
              <span className="block text-xs text-muted">{v.stock === 0 ? "Sin stock" : formatCLP(v.price)}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de compra fija al pie de la pantalla */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <div>
            <div className="flex items-baseline gap-2">
              <p key={variant.id} className="animate-fade font-display text-3xl font-bold md:text-4xl">{formatCLP(variant.price)}</p>
              {discount > 0 && <p className="text-sm text-muted line-through">{formatCLP(variant.compareAt!)}</p>}
            </div>
            <p className="text-xs text-muted">
              {discount > 0 ? (
                <><span className="rounded bg-fg px-1.5 py-0.5 font-semibold text-bg">-{pct}%</span> Ahorras {formatCLP(discount)} · IVA incluido</>
              ) : (
                "IVA incluido"
              )}
            </p>
          </div>
          <p className="hidden max-w-xs text-xs text-muted lg:block">
            🚚 {settings.shippingNote}. Gratis sobre {formatCLP(settings.freeShippingFrom)}.
          </p>
          <div className="ml-auto flex items-center gap-2">
            {product.coaUrl && (
              <a href={product.coaUrl} target="_blank" rel="noreferrer" className="btn-ghost hidden text-sm sm:inline-flex">Ver COA</a>
            )}
            <div className="flex items-center rounded-full border bg-surface">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted hover:text-fg" aria-label="Menos">−</button>
              <span className="w-6 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(max, qty + 1))} className="px-3 py-2 text-muted hover:text-fg" aria-label="Más">+</button>
            </div>
            <button disabled={soldOut} onClick={() => add(variant.id, qty)} className="btn-primary">
              {soldOut ? "Agotado" : inCart > 0 ? `🛒 En carrito · ${inCart}` : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
