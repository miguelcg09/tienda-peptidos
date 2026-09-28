"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { findVariant, formatCLP } from "@/lib/products";
import { store } from "@/lib/config";
import { Vial } from "./Vial";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove } = useCart();
  if (!open) return null;
  const missing = store.freeShippingFrom - subtotal;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={() => setOpen(false)} className="text-2xl leading-none text-slate-500" aria-label="Cerrar">×</button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-slate-500">
            <p>Tu carrito está vacío.</p>
            <Link href="/productos" onClick={() => setOpen(false)} className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {missing > 0 && (
              <p className="bg-mist px-5 py-3 text-sm text-slate-600">
                Te faltan <strong>{formatCLP(missing)}</strong> para envío gratis.
              </p>
            )}
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {lines.map((line) => {
                const found = findVariant(line.variantId);
                if (!found) return null;
                const { product, variant } = found;
                return (
                  <li key={line.variantId} className="flex gap-4 py-4">
                    <div className="h-20 w-14 shrink-0 rounded-lg bg-mist p-1">
                      <Vial color={product.color} label={product.name} className="h-full w-full" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500">{variant.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => setQty(line.variantId, line.qty - 1)} className="h-7 w-7 rounded border" aria-label="Quitar uno">−</button>
                        <span className="w-6 text-center text-sm">{line.qty}</span>
                        <button onClick={() => setQty(line.variantId, line.qty + 1)} className="h-7 w-7 rounded border" aria-label="Agregar uno">+</button>
                        <button onClick={() => remove(line.variantId)} className="ml-auto text-xs text-slate-400 hover:text-red-600">Eliminar</button>
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
              <Link href="/checkout" onClick={() => setOpen(false)} className="mt-4 block rounded-full bg-brand py-3 text-center font-medium text-white hover:bg-brand-dark">
                Ir a pagar
              </Link>
              <Link href="/carrito" onClick={() => setOpen(false)} className="mt-2 block text-center text-sm text-slate-500 underline">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
