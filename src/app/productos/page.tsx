import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/ProductCard";
import { CatalogCta } from "@/components/CatalogCta";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de péptidos de investigación. Precios en pesos con IVA incluido y despacho con seguimiento a todo Chile.",
  alternates: { canonical: "/productos" },
};

const tab = "flex min-h-12 shrink-0 items-center whitespace-nowrap border-b-[3px] text-base font-medium transition-colors";

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria, q = "" } = await searchParams;
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => !categoria || p.category === categoria)
    .filter((p) => !term || [p.name, p.short, p.cas ?? "", p.category].some((t) => t.toLowerCase().includes(term)));
  const contactHref = whatsappLink(settings.whatsapp, "Hola, tengo una consulta sobre un producto.") || `mailto:${settings.email}`;

  return (
    <div className="wrap py-10 md:py-14">
      <p className="label flex items-center gap-2.5 text-fg"><span className="mark" aria-hidden="true" />Índice completo</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <h1 className="t-page">Productos</h1>
        <form method="get" role="search" className="flex w-full max-w-md gap-2 sm:w-auto sm:min-w-[22rem]">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <input name="q" maxLength={80} defaultValue={q} placeholder="Nombre o CAS" aria-label="Buscar productos" className="field mt-0 min-h-12 flex-1" />
          <button className="btn-primary min-h-12 text-sm">Buscar</button>
        </form>
      </div>
      <div className="-mx-4 mt-8 flex gap-x-7 overflow-x-auto border-b border-fg px-4 md:mx-0 md:px-0">
        <Link href="/productos" aria-current={!categoria ? "page" : undefined} className={`${tab} ${!categoria ? "border-signal text-fg" : "border-transparent text-muted hover:text-fg"}`}>
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/productos?categoria=${encodeURIComponent(c)}`}
            aria-current={categoria === c ? "page" : undefined}
            className={`${tab} ${categoria === c ? "border-signal text-fg" : "border-transparent text-muted hover:text-fg"}`}
          >
            {c}
          </Link>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted" aria-live="polite">
        <span className="font-mono font-medium text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
        {term && <> para “{q.trim()}”</>}
      </p>
      {list.length === 0 && <p className="mt-6 text-muted">No encontramos productos con ese criterio. <Link href="/productos" className="text-fg underline">Ver todo el catálogo</Link></p>}
      <div className="cell-grid mt-6">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} headingLevel={2} />)}
        <CatalogCta href={contactHref} />
      </div>
    </div>
  );
}
