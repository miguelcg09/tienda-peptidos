import Link from "next/link";
import { formatCLP, type Product } from "@/lib/products";
import { Vial } from "./Vial";

export function ProductCard({ product }: { product: Product }) {
  const from = Math.min(...product.variants.map((v) => v.price));
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
    >
      <div className="grid aspect-square place-items-center rounded-xl bg-mist">
        <Vial color={product.color} label={product.name} className="h-4/5" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">{product.category}</p>
      <h3 className="mt-1 font-semibold group-hover:text-brand">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.short}</p>
      <p className="mt-auto pt-4 font-semibold">
        {product.variants.length > 1 && <span className="text-sm font-normal text-slate-500">Desde </span>}
        {formatCLP(from)}
      </p>
    </Link>
  );
}
