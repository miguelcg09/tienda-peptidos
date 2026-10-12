"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { findVariantIn, type Product, type Variant } from "@/lib/products";
import type { StoreSettings } from "@/lib/config";

export type CartLine = { variantId: string; qty: number };

type StoreContextValue = {
  catalog: Product[];
  settings: StoreSettings;
  find: (variantId: string) => { product: Product; variant: Variant } | undefined;
  lines: CartLine[];
  ready: boolean; // el carrito guardado en el navegador ya se leyó (antes de eso «vacío» no significa vacío)
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "cart-v1";
const MAX_QTY = 99;

// Lo guardado en el navegador puede estar dañado o ser de una versión anterior: se aceptan solo líneas con
// una presentación que existe, cantidad entera entre 1 y el tope (99 o el stock), y sin repetir presentación.
function cleanLines(raw: unknown, catalog: Product[]): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const l of raw) {
    if (!l || typeof l !== "object") continue;
    const { variantId, qty } = l as { variantId?: unknown; qty?: unknown };
    const n = Math.floor(Number(qty));
    if (typeof variantId !== "string" || !Number.isFinite(n) || n < 1) continue;
    merged.set(variantId, (merged.get(variantId) ?? 0) + n);
  }
  const out: CartLine[] = [];
  for (const [variantId, n] of merged) {
    const found = findVariantIn(catalog, variantId);
    if (!found) continue;
    const stock = found.variant.stock;
    const max = stock == null ? MAX_QTY : Math.min(MAX_QTY, stock);
    if (max >= 1) out.push({ variantId, qty: Math.min(n, max) });
  }
  return out;
}

// Catálogo, ajustes de la tienda y carrito, disponibles en todos los componentes de cliente.
export function StoreProvider({
  catalog,
  settings,
  children,
}: {
  catalog: Product[];
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(cleanLines(JSON.parse(saved), catalog));
    } catch {}
    setLoaded(true);
  }, [catalog]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const value = useMemo<StoreContextValue>(() => {
    const find = (id: string) => findVariantIn(catalog, id);
    const maxQty = (id: string) => {
      const stock = find(id)?.variant.stock;
      return stock == null ? 99 : Math.max(0, Math.min(99, stock));
    };
    const subtotal = lines.reduce((sum, l) => sum + (find(l.variantId)?.variant.price ?? 0) * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= settings.freeShippingFrom ? 0 : settings.shippingCost;
    return {
      catalog,
      settings,
      find,
      lines,
      ready: loaded,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      add: (variantId, qty = 1) => {
        setLines((prev) => {
          const existing = prev.find((l) => l.variantId === variantId);
          if (existing) {
            return prev.map((l) =>
              l.variantId === variantId ? { ...l, qty: Math.min(l.qty + qty, maxQty(variantId)) } : l,
            );
          }
          return [...prev, { variantId, qty: Math.min(qty, maxQty(variantId)) }];
        });
        setOpen(true);
      },
      setQty: (variantId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.variantId !== variantId)
            : prev.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(qty, maxQty(variantId)) } : l)),
        ),
      remove: (variantId) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)),
      clear: () => setLines([]),
      open,
      setOpen,
    };
  }, [catalog, settings, lines, open, loaded]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

export const useCart = useStore;
