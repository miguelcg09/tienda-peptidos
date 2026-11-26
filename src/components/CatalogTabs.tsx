"use client";

import { useState } from "react";
import { categories, type Category, type Product } from "@/lib/products";
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
export function CatalogTabs({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<Sort>("destacados");

  const present = categories.filter((c) => products.some((p) => p.category === c));
  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);
  const list = [...filtered].sort((a, b) => {
    if (sort === "precio-asc") return minPrice(a) - minPrice(b);
    if (sort === "precio-desc") return minPrice(b) - minPrice(a);
    if (sort === "nombre") return a.name.localeCompare(b.name, "es");
    return Number(!!b.featured) - Number(!!a.featured);
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <ul className="flex flex-wrap gap-2">
          {(["Todos", ...present] as const).map((c) => {
            const on = c === active;
            return (
              <li key={c}>
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    on ? "border-accent bg-accent text-on-accent" : "bg-surface hover:border-fg/40"
                  }`}
                >
                  {c}
                  <span className={`font-mono text-xs ${on ? "opacity-70" : "text-muted"}`} aria-hidden="true">{c === "Todos" ? products.length : products.filter((p) => p.category === c).length}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <label className="flex items-center gap-3 text-sm text-muted">
          <span>Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field mt-0! w-auto py-2 text-sm" aria-label="Ordenar productos">
            {sorts.map((o) => <option key={o.id} value={o.id} className="bg-surface">{o.label}</option>)}
          </select>
        </label>
      </div>
      <p className="-mt-4 text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
        {active !== "Todos" && <> en {active}. {lineDesc[active]}</>}
      </p>
      {list.length === 0 && <p className="text-muted">No hay productos en esta línea por ahora. Escríbenos y te avisamos cuando lleguen.</p>}
      <div key={`${active}-${sort}`} className="animate-fade grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" data-testid="catalogo-portada">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
      </div>
    </div>
  );
}
