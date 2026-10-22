"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, type Category, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

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
// La píldora de color se desliza hasta la línea elegida.
export function CatalogTabs({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<Sort>("destacados");
  const list0 = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const present = categories.filter((c) => products.some((p) => p.category === c));
  const tabs = ["Todos", ...present] as const;
  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);
  const list = [...filtered].sort((a, b) => {
    if (sort === "precio-asc") return minPrice(a) - minPrice(b);
    if (sort === "precio-desc") return minPrice(b) - minPrice(a);
    if (sort === "nombre") return a.name.localeCompare(b.name, "es");
    return Number(!!b.featured) - Number(!!a.featured);
  });

  // Mide el botón activo para colocar la píldora; se vuelve a medir si cambia el ancho de la pantalla.
  const key = tabs.join("|");
  useLayoutEffect(() => {
    const place = () => {
      const btn = list0.current?.querySelector<HTMLElement>('button[aria-pressed="true"]');
      if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place);
    if (list0.current) ro.observe(list0.current);
    return () => ro.disconnect();
  }, [active, key]);
  useEffect(() => {
    // Las fuentes pueden terminar de cargar después del primer cálculo.
    document.fonts?.ready.then(() => {
      const btn = list0.current?.querySelector<HTMLElement>('button[aria-pressed="true"]');
      if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    });
  }, [active, key]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul ref={list0} className="relative flex w-max gap-0.5">
            {pill && <li aria-hidden="true" className="absolute inset-y-0 rounded-full bg-accent transition-[left,width] duration-300 ease-out" style={{ left: pill.left, width: pill.width }} />}
            {tabs.map((c) => {
              const on = c === active;
              return (
                <li key={c} className="relative">
                  <button
                    onClick={() => setActive(c)}
                    aria-pressed={on}
                    className={`min-h-11 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${on ? "text-on-accent" : "text-muted hover:text-fg"}`}
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
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field mt-0! w-auto rounded-full py-2.5 pl-5 pr-4 text-sm" aria-label="Ordenar productos">
            {sorts.map((o) => <option key={o.id} value={o.id} className="bg-surface">{o.label}</option>)}
          </select>
        </label>
      </div>
      <p className="-mt-3 px-1 text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
        {active !== "Todos" && <> en {active}. {lineDesc[active]}</>}
      </p>
      {list.length === 0 && <p className="text-muted">No hay productos en esta línea por ahora. Escríbenos y te avisamos cuando lleguen.</p>}
      <div key={`${active}-${sort}`} className="animate-fade grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3" data-testid="catalogo-portada">
        {list.map((p, i) => <Reveal key={p.slug} className="h-full" delay={(i % 3) * 60}><ProductCard product={p} index={i} /></Reveal>)}
      </div>
    </div>
  );
}
