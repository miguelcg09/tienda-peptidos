import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { catalogGrid, MissingTile, ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo de péptidos de investigación. Precios en pesos con IVA incluido y despacho con seguimiento a todo Chile.",
  alternates: { canonical: "/productos" },
};

const chip = "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors";

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const { categoria, q = "" } = await searchParams;
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => !categoria || p.category === categoria)
    .filter((p) => !term || [p.name, p.short, p.cas ?? "", p.category].some((t) => t.toLowerCase().includes(term)));
  const contactHref = whatsappLink(settings.whatsapp, "Hola, tengo una consulta sobre un producto.") || `mailto:${settings.email}`;

  return (
    <div className="wrap py-12 md:py-16">
      <h1 className="t-page">Productos</h1>
      <p className="mt-3 text-lg text-muted">Todos los precios incluyen IVA. Si algo se agota, lo marcamos.</p>
      <form method="get" role="search" className="mt-8 flex max-w-lg gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input name="q" maxLength={80} defaultValue={q} placeholder="Buscar por nombre o CAS" aria-label="Buscar productos" className="field mt-0 min-h-12 flex-1 rounded-full px-5" />
        <button className="btn-primary rounded-full px-6 text-sm">Buscar</button>
      </form>
      <div className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
        <div className="flex w-max gap-1.5 md:w-auto md:flex-wrap">
          <Link href="/productos" className={`${chip} ${!categoria ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}>
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/productos?categoria=${encodeURIComponent(c)}`}
              className={`${chip} whitespace-nowrap ${categoria === c ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
      {list.length === 0 && <p className="mt-10 text-muted">No encontramos productos con ese criterio. <Link href="/productos" className="text-fg underline">Ver todo el catálogo</Link></p>}
      <div className={`mt-10 ${catalogGrid}`}>
        {list.map((p) => <ProductCard key={p.slug} product={p} headingLevel={2} />)}
        {list.length > 0 && <MissingTile href={contactHref} />}
      </div>
    </div>
  );
}
