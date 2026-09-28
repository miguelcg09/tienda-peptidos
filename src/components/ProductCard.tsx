import Link from "next/link";
import { formatCLP, type Product } from "@/lib/products";
import { Vial } from "./Vial";
import { Tilt } from "./Tilt";

export function ProductCard({ product }: { product: Product }) {
  const from = Math.min(...product.variants.map((v) => v.price));
  return (
    <Tilt className="h-full">
      <Link
        href={`/productos/${product.slug}`}
        className="shine group relative flex h-full flex-col rounded-3xl border bg-surface p-4 transition-colors hover:border-tint/20"
        style={{ ["--c" as string]: product.color }}
      >
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-tint/[0.04] to-transparent">
          <div
            className="absolute bottom-0 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
            style={{ background: product.color }}
          />
          <Vial color={product.color} label={product.name} className="relative h-4/5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-full border border-tint/10 bg-surface/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-lime backdrop-blur">
            {product.purity.replace(" (HPLC)", "")}
          </span>
        </div>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-widest text-muted">{product.category}</p>
        <h3 className="mt-1 font-display text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.short}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="font-semibold">
            {product.variants.length > 1 && <span className="text-xs font-normal text-muted">Desde </span>}
            {formatCLP(from)}
          </p>
          <span className="grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            →
          </span>
        </div>
      </Link>
    </Tilt>
  );
}
