import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de péptidos de grado investigación con pureza verificada por HPLC y certificado de análisis por lote.",
  alternates: { canonical: "/productos" },
};

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria, q = "" } = await searchParams;
  const products = await getProducts();
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => !categoria || p.category === categoria)
    .filter((p) => !term || [p.name, p.short, p.cas ?? "", p.category].some((t) => t.toLowerCase().includes(term)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Productos</h1>
      <form method="get" role="search" className="mt-6 flex max-w-md gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o CAS" aria-label="Buscar productos" className="field mt-0 flex-1" />
        <button className="btn-primary text-sm">Buscar</button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/productos" className={`rounded-full border px-4 py-1.5 text-sm ${!categoria ? "border-accent bg-accent/10 text-accent" : "hover:border-tint/30"}`}>
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/productos?categoria=${encodeURIComponent(c)}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${categoria === c ? "border-accent bg-accent/10 text-accent" : "hover:border-tint/30"}`}
          >
            {c}
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-muted">No encontramos productos con ese criterio. <Link href="/productos" className="text-accent underline">Ver todo el catálogo</Link></p>}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}
