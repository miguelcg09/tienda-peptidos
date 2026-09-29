"use client";

import { useState } from "react";
import { categories, categoryMeta, type Category, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

// Catálogo con pestañas por categoría, en la misma sección (sin ir a otra página).
export function CatalogTabs({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const list = active === "Todos" ? products : products.filter((p) => p.category === active);
  const present = categories.filter((c) => products.some((p) => p.category === c));

  return (
    <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="min-w-0 md:sticky md:top-32 md:self-start">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:px-0 md:pb-0">
          {(["Todos", ...present] as const).map((c) => {
            const on = c === active;
            return (
              <li key={c} className="shrink-0">
                <button
                  onClick={() => setActive(c)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 whitespace-nowrap rounded-2xl border px-4 py-3 text-left text-sm transition md:whitespace-normal ${
                    on
                      ? "border-accent bg-accent text-on-accent shadow-md"
                      : "bg-surface text-muted hover:border-accent hover:text-fg"
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
      <div key={active} className="animate-fade grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-3">
        {list.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}
