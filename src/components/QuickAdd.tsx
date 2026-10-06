"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

// Botón "Agregar" de las tarjetas: agrega la presentación única sin salir del listado.
export function QuickAdd({ variantId, name }: { variantId: string; name: string }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        add(variantId, 1);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      aria-label={done ? `${name} agregado al carrito` : `Agregar ${name} al carrito`}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-btn bg-fg px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-80"
    >
      <span aria-hidden="true">{done ? "✓" : "+"}</span>
      {done ? "Agregado" : "Agregar"}
    </button>
  );
}
