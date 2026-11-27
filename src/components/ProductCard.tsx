import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { tint } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { Stars } from "./Stars";

// Acción de la tarjeta: botón lleno del ancho de la tarjeta, igual para "Agregar" y "Elegir presentación"
const cta = "btn-ghost !min-h-11 w-full !justify-between !px-4 !text-sm hover:!border-accent hover:!bg-accent hover:!text-on-accent";

// Tarjeta de pieza como módulo de ficha técnica: fila de datos arriba, la pieza sobre fondo neutro con su
// color solo en la tapa, nombre, tabla corta (presentaciones y forma), precio y un botón.
export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const compare = product.variants.find((v) => v.price === from)?.compareAt ?? null;
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const status = soldOut ? { dot: "bg-muted", text: "Agotado" } : lowStock !== null ? { dot: "bg-accent", text: `Últimas ${lowStock}` } : { dot: "bg-ok", text: "En stock" };
  return (
    <article data-reveal={index ?? 0} className="reveal-inner group/card flex h-full min-w-0 flex-col bg-surface" style={{ "--card-tint": tint(product.color) } as CSSProperties}>
      <p className="flex items-center justify-between gap-3 border-b px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        <span className="min-w-0 truncate">{index !== undefined && <span className="mr-2 text-fg">{String(index + 1).padStart(2, "0")}</span>}{product.category}</span>
        <span className="flex shrink-0 items-center gap-1.5"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.text}</span>
      </p>
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-[5/4] overflow-hidden outline-offset-[-2px] group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-2 group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-solid"
      >
        {/* Al pasar el mouse el fondo toma el tono del producto desde abajo y el vial se levanta y se inclina */}
        <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--card-tint)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:scale-y-100" />
        <span className="absolute inset-x-0 bottom-[6%] top-[8%] flex justify-center">
          <ProductImage product={product} className="h-full w-auto max-w-[70%] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:-translate-y-2 group-hover/card:-rotate-6 group-hover/card:scale-105" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t px-4 pb-4 pt-4">
        <Heading className="t-label break-words text-[1.4rem]">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{product.name}</Link>
        </Heading>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
          <dt className="uppercase tracking-[0.08em] text-muted">Formato</dt>
          <dd className="min-w-0 break-words">{product.variants.map((v) => v.label).join(" / ")}</dd>
          <dt className="uppercase tracking-[0.08em] text-muted">Forma</dt>
          <dd className="min-w-0 break-words">{product.form}</dd>
        </dl>
        {product.rating && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating.avg} className="text-sm" />
            {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({product.rating.count})
          </p>
        )}
        {/* Precio y acción siempre abajo y alineados entre tarjetas */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <p className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
            {product.variants.length > 1 && <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">Desde</span>}
            <span className="text-xl font-semibold tracking-tight">{formatCLP(from)}</span>
            {compare && compare > from && <s className="text-sm text-muted">{formatCLP(compare)}</s>}
          </p>
          {quick ? (
            <QuickAdd variantId={quick.id} name={product.name} className={cta} />
          ) : soldOut ? (
            <Link href={`/productos/${product.slug}`} className="btn-ghost !min-h-11 w-full !px-4 !text-sm">Avísame cuando vuelva</Link>
          ) : (
            product.variants.length > 1 && (
              <Link href={`/productos/${product.slug}`} className={cta}>Elegir presentación <span aria-hidden="true" className="font-mono transition-transform duration-200 group-hover/card:translate-x-1">→</span></Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
