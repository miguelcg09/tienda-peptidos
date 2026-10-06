import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { tint, tintHover } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { Stars } from "./Stars";

// Tarjeta de pieza: panel con el tono claro del color del producto, nombre, línea, precio y "+".
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const from = Math.min(...product.variants.map((v) => v.price));
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const vars = { "--card-bg": tint(product.color), "--card-hover": tintHover(product.color) } as CSSProperties;
  return (
    <article className="flex h-full min-w-0 flex-col gap-4" style={vars}>
      <Link
        href={`/productos/${product.slug}`}
        aria-label={`Ver ${product.name}`}
        className="relative block aspect-square rounded-card sm:aspect-[4/5] bg-[var(--card-bg)] text-[#0b0f10] transition-colors duration-300 hover:bg-[var(--card-hover)]"
      >
        {index !== undefined && <span className="absolute left-5 top-4 font-mono text-xs tracking-widest">{String(index + 1).padStart(2, "0")}</span>}
        {soldOut && <span className="absolute right-4 top-4 rounded-btn bg-[#0b0f10] px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-[#f4f6f6]">Agotado</span>}
        {!soldOut && lowStock !== null && <span className="absolute right-4 top-4 rounded-btn bg-[#0b0f10] px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-[#f4f6f6]">Últimas {lowStock}</span>}
        <span className="absolute inset-x-0 inset-y-[11%] flex justify-center">
          <ProductImage product={product} className="h-full w-auto max-w-[80%]" />
        </span>
      </Link>
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="font-display text-2xl font-medium leading-tight tracking-tight [overflow-wrap:anywhere]">
            <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline">{product.name}</Link>
          </h3>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{product.category}</p>
          <p className="font-mono text-xs text-muted">{product.variants.map((v) => v.label).join(" / ")} · {product.form}</p>
          {product.rating && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Stars value={product.rating.avg} className="text-sm" />
              {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({product.rating.count})
            </p>
          )}
          <p className="pt-1 text-lg font-semibold">
            {product.variants.length > 1 && <span className="text-sm font-normal text-muted">Desde </span>}
            {formatCLP(from)}
          </p>
        </div>
        {quick ? (
          <QuickAdd variantId={quick.id} name={product.name} />
        ) : (
          !soldOut && product.variants.length > 1 && (
            <Link href={`/productos/${product.slug}`} className="shrink-0 pb-1 text-sm font-medium underline underline-offset-[5px]">Ver presentaciones</Link>
          )
        )}
      </div>
    </article>
  );
}
