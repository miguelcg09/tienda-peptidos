"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { findVariant } from "@/lib/products";
import { store } from "@/lib/config";

export type CartLine = { variantId: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
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

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartLine[];
        setLines(parsed.filter((l) => findVariant(l.variantId)));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce(
      (sum, l) => sum + (findVariant(l.variantId)?.variant.price ?? 0) * l.qty,
      0,
    );
    const shipping =
      subtotal === 0 || subtotal >= store.freeShippingFrom ? 0 : store.shippingCost;
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      add: (variantId, qty = 1) => {
        setLines((prev) => {
          const existing = prev.find((l) => l.variantId === variantId);
          if (existing) {
            return prev.map((l) =>
              l.variantId === variantId ? { ...l, qty: Math.min(l.qty + qty, 99) } : l,
            );
          }
          return [...prev, { variantId, qty }];
        });
        setOpen(true);
      },
      setQty: (variantId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.variantId !== variantId)
            : prev.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(qty, 99) } : l)),
        ),
      remove: (variantId) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)),
      clear: () => setLines([]),
      open,
      setOpen,
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
