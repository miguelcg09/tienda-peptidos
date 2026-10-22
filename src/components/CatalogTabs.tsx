"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, type Category, type Product } from "@/lib/products";
import { catalogGrid, MissingTile, ProductCard } from "./ProductCard";

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

type Box = { x: number; y: number; w: number; h: number };

// Colección con filtro por línea de investigación y orden, en la misma sección (sin ir a otra página).
export function CatalogTabs({ products, contactHref }: { products: Product[]; contactHref?: string }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<Sort>("destacados");
  const tabs = useRef<HTMLUListElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  const present = categories.filter((c) => products.some((p) => p.category === c));
  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);
  const list = [...filtered].sort((a, b) => {
    if (sort === "precio-asc") return minPrice(a) - minPrice(b);
    if (sort === "precio-desc") return minPrice(b) - minPrice(a);
    if (sort === "nombre") return a.name.localeCompare(b.name, "es");
    return Number(!!b.featured) - Number(!!a.featured);
  });

  // La píldora que marca la línea elegida se desliza hasta ella.
  const measure = useCallback(() => {
    const el = tabs.current?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (el) setBox({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, []);
  useLayoutEffect(measure, [measure, active]);
  useEffect(() => {
    const el = tabs.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="-mx-4 min-w-0 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
        <ul ref={tabs} className="relative flex w-max gap-1.5 md:w-auto md:flex-wrap">
          {box && (
            <li
              aria-hidden="true"
              className="absolute left-0 top-0 rounded-full bg-fg transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }}
            />
          )}
          {(["Todos", ...present] as const).map((c) => {
            const on = c === active;
            return (
              <li key={c} className="relative z-10">
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-300 ${on ? (box ? "text-bg" : "bg-fg text-bg") : "text-muted hover:text-fg"}`}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
        </div>
        <label className="flex items-center gap-3 text-sm text-muted">
          <span>Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field mt-0! w-auto rounded-full py-2 pl-4 text-sm" aria-label="Ordenar productos">
            {sorts.map((o) => <option key={o.id} value={o.id} className="bg-surface">{o.label}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
        {active !== "Todos" && <> en {active}. {lineDesc[active]}</>}
      </p>
      {list.length === 0 && <p className="text-muted">No hay productos en esta línea por ahora. Escríbenos y te avisamos cuando lleguen.</p>}
      <div key={`${active}-${sort}`} className={`animate-fade ${catalogGrid}`} data-testid="catalogo-portada">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        {contactHref && list.length > 0 && <MissingTile href={contactHref} />}
      </div>
    </div>
  );
}
