"use client";

import { useEffect, useRef, useState } from "react";
import { categories, type Category, type Product } from "@/lib/products";
import { CatalogCta } from "./CatalogCta";
import { ProductCard } from "./ProductCard";

type Sort = "destacados" | "precio-asc" | "precio-desc" | "nombre";
const sorts: { id: Sort; label: string }[] = [
  { id: "destacados", label: "Destacados primero" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "nombre", label: "Nombre A–Z" },
];
// Qué es cada línea, en una frase: lo que se estudia en laboratorio, sin prometer efectos.
const lineDesc: Record<Category, string> = {
  "Reparación tisular": "Péptidos que se estudian en modelos preclínicos de reparación de tejidos.",
  Metabolismo: "Agonistas de los receptores GLP-1 y GIP.",
  "Hormona de crecimiento": "Compuestos que actúan sobre el eje GH / IGF-1 en modelos de laboratorio.",
  Cognición: "Neuropéptidos estudiados en modelos animales.",
  Accesorios: "Agua bacteriostática y material para reconstituir en laboratorio.",
};
const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

// Colección con filtro por línea de investigación y orden, en la misma sección (sin ir a otra página).
// Las pestañas van en una sola fila (en celular se desplaza de lado) y la barra de la activa se desliza de una a otra.
export function CatalogTabs({ products, contactHref }: { products: Product[]; contactHref: string }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<Sort>("destacados");
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const tabs = useRef<HTMLUListElement>(null);

  const present = categories.filter((c) => products.some((p) => p.category === c));
  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);
  const list = [...filtered].sort((a, b) => {
    if (sort === "precio-asc") return minPrice(a) - minPrice(b);
    if (sort === "precio-desc") return minPrice(b) - minPrice(a);
    if (sort === "nombre") return a.name.localeCompare(b.name, "es");
    return Number(!!b.featured) - Number(!!a.featured);
  });

  useEffect(() => {
    const ul = tabs.current;
    if (!ul) return;
    const measure = () => {
      const btns = Array.from(ul.querySelectorAll<HTMLButtonElement>("button"));
      const on = btns.find((b) => b.getAttribute("aria-pressed") === "true");
      setBar(on ? { left: on.offsetLeft, width: on.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [active, products]);

  const count = (c: Category | "Todos") => (c === "Todos" ? products.length : products.filter((p) => p.category === c).length);

  return (
    <div className="flex flex-col gap-5">
      <div className="-mx-4 border-b border-fg md:mx-0">
        <ul ref={tabs} className="relative flex gap-x-7 overflow-x-auto px-4 md:px-0">
          {(["Todos", ...present] as const).map((c) => {
            const on = c === active;
            return (
              <li key={c}>
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={`flex min-h-12 items-center gap-2 whitespace-nowrap border-b-[3px] text-base font-medium transition-colors ${
                    on ? `text-fg ${bar ? "border-transparent" : "border-signal"}` : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {c}
                  <span className="font-mono text-xs font-normal text-muted">{count(c)}</span>
                </button>
              </li>
            );
          })}
          {bar && <span aria-hidden="true" className="absolute -bottom-px h-[3px] bg-signal transition-[left,width] duration-300 ease-out" style={{ left: bar.left, width: bar.width }} />}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <p className="min-w-0 max-w-[60ch] text-sm text-muted" aria-live="polite">
          <span className="font-mono font-medium text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
          {active !== "Todos" && <> en {active}. {lineDesc[active]}</>}
        </p>
        <label className="flex items-center gap-3 text-sm text-muted">
          <span>Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field mt-0! w-auto py-2 text-sm" aria-label="Ordenar productos">
            {sorts.map((o) => <option key={o.id} value={o.id} className="bg-surface">{o.label}</option>)}
          </select>
        </label>
      </div>
      {list.length === 0 && <p className="text-muted">No hay productos en esta línea por ahora. Escríbenos y te avisamos cuando lleguen.</p>}
      <div key={`${active}-${sort}`} className="cell-grid animate-fade" data-testid="catalogo-portada">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        <CatalogCta href={contactHref} />
      </div>
    </div>
  );
}
