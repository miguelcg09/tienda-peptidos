"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/products";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";

export default function Carrito() {
  const { lines, subtotal, shipping, total, setQty, remove, find, ready } = useCart();

  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">Cargando tu carrito…</div>;
  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span aria-hidden="true" className="animate-float mb-6 grid h-28 w-28 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="cart" size={52} /></span>
        <h1 className="t-page">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-primary group/ver mt-6 gap-2">
          Ver productos <Icon name="arrow" size={16} className="transition-transform group-hover/ver:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <h1 className="t-page">Carrito</h1>
        <ul className="mt-6 divide-y overflow-hidden rounded-[1.75rem] border bg-surface">
          {lines.map((line) => {
            const found = find(line.variantId);
            if (!found) return null;
            const { product, variant } = found;
            return (
              <li key={line.variantId} className="animate-slide flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                <div className="h-24 w-16 shrink-0 rounded-xl bg-surface-2 p-1">
                  <ProductImage product={product} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1 basis-40">
                  <Link href={`/productos/${product.slug}`} className="break-words font-medium hover:text-accent-2">{product.name}</Link>
                  <p className="break-words text-sm text-muted">{variant.label} · {formatCLP(variant.price)}</p>
                  <button onClick={() => remove(line.variantId)} aria-label={`Eliminar ${product.name} del carrito`} className="mt-1 inline-flex min-h-8 items-center gap-1 pr-3 text-xs text-muted transition-colors hover:text-fg"><Icon name="trash" size={14} />Eliminar</button>
                </div>
                <div className="flex items-center rounded-full border border-control">
                  <button onClick={() => setQty(line.variantId, line.qty - 1)} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-surface-2" aria-label={`Quitar uno de ${product.name}`}><Icon name="minus" size={16} /></button>
                  <span className="w-8 text-center text-sm">{line.qty}</span>
                  <button onClick={() => setQty(line.variantId, line.qty + 1)} className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-surface-2" aria-label={`Agregar uno de ${product.name}`}><Icon name="plus" size={16} /></button>
                </div>
                <p className="ml-auto min-w-24 text-right font-semibold">{formatCLP(variant.price * line.qty)}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-[1.75rem] border bg-surface p-6 lg:sticky lg:top-[calc(var(--bar-h)+6.5rem)]">
        <h2 className="flex items-center gap-3 font-display text-lg font-semibold"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="receipt" size={18} /></span>Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="flex items-center gap-2"><Icon name="truck" size={16} className="text-accent-2" />Envío</dt><dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatCLP(total)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary group/pay mt-6 w-full gap-2">
          Continuar al pago <Icon name="arrow" size={16} className="transition-transform group-hover/pay:translate-x-1" />
        </Link>
      </aside>
    </div>
  );
}
