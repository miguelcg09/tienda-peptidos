import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { tint } from "@/lib/colors";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { Stars } from "./Stars";
import { T } from "./T";

// Acción de la tarjeta: botón lleno del ancho de la tarjeta, igual para "Agregar" y "Elegir presentación"
const cta = "btn-ghost !min-h-11 w-full !justify-between !px-4 !text-sm hover:!border-accent hover:!bg-accent hover:!text-on-accent";

// Tarjeta de pieza como ficha técnica: stock sobre la foto, categoría sobre el nombre, presentaciones en regleta,
// precio en caja verde clara y un botón.
export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const compare = product.variants.find((v) => v.price === from)?.compareAt ?? null;
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const status = soldOut ? { dot: "bg-[#9ca3af]", text: <T k="ficha.agotado" /> } : lowStock !== null ? { dot: "bg-[#f59e0b]", text: <T k="ficha.ultimas" vars={{ n: lowStock }} /> } : { dot: "bg-[#4ade80]", text: <T k="ficha.enStock" /> };
  return (
    <article data-reveal={index ?? 0} className="reveal-inner group/card flex h-full min-w-0 flex-col bg-surface" style={{ "--card-tint": tint(product.color) } as CSSProperties}>
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-[5/4] overflow-hidden outline-offset-[-2px] group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-2 group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-solid"
      >
        {/* Al pasar el mouse el fondo toma el tono del producto desde abajo y el vial se levanta y se inclina */}
        <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--card-tint)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:scale-y-100" />
        {/* Estado de stock sobre la foto */}
        <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-fg px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-bg"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${status.dot}`} />{status.text}</span>
        <span className="absolute inset-x-0 bottom-[6%] top-[8%] flex justify-center">
          <ProductImage product={product} className="h-full w-auto max-w-[70%] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:-translate-y-2 group-hover/card:-rotate-6 group-hover/card:scale-105" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t px-4 pb-4 pt-4">
        {/* Nombre grande y apretado, con una línea corta en texto normal debajo para que se lea como titular y bajada */}
        <div className="flex flex-col gap-1.5">
          <p className="flex items-center gap-2 font-mono text-[0.8rem] font-bold uppercase tracking-[0.1em] text-accent">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: product.color }} />
            <span className="min-w-0 truncate">{product.category}</span>
            <span className="sr-only">, {status.text}</span>
          </p>
          <Heading className="t-label break-words text-[1.7rem] tracking-[-0.04em] transition-colors duration-200 group-hover/card:text-accent">
            <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] focus-visible:outline-none focus-visible:underline">{product.name}</Link>
          </Heading>
          {product.short && <p className="line-clamp-2 text-[0.95rem] leading-snug text-muted">{product.short}</p>}
        </div>
        {/* Presentaciones como pastillas y la forma al lado, en vez de una tabla */}
        <div className="flex flex-wrap items-center gap-y-1.5">
          {product.variants.map((v) => (
            <span key={v.id} className="-ml-px border border-fg px-3 py-1.5 font-mono text-sm font-bold tabular-nums first:ml-0">{v.label}</span>
          ))}
          <span className="ml-2 text-sm text-muted">{product.form}</span>
        </div>
        {product.rating && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating.avg} className="text-sm" />
            {product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({product.rating.count})
          </p>
        )}
        {/* Precio y acción siempre abajo y alineados entre tarjetas */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <p className="flex flex-wrap items-baseline gap-x-2 self-start rounded-[0.1875rem] border border-accent bg-[#e6f2ee] px-3 py-2 tabular-nums text-accent">
            {product.variants.length > 1 && <span className="font-mono text-xs uppercase tracking-[0.1em]"><T k="ficha.desde" /></span>}
            <span className="text-2xl font-bold leading-none tracking-[-0.03em]">{formatCLP(from)}</span>
            {compare && compare > from && <s className="text-sm text-muted">{formatCLP(compare)}</s>}
          </p>
          {quick ? (
            <QuickAdd variantId={quick.id} name={product.name} className={cta} />
          ) : soldOut ? (
            <Link href={`/productos/${product.slug}`} className="btn-ghost !min-h-11 w-full !px-4 !text-sm"><T k="ficha.avisame" /></Link>
          ) : (
            product.variants.length > 1 && (
              <Link href={`/productos/${product.slug}`} className={cta}><T k="ficha.elegir" /> <span aria-hidden="true" className="font-mono transition-transform duration-200 group-hover/card:translate-x-1">→</span></Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
