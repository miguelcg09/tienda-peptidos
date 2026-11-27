"use client";

import { catLabel, tx } from "@/lib/copy";
import { useStore } from "./CartProvider";

// Textos editables desde /admin/textos, para componentes de cliente y para tarjetas que se usan en ambos lados.
export function useT() {
  const { settings } = useStore();
  return (key: string, vars?: Record<string, string | number>) => tx(settings.textos, key, vars);
}

export function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  return <>{useT()(k, vars)}</>;
}

export function CatName({ c }: { c: string }) {
  const { settings } = useStore();
  return <>{catLabel(settings.textos, c)}</>;
}
