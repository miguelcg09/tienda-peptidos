"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";

// Destacados que rotan solos cada pocos segundos (se detiene al pasar el mouse).
export function Spotlight({ items }: { items: Product[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const every = 4500;

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), every);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const p = items[i];
  if (!p) return null;
  const from = Math.min(...p.variants.map((v) => v.price));

  return (
    <div
      className="relative overflow-hidden rounded-[2.5rem] border bg-surface shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        key={`bg-${p.slug}`}
        className="animate-fade absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${p.color}14 0%, ${p.color}40 100%)` }}
        aria-hidden
      />
      <div key={p.slug} className="animate-slide relative grid grid-cols-[1fr_auto] items-center gap-4 p-6 md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-2">Destacado</p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight">{p.name}</h2>
          <p className="mt-2 text-sm text-muted">{p.short}</p>
          <p className="mt-4 text-xs text-muted">Desde</p>
          <p className="font-display text-2xl font-bold">{formatCLP(from)}</p>
          <Link href={`/productos/${p.slug}`} className="btn-primary mt-4 text-sm">Ver producto</Link>
        </div>
        <ProductImage product={p} className="animate-float h-48 w-32 drop-shadow-2xl md:h-60 md:w-40" />
      </div>
      {items.length > 1 && (
        <div className="relative flex items-center gap-2 px-6 pb-5 md:px-8">
          {items.map((it, k) => (
            <button
              key={it.slug}
              onClick={() => setI(k)}
              aria-label={`Ver ${it.name}`}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-tint/15"
            >
              {k === i && (
                <span
                  key={`${p.slug}-${paused}`}
                  className="block h-full bg-accent"
                  style={{ animation: paused ? "none" : `grow ${every}ms linear forwards` }}
                />
              )}
              {k < i && <span className="block h-full bg-accent/60" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
