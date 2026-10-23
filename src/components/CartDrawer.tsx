"use client";

import Link from "next/link";
import { useRef } from "react";
import { useDialog } from "@/lib/useDialog";
import { useCart } from "./CartProvider";
import { formatCLP } from "@/lib/products";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, find, settings } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  useDialog(panel, open, () => setOpen(false));
  if (!open) return null;
  const missing = settings.freeShippingFrom - subtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade absolute inset-0 bg-fg/40" onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="carrito-titulo" className="animate-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface sm:rounded-l-[2rem]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="carrito-titulo" className="flex items-center gap-3 font-display text-xl font-semibold">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="cart" size={20} /></span>
            Tu carrito
          </h2>
          <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg" aria-label="Cerrar el carrito"><Icon name="close" size={22} /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-muted">
            <span aria-hidden="true" className="animate-float grid h-24 w-24 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="cart" size={44} /></span>
            <p>Tu carrito está vacío.</p>
            <Link href="/productos" onClick={() => setOpen(false)} className="btn-primary group/ver gap-2 text-sm">
              Ver productos <Icon name="arrow" size={16} className="transition-transform group-hover/ver:translate-x-1" />
            </Link>
          </div>
        ) : (
          <>
            {missing > 0 && (
              <div className="px-5 pt-4 text-sm text-muted">
                <p>Te faltan <strong>{formatCLP(missing)}</strong> para envío gratis.</p>
                {/* El camión avanza con la barra hasta el envío gratis */}
                <div className="relative mt-3 h-1.5 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / settings.freeShippingFrom) * 100)}%` }} />
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-accent-2 transition-all duration-500"
                    style={{ left: `clamp(1rem, ${Math.min(100, (subtotal / settings.freeShippingFrom) * 100)}%, calc(100% - 1rem))` }}
                  >
                    <Icon name="truck" size={16} />
                  </span>
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => {
                const found = find(line.variantId);
                if (!found) return null;
                const { product, variant } = found;
                return (
                  <li key={line.variantId} className="animate-slide flex gap-4 py-4">
                    <div className="grid h-20 w-14 shrink-0 place-items-center rounded-xl bg-surface-2 p-1">
                      <ProductImage product={product} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium">{product.name}</p>
                      <p className="break-words text-sm text-muted">{variant.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(line.variantId, line.qty - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-control transition-colors hover:border-accent hover:bg-surface-2" aria-label={`Quitar uno de ${product.name}`}><Icon name="minus" size={16} /></button>
                        <span className="w-6 text-center text-sm">{line.qty}<span className="sr-only"> {line.qty === 1 ? "unidad" : "unidades"}</span></span>
                        <button onClick={() => setQty(line.variantId, line.qty + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-control transition-colors hover:border-accent hover:bg-surface-2" aria-label={`Agregar uno de ${product.name}`}><Icon name="plus" size={16} /></button>
                        <button onClick={() => remove(line.variantId)} aria-label={`Eliminar ${product.name} del carrito`} className="ml-auto inline-flex min-h-9 items-center gap-1 px-1 text-xs text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"><Icon name="trash" size={14} />Eliminar</button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatCLP(variant.price * line.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line p-5">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary group/pay mt-4 w-full gap-2">
                <Icon name="lock" size={18} />
                Ir a pagar
                <Icon name="arrow" size={16} className="transition-transform group-hover/pay:translate-x-1" />
              </Link>
              <Link href="/carrito" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-muted underline">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
