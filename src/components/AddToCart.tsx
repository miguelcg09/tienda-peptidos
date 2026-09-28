"use client";

import { useState } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId)!;

  return (
    <div>
      <p className="text-3xl font-bold">{formatCLP(variant.price)}</p>
      <p className="text-xs text-slate-500">IVA incluido</p>
      {product.variants.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium">Presentación</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  v.id === variantId ? "border-brand bg-brand text-white" : "border-slate-300 hover:border-brand"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <div className="flex items-center rounded-full border border-slate-300">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2" aria-label="Menos">−</button>
          <span className="w-6 text-center">{qty}</span>
          <button onClick={() => setQty(Math.min(99, qty + 1))} className="px-4 py-2" aria-label="Más">+</button>
        </div>
        <button
          onClick={() => add(variantId, qty)}
          className="flex-1 rounded-full bg-brand py-3 font-medium text-white hover:bg-brand-dark"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
