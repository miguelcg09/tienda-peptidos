import Link from "next/link";
import { formatCLP, type Product } from "@/lib/products";
import { pastelVars } from "@/lib/colors";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";

// Rejilla del catálogo: 2 columnas en celular, 3 en tableta y 4 en escritorio ancho.
export const catalogGrid = "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4";

// Botón redondo de la tarjeta: "+" para agregar o flecha para ver las presentaciones
const round = "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-fg/25 text-fg transition-colors hover:border-fg hover:bg-fg hover:text-bg";

// Tarjeta de pieza: panel pastel con el vial, nombre, un dato (la presentación) y el precio con su acción.
export function ProductCard({ product, headingLevel = 3 }: { product: Product; index?: number; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.price));
  const soldOut = product.variants.every((v) => v.stock === 0);
  const quick = product.variants.length === 1 ? product.variants.find((v) => v.stock !== 0) : undefined;
  const lowStock = product.variants.reduce<number | null>((m, v) => (v.stock !== null && v.stock > 0 && v.stock <= 5 && (m === null || v.stock < m) ? v.stock : m), null);
  const badge = "absolute right-3 top-3 rounded-full bg-fg px-2.5 py-1 text-xs font-semibold text-bg";
  return (
    <article className="group/card flex h-full min-w-0 flex-col gap-3" style={pastelVars(product.color)}>
      {/* La imagen también es un enlace para quien usa mouse o toque; el enlace del nombre es el que leen los lectores de pantalla y el teclado */}
      <Link
        href={`/productos/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="pastel-card pastel-card-hover relative block aspect-[5/6] overflow-hidden rounded-card outline-offset-2 transition-colors duration-300 group-has-[h2_a:focus-visible,h3_a:focus-visible]/card:outline-2"
      >
        {soldOut && <span className={badge}>Agotado</span>}
        {!soldOut && lowStock !== null && <span className={badge}>Últimas {lowStock}</span>}
        <span className="absolute inset-x-0 inset-y-[10%] flex justify-center transition-transform duration-300 ease-out group-hover/card:-translate-y-1.5 group-hover/card:scale-[1.03] motion-reduce:transition-none">
          <ProductImage product={product} className="h-full w-auto max-w-[80%]" />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <Heading className="break-words font-display text-xl font-medium leading-tight tracking-tight">
          <Link href={`/productos/${product.slug}`} className="underline-offset-[5px] hover:underline focus-visible:outline-none focus-visible:underline">{product.name}</Link>
        </Heading>
        <p className="break-words font-mono text-xs text-muted">{product.variants.map((v) => v.label).join(" / ")}</p>
        {/* Precio y acción siempre abajo y alineados entre tarjetas */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="min-w-0 text-lg font-semibold">
            {product.variants.length > 1 && <span className="block text-xs font-normal leading-none text-muted">Desde</span>}
            {formatCLP(from)}
          </p>
          {quick ? (
            <QuickAdd variantId={quick.id} name={product.name} icon className={round} />
          ) : (
            !soldOut && product.variants.length > 1 && (
              <Link href={`/productos/${product.slug}`} aria-label={`Ver presentaciones de ${product.name}`} className={round}>
                <Icon name="arrow" size={20} />
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}

// Última celda del catálogo: para quien no encuentra el compuesto que busca.
export function MissingTile({ href }: { href: string }) {
  return (
    <div className="flex min-h-[15rem] min-w-0 flex-col items-start justify-between rounded-card border border-dashed border-fg/30 p-5">
      <p className="font-display text-xl font-medium leading-tight tracking-tight">¿No ves el compuesto que buscas?</p>
      <div className="flex flex-col items-start gap-1">
        <p className="text-sm text-muted">Dinos cuál y vemos si podemos incluirlo.</p>
        <a href={href} className="inline-flex min-h-11 items-center text-sm font-semibold u-link">Escríbenos</a>
      </div>
    </div>
  );
}
