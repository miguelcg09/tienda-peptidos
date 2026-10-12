"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";

export default function Carrito() {
  const { lines, subtotal, shipping, total, setQty, remove, find, ready } = useCart();

  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">Cargando tu carrito…</div>;
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="t-page">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <h1 className="t-page">Carrito</h1>
        <ul className="mt-6 divide-y rounded-card border">
          {lines.map((line) => {
            const found = find(line.variantId);
            if (!found) return null;
            const { product, variant } = found;
            return (
              <li key={line.variantId} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                <div className="h-24 w-16 shrink-0 rounded-lg bg-surface border p-1">
                  <ProductImage product={product} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1 basis-40">
                  <Link href={`/productos/${product.slug}`} className="break-words font-medium hover:text-accent">{product.name}</Link>
                  <p className="break-words text-sm text-muted">{variant.label} · {formatCLP(variant.price)}</p>
                  <button onClick={() => remove(line.variantId)} aria-label={`Eliminar ${product.name} del carrito`} className="mt-1 min-h-8 pr-3 text-xs text-muted hover:text-red-500">Eliminar</button>
                </div>
                <div className="flex items-center rounded-btn border">
                  <button onClick={() => setQty(line.variantId, line.qty - 1)} className="px-3 py-2" aria-label={`Quitar uno de ${product.name}`}>−</button>
                  <span className="w-8 text-center text-sm">{line.qty}</span>
                  <button onClick={() => setQty(line.variantId, line.qty + 1)} className="px-3 py-2" aria-label={`Agregar uno de ${product.name}`}>+</button>
                </div>
                <p className="ml-auto min-w-24 text-right font-semibold">{formatCLP(variant.price * line.qty)}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-card bg-surface border p-6">
        <h2 className="font-semibold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío</dt><dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatCLP(total)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full">
          Continuar al pago
        </Link>
      </aside>
    </div>
  );
}
