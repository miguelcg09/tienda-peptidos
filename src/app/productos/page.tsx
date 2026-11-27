import Link from "next/link";
import type { Metadata } from "next";
import { categories, categoryHref, categoryMeta, toCategory } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { catLabel } from "@/lib/copy";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de péptidos de investigación. Precios en pesos con IVA incluido y despacho con seguimiento a todo Chile.",
  alternates: { canonical: "/productos" },
};

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria: raw, q = "" } = await searchParams;
  const [products, { textos }] = await Promise.all([getProducts(), getSettings()]);
  // Acepta el id (?categoria=regeneracion) y también nombres anteriores, para no romper enlaces ya compartidos
  const categoria = toCategory(raw);
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => !categoria || p.category === categoria)
    .filter((p) => !term || [p.name, p.short, p.cas ?? "", catLabel(textos, p.category)].some((t) => t.toLowerCase().includes(term)));
  const present = categories.filter((c) => products.some((p) => p.category === c));

  return (
    <div className="wrap py-12 md:py-16">
      <h1 className="t-page">{categoria ? catLabel(textos, categoria) : "Productos"}</h1>
      {categoria && <p className="mt-3 max-w-2xl text-muted">{categoryMeta[categoria].desc}</p>}
      <form method="get" role="search" className="mt-6 flex max-w-md gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input name="q" maxLength={80} defaultValue={q} placeholder="Buscar por nombre o CAS" aria-label="Buscar productos" className="field mt-0 flex-1" />
        <button className="btn-primary text-sm">Buscar</button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/productos" aria-current={!categoria ? "page" : undefined} className={`rounded-btn border px-4 py-1.5 text-sm ${!categoria ? "border-accent bg-accent/10 text-accent" : "hover:border-tint/30"}`}>
          Todos
        </Link>
        {present.map((c) => (
          <Link
            key={c}
            href={categoryHref(c)}
            aria-current={categoria === c ? "page" : undefined}
            className={`rounded-btn border px-4 py-1.5 text-sm ${categoria === c ? "border-accent bg-accent/10 text-accent" : "hover:border-tint/30"}`}
          >
            {catLabel(textos, c)}
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-muted">No encontramos productos con ese criterio. <Link href="/productos" className="text-accent underline">Ver todo el catálogo</Link></p>}
      {list.length > 0 && (
        <div className="mt-10 grid gap-px overflow-hidden rounded-card border bg-line sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <ProductCard key={p.slug} product={p} headingLevel={2} />)}
        </div>
      )}
    </div>
  );
}
