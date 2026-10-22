import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";

// Acción de la tarjeta: misma forma para "Agregar" y "Ver presentaciones", del ancho de la tarjeta si es angosta
const cta = "group/cta inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3 text-[0.8125rem] font-semibold text-on-accent transition-colors hover:bg-[var(--btn-hover)] @min-[19rem]:w-auto @min-[19rem]:px-5 @min-[19rem]:text-sm";

const badge = "absolute left-3 top-3 z-10 rounded-full bg-fg px-3 py-1 text-xs font-semibold text-bg";

// Tarjeta de pieza: panel con un toque del color del producto, vial, nombre, un dato técnico (la presentación), precio y acción.
export function ProductCard({ product, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const vars = { "--hue": product.color } as CSSProperties;
  return (
    <article
      className="group/card lift flex h-full min-w-0 flex-col rounded-[1.75rem] border border-line bg-surface p-2 hover:border-control sm:p-2.5"
      style={vars}
    >
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="panel-hue relative block aspect-[5/4] overflow-hidden rounded-[1.3rem] outline-offset-2 group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-2"
      >
        {soldOut && <span className={badge}>Agotado</span>}
        {!soldOut && lowStock !== null && <span className={badge}>Últimas {lowStock}</span>}
        <span className="absolute inset-x-0 inset-y-[8%] flex justify-center transition-transform duration-500 ease-out group-hover/card:-translate-y-2 group-hover/card:rotate-[-3deg] group-hover/card:scale-[1.06]">
          <ProductImage product={product} className="h-full w-auto max-w-[80%]" />
        </span>
        <span aria-hidden="true" className="absolute right-3 top-3 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-surface text-fg opacity-0 transition duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <Icon name="arrow" size={18} className="-rotate-45" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-2 pb-1.5 pt-3 sm:px-2.5">
        <Heading className="break-words font-display text-[1.2rem] font-semibold leading-tight tracking-tight sm:text-xl">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{product.name}</Link>
        </Heading>
        <p className="break-words font-mono text-xs text-muted">{product.variants.map((v) => v.label).join(" / ")}</p>
        {/* Precio y acción siempre abajo y alineados entre tarjetas: en una fila si la tarjeta es ancha, apilados si es angosta */}
        <div className="@container mt-auto pt-3">
          <div className="flex flex-col gap-3 @min-[19rem]:flex-row @min-[19rem]:items-center @min-[19rem]:justify-between">
            <p className="text-lg font-semibold">
              {product.variants.length > 1 && <span className="text-sm font-normal text-muted">Desde </span>}
              {formatCLP(from)}
            </p>
            {quick ? (
              <QuickAdd variantId={quick.id} name={product.name} className={cta} />
            ) : (
              !soldOut && product.variants.length > 1 && (
                <Link href={`/productos/${product.slug}`} className={cta}>Ver presentaciones <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover/cta:translate-x-0.5" /></Link>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
