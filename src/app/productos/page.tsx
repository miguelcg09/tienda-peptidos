import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Icon, categoryIcon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de péptidos de investigación. Precios en pesos con IVA incluido y despacho con seguimiento a todo Chile.",
  alternates: { canonical: "/productos" },
};

const pillBase = "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors";

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria, q = "" } = await searchParams;
  const products = await getProducts();
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => !categoria || p.category === categoria)
    .filter((p) => !term || [p.name, p.short, p.cas ?? "", p.category].some((t) => t.toLowerCase().includes(term)));

  return (
    <div className="wrap pb-20 pt-8 md:pb-24 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <p className="chip"><Icon name="grid" size={16} className="text-accent-2" />Catálogo</p>
          <h1 className="t-page mt-4">Productos</h1>
          <p className="mt-3 max-w-[44ch] text-lg text-muted">Todos los precios incluyen IVA. Si algo se agota, lo marcamos.</p>
        </div>
        <form method="get" role="search" className="flex w-full max-w-md gap-2">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <div className="relative min-w-0 flex-1">
            <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input name="q" maxLength={80} defaultValue={q} placeholder="Buscar por nombre o CAS" aria-label="Buscar productos" className="field mt-0 min-h-12 rounded-full pl-11" />
          </div>
          <button className="btn-primary px-6 text-sm">Buscar</button>
        </form>
      </div>

      <div className="mt-8 max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-fit">
        <div className="flex w-max gap-0.5">
          <Link href="/productos" aria-current={!categoria ? "page" : undefined} className={`${pillBase} ${!categoria ? "bg-accent text-on-accent" : "text-muted hover:text-fg"}`}>
            <Icon name="grid" size={16} />Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/productos?categoria=${encodeURIComponent(c)}`}
              aria-current={categoria === c ? "page" : undefined}
              className={`${pillBase} ${categoria === c ? "bg-accent text-on-accent" : "text-muted hover:text-fg"}`}
            >
              <Icon name={categoryIcon(c)} size={16} />{c}
            </Link>
          ))}
        </div>
      </div>

      {list.length === 0 && <p className="mt-10 text-muted">No encontramos productos con ese criterio. <Link href="/productos" className="font-medium text-accent-2 underline">Ver todo el catálogo</Link></p>}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {list.map((p, i) => <Reveal key={p.slug} className="h-full" delay={(i % 3) * 60}><ProductCard product={p} headingLevel={2} /></Reveal>)}
      </div>
    </div>
  );
}
