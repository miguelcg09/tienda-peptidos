"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

// Botón "Agregar" de las tarjetas: agrega la presentación única sin salir del listado.
export function QuickAdd({ variantId, name, className = "" }: { variantId: string; name: string; className?: string }) {
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
      className={`${className} ${done ? "bg-fg text-bg" : ""}`}
    >
      <span aria-hidden="true">{done ? "✓" : "+"}</span>
      {done ? "Agregado" : "Agregar"}
    </button>
  );
}
