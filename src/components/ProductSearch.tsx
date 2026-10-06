"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { formatCLP, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";
import { Icon } from "./Icon";

const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// Busca por nombre, línea, CAS o resumen. Los que empiezan igual que lo escrito van primero.
function find(catalog: Product[], q: string) {
  const t = plain(q);
  if (!t) return [];
  return catalog
    .map((p) => {
      const name = plain(p.name);
      const rest = plain([p.category, p.cas ?? "", p.short, p.slug].join(" "));
      const score = name.startsWith(t) ? 0 : name.includes(t) ? 1 : rest.includes(t) ? 2 : -1;
      return { p, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.p);
}

// Buscador de productos con sugerencias. Funciona con teclado (flechas, Enter, Escape) y sin JavaScript
// cae a la página /productos?q=. variant "header": compacto, para la barra; "hero": con etiqueta y botón.
export function ProductSearch({ variant = "header", className = "", label = "Buscar un producto" }: { variant?: "header" | "hero"; className?: string; label?: string }) {
  const { catalog } = useCart();
  const router = useRouter();
  const uid = useId();
  const inputId = `${uid}-q`;
  const listId = `${uid}-lista`;
  const box = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const hero = variant === "hero";

  const results = useMemo(() => find(catalog, q).slice(0, 5), [catalog, q]);
  const showPanel = open && q.trim().length > 0;
  const optionId = (i: number) => `${uid}-op-${i}`;

  function go(p?: Product) {
    setOpen(false);
    if (p) router.push(`/productos/${p.slug}`);
    else router.push(q.trim() ? `/productos?q=${encodeURIComponent(q.trim())}` : "/productos");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      if (open) { e.stopPropagation(); setOpen(false); setActive(-1); }
      else setQ("");
    }
  }

  return (
    <div
      ref={box}
      className={className}
      onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node | null)) { setOpen(false); setActive(-1); } }}
    >
      <form
        role="search"
        aria-label={label}
        action="/productos"
        onSubmit={(e) => { e.preventDefault(); go(active >= 0 ? results[active] : results.find((r) => plain(r.name) === plain(q))); }}
        className="relative"
      >
        <label htmlFor={inputId} className={hero ? "mb-2 block font-mono text-xs uppercase tracking-[0.14em]" : "sr-only"}>
          Buscar un producto
        </label>
        <div className={hero ? "flex gap-2" : ""}>
          <div className="relative min-w-0 flex-1">
            <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id={inputId}
              name="q"
              type="search"
              role="combobox"
              aria-expanded={showPanel && results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? optionId(active) : undefined}
              autoComplete="off"
              enterKeyHint="search"
              placeholder={hero ? "Ej.: BPC-157" : "Buscar un producto"}
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              className={`w-full rounded-btn border border-line bg-surface pl-10 pr-3 text-fg placeholder:text-muted ${hero ? "min-h-14 text-base" : "min-h-11 text-sm"}`}
            />
          </div>
          {hero && (
            <button type="submit" className="inline-flex min-h-14 shrink-0 items-center rounded-btn border border-current px-6 text-base font-semibold transition-colors hover:bg-current/15">
              Buscar
            </button>
          )}
        </div>

        {showPanel && (
          <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-card border border-line bg-surface text-fg shadow-lg animate-fade" onMouseDown={(e) => e.preventDefault()}>
            {results.length > 0 ? (
              <ul id={listId} role="listbox" aria-label="Productos encontrados">
                {results.map((p, i) => (
                  <li
                    key={p.slug}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    onClick={() => go(p)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-3 ${i === active ? "bg-surface-2" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{p.name}</span>
                      <span className="block font-mono text-xs uppercase tracking-widest text-muted">{p.category}</span>
                    </span>
                    <span className="shrink-0 text-sm">{p.variants.length > 1 ? "Desde " : ""}{formatCLP(Math.min(...p.variants.map((v) => v.price)))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div id={listId} className="px-4 py-4 text-sm">
                <p>No encontramos “{q.trim()}”.</p>
                <p className="mt-1 text-muted">Prueba con el nombre del compuesto, por ejemplo BPC-157.</p>
              </div>
            )}
            <Link href={q.trim() ? `/productos?q=${encodeURIComponent(q.trim())}` : "/productos"} onClick={() => setOpen(false)} className="block border-t border-line px-4 py-3 text-sm font-medium underline-offset-4 hover:underline">
              Ver todos los resultados en el catálogo
            </Link>
          </div>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {showPanel ? (results.length ? `${results.length} ${results.length === 1 ? "producto encontrado" : "productos encontrados"}` : "Sin resultados") : ""}
        </p>
      </form>
    </div>
  );
}
