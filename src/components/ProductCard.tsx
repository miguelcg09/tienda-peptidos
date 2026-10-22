import Link from "next/link";
import { formatCLP, type Product } from "@/lib/products";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";

// Acción de la celda: cuadrada de 44 px; con ancho suficiente muestra también la palabra.
const cta = "inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 border border-line-2 px-3 text-sm font-medium transition-colors hover:border-signal hover:bg-signal hover:text-[#111111]";

// Celda del índice: número, vial, nombre, un dato técnico (las presentaciones), precio y acción. Nada más.
export function ProductCard({ product, index, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const tag = "absolute right-3 top-3 px-2 py-0.5 font-mono text-xs font-medium sm:right-4 sm:top-4";
  return (
    <article className="cell group/card @container relative flex h-full min-w-0 flex-col bg-surface transition-colors duration-200 focus-within:bg-bg hover:bg-bg">
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link href={`/productos/${product.slug}`} aria-hidden="true" tabIndex={-1} className="relative block aspect-square text-fg">
        {index !== undefined && <span className="absolute left-3 top-3 font-mono text-xs text-muted sm:left-4 sm:top-4">{String(index + 1).padStart(2, "0")}</span>}
        {soldOut && <span className={`${tag} bg-fg text-bg`}>Agotado</span>}
        {!soldOut && lowStock !== null && <span className={`${tag} bg-signal text-[#111111]`}>Últimas {lowStock}</span>}
        <span className="absolute inset-x-0 inset-y-[11%] flex justify-center transition-transform duration-300 ease-out group-focus-within/card:-translate-y-1.5 group-hover/card:-translate-y-1.5">
          <ProductImage product={product} className="h-full w-auto max-w-[80%]" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col border-t border-line px-3.5 pb-3.5 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <Heading className="break-words font-display text-[1.0625rem] font-medium leading-tight tracking-tight sm:text-xl">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline">{product.name}</Link>
        </Heading>
        <p className="mt-1.5 break-words font-mono text-xs text-muted">{product.variants.map((v) => v.label).join(" / ")}</p>
        {/* Precio y acción siempre abajo y alineados entre celdas */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2 pt-4">
          <p className="min-w-0 font-mono text-[1.0625rem] font-medium">
            {product.variants.length > 1 && <span className="block text-xs font-normal text-muted">Desde</span>}
            {formatCLP(from)}
          </p>
          {quick ? (
            <QuickAdd variantId={quick.id} name={product.name} className={cta} />
          ) : (
            !soldOut && product.variants.length > 1 && (
              <Link href={`/productos/${product.slug}`} aria-label={`Elegir presentación de ${product.name}`} className={cta}>
                <span className="@max-[16rem]:sr-only">Elegir</span>
                <Icon name="arrow" size={18} />
              </Link>
            )
          )}
        </div>
      </div>
      {/* Filete bermellón que se dibuja al pasar el mouse o enfocar la celda */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-[3px] origin-left scale-x-0 bg-signal transition-transform duration-300 group-focus-within/card:scale-x-100 group-hover/card:scale-x-100" />
    </article>
  );
}
