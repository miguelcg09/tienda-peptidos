"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Buscador único de la portada: por nombre de producto o por número de lote.
export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<"producto" | "lote">("producto");
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const base = mode === "producto" ? "/productos" : "/certificados";
    const v = q.trim();
    router.push(v ? `${base}?q=${encodeURIComponent(v)}` : base);
  }

  return (
    <form onSubmit={submit} role="search" className="mt-8 max-w-lg" data-testid="buscador-portada">
      <div className="flex gap-1 text-sm" role="group" aria-label="Qué quieres buscar">
        {([["producto", "Producto"], ["lote", "Número de lote"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition ${mode === id ? "bg-accent text-on-accent" : "text-muted hover:text-fg"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={mode === "producto" ? "Buscar un producto" : "Buscar un número de lote"}
          placeholder={mode === "producto" ? "Ej: BPC-157" : "Ej: HX-2409-A"}
          className="field mt-0 flex-1"
        />
        <button className="btn-ghost shrink-0 px-5">Buscar</button>
      </div>
    </form>
  );
}
