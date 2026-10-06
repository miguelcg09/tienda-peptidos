"use client";

import Link from "next/link";
import { useRef } from "react";
import { useDialog } from "@/lib/useDialog";
import { useCart } from "./CartProvider";
import { formatCLP } from "@/lib/products";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, find, settings } = useCart();
  const panel = useRef<HTMLElement>(null);
  useDialog(panel, open, () => setOpen(false));
  if (!open) return null;
  const missing = settings.freeShippingFrom - subtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-hidden="true" />
      <aside ref={panel} role="dialog" aria-modal="true" aria-labelledby="carrito-titulo" className="animate-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="carrito-titulo" className="font-display text-lg font-semibold">Tu carrito</h2>
          <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center text-2xl leading-none text-muted hover:text-fg" aria-label="Cerrar el carrito"><span aria-hidden="true">×</span></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-muted">
            <p>Tu carrito está vacío.</p>
            <Link href="/productos" onClick={() => setOpen(false)} className="btn-primary text-sm">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {missing > 0 && (
              <div className="px-5 pt-4 text-sm text-muted">
                <p>Te faltan <strong>{formatCLP(missing)}</strong> para envío gratis.</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tint/5">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / settings.freeShippingFrom) * 100)}%` }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {lines.map((line) => {
                const found = find(line.variantId);
                if (!found) return null;
                const { product, variant } = found;
                return (
                  <li key={line.variantId} className="flex gap-4 py-4">
                    <div className="grid h-20 w-14 shrink-0 place-items-center rounded-btn bg-tint/5 p-1">
                      <ProductImage product={product} className="h-full w-full" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted">{variant.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(line.variantId, line.qty - 1)} className="h-9 w-9 rounded-btn border hover:border-accent" aria-label={`Quitar uno de ${product.name}`}>−</button>
                        <span className="w-6 text-center text-sm">{line.qty}<span className="sr-only"> {line.qty === 1 ? "unidad" : "unidades"}</span></span>
                        <button onClick={() => setQty(line.variantId, line.qty + 1)} className="h-9 w-9 rounded-btn border hover:border-accent" aria-label={`Agregar uno de ${product.name}`}>+</button>
                        <button onClick={() => remove(line.variantId)} aria-label={`Eliminar ${product.name} del carrito`} className="ml-auto min-h-9 px-1 text-xs text-muted underline-offset-4 hover:text-fg hover:underline">Eliminar</button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatCLP(variant.price * line.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t p-5">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">
                Ir a pagar
              </Link>
              <Link href="/carrito" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-muted underline">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
