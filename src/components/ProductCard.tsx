import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { tint, tintHover } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { Stars } from "./Stars";

// Acción de la tarjeta: misma forma para "Agregar" y "Ver presentaciones", del ancho de la tarjeta si es angosta
const cta = "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-btn border border-fg px-4 text-sm font-semibold transition-colors hover:bg-fg hover:text-bg @min-[22rem]:w-auto @min-[22rem]:min-w-[10.5rem]";

// Tarjeta de pieza: panel con el tono claro del color del producto, nombre, línea, precio y "+".
export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const vars = { "--card-bg": tint(product.color), "--card-hover": tintHover(product.color) } as CSSProperties;
  return (
    <article className="group/card flex h-full min-w-0 flex-col gap-4" style={vars}>
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square rounded-card bg-[var(--card-bg)] text-[#0b0f10] outline-2 outline-offset-2 transition-colors duration-300 hover:bg-[var(--card-hover)] group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline sm:aspect-[4/5]"
      >
        {index !== undefined && <span className="absolute left-5 top-4 font-mono text-xs tracking-widest">{String(index + 1).padStart(2, "0")}</span>}
        {soldOut && <span className="absolute right-4 top-4 rounded-btn bg-[#0b0f10] px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-[#f4f6f6]">Agotado</span>}
        {!soldOut && lowStock !== null && <span className="absolute right-4 top-4 rounded-btn bg-[#0b0f10] px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-[#f4f6f6]">Últimas {lowStock}</span>}
        <span className="absolute inset-x-0 inset-y-[11%] flex justify-center">
          <ProductImage product={product} className="h-full w-auto max-w-[80%]" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5">
        <Heading className="break-words font-display text-2xl font-medium leading-tight tracking-tight">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{product.name}</Link>
        </Heading>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{product.category}</p>
        <p className="font-mono text-xs text-muted">{product.variants.map((v) => v.label).join(" / ")} · {product.form}</p>
        {product.rating && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating.avg} className="text-sm" />
            {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({product.rating.count})
          </p>
        )}
        {/* Precio y acción siempre abajo y alineados entre tarjetas: en una fila si la tarjeta es ancha, apilados si es angosta */}
        <div className="@container mt-auto pt-4">
          <div className="flex flex-col gap-3 @min-[22rem]:flex-row @min-[22rem]:items-center @min-[22rem]:justify-between">
            <p className="text-lg font-semibold">
              {product.variants.length > 1 && <span className="text-sm font-normal text-muted">Desde </span>}
              {formatCLP(from)}
            </p>
            {quick ? (
              <QuickAdd variantId={quick.id} name={product.name} className={cta} />
            ) : (
              !soldOut && product.variants.length > 1 && (
                <Link href={`/productos/${product.slug}`} className={cta}>Ver presentaciones</Link>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
