import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { tint, tintHover } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { Stars } from "./Stars";

// Acción de la tarjeta: botón lleno del ancho de la tarjeta, igual para "Agregar" y "Elegir presentación"
const cta = "btn-primary !min-h-11 w-full !px-4 !text-sm";

// Tarjeta de pieza: marco blanco con el vial sobre el tono claro de su color, etiquetas chicas arriba,
// nombre como rótulo de frasco, presentaciones, precio y un solo botón abajo.
export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const compare = product.variants.find((v) => v.price === from)?.compareAt ?? null;
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const vars = { "--card-bg": tint(product.color), "--card-hover": tintHover(product.color) } as CSSProperties;
  return (
    <article className="group/card flex h-full min-w-0 flex-col rounded-card border bg-surface p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-fg/25 hover:shadow-[0_14px_30px_-20px_rgb(20_32_27/0.45)]" style={vars}>
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-[5/4] rounded-[calc(var(--r-card)-0.25rem)] bg-[var(--card-bg)] text-[#14201b] outline-offset-2 transition-colors duration-300 hover:bg-[var(--card-hover)] group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-2 group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-solid"
      >
        <span className="chip absolute left-3 top-3 bg-[#fbfaf6]/85 text-[#14201b]">
          {index !== undefined && <span className="text-[#58625c]">{String(index + 1).padStart(2, "0")}</span>}
          {product.category}
        </span>
        {soldOut && <span className="chip absolute right-3 top-3 bg-[#14201b] text-[#f4f2ec]">Agotado</span>}
        {!soldOut && lowStock !== null && <span className="chip absolute right-3 top-3 bg-[#c0391b] text-white">Últimas {lowStock}</span>}
        {!soldOut && lowStock === null && <span className="chip absolute right-3 top-3 bg-[#dbe97a] text-[#12302a]"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#2f7a3f]" />Disponible</span>}
        <span className="absolute inset-x-0 bottom-[7%] top-[16%] flex justify-center">
          <ProductImage product={product} className="h-full w-auto max-w-[70%] transition-transform duration-300 group-hover/card:-translate-y-1 motion-reduce:transform-none" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-1.5 pt-4">
        <Heading className="t-label break-words text-[1.15rem]">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{product.name}</Link>
        </Heading>
        <ul className="flex flex-wrap gap-1.5" aria-label="Presentaciones">
          {product.variants.map((v) => (
            <li key={v.id} className={`chip border border-line ${v.stock === 0 ? "text-muted line-through" : ""}`}>{v.label}</li>
          ))}
          <li className="chip text-muted">{product.form}</li>
        </ul>
        {product.rating && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating.avg} className="text-sm" />
            {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({product.rating.count})
          </p>
        )}
        {/* Precio y acción siempre abajo y alineados entre tarjetas */}
        <div className="mt-auto flex flex-col gap-3 pt-3">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {product.variants.length > 1 && <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">Desde</span>}
            <span className="text-xl font-bold tracking-tight">{formatCLP(from)}</span>
            {compare && compare > from && <s className="text-sm text-muted">{formatCLP(compare)}</s>}
          </p>
          {quick ? (
            <QuickAdd variantId={quick.id} name={product.name} className={cta} />
          ) : soldOut ? (
            <Link href={`/productos/${product.slug}`} className="btn-ghost !min-h-11 w-full !px-4 !text-sm">Avísame cuando vuelva</Link>
          ) : (
            product.variants.length > 1 && (
              <Link href={`/productos/${product.slug}`} className={cta}>Elegir presentación</Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
