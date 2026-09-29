"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { categories, categoryMeta, type Category, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

type Sort = "destacados" | "precio-asc" | "precio-desc" | "nombre";
const sorts: { id: Sort; label: string }[] = [
  { id: "destacados", label: "Destacados primero" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "nombre", label: "Nombre A–Z" },
];
const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

// Catálogo con pestañas por categoría y orden, en la misma sección (sin ir a otra página).
// La pestaña activa se marca con una "píldora" que se desliza de una a otra.
export function CatalogTabs({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [sort, setSort] = useState<Sort>("destacados");
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const present = categories.filter((c) => products.some((p) => p.category === c));
  const filtered = active === "Todos" ? products : products.filter((p) => p.category === active);
  const list = [...filtered].sort((a, b) => {
    if (sort === "precio-asc") return minPrice(a) - minPrice(b);
    if (sort === "precio-desc") return minPrice(b) - minPrice(a);
    if (sort === "nombre") return a.name.localeCompare(b.name, "es");
    return Number(!!b.featured) - Number(!!a.featured);
  });

  // Mide la pestaña activa para colocar la píldora (y la vuelve a medir si cambia el ancho).
  useLayoutEffect(() => {
    const measure = () => {
      // Se mide el <li> (su posición es relativa a la lista; la del botón sería relativa al <li>).
      const el = listRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.parentElement;
      if (!el) return;
      setPill({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, present.length]);

  return (
    <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="min-w-0 md:sticky md:top-32 md:self-start">
        <ul ref={listRef} className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:px-0 md:pb-0">
          {pill && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-card bg-accent shadow-md transition-[transform,width,height] duration-300 ease-out"
              style={{ width: pill.w, height: pill.h, transform: `translate(${pill.x}px, ${pill.y}px)` }}
            />
          )}
          {(["Todos", ...present] as const).map((c) => {
            const on = c === active;
            return (
              <li key={c} className="relative shrink-0">
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 whitespace-nowrap rounded-card border px-4 py-3 text-left text-sm transition-colors duration-300 md:whitespace-normal ${
                    on
                      ? `text-on-accent ${pill ? "border-transparent" : "border-accent bg-accent"}`
                      : "text-muted hover:border-accent hover:text-fg"
                  }`}
                >
                  <span className="text-lg">{c === "Todos" ? "✦" : categoryMeta[c].icon}</span>
                  <span>
                    <span className="block font-medium">{c}</span>
                    {c !== "Todos" && (
                      <span className={`hidden text-xs md:block ${on ? "text-on-accent/80" : "text-muted"}`}>{categoryMeta[c].blurb}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            <span className="font-semibold text-fg">{list.length}</span> {list.length === 1 ? "producto" : "productos"}
            {active !== "Todos" && <> en {active}</>}
          </p>
          <label className="flex items-center gap-2">
            Ordenar
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field mt-0! w-auto py-2 text-sm" aria-label="Ordenar productos">
              {sorts.map((o) => <option key={o.id} value={o.id} className="bg-surface">{o.label}</option>)}
            </select>
          </label>
        </div>
        <div key={`${active}-${sort}`} className="animate-fade mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {list.map((p, i) => (
            <div key={p.slug} className="animate-slide h-full" style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: "both" }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
