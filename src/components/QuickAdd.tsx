"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

// Botón "+" de las tarjetas: agrega la presentación única sin salir del listado.
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
      className="grid h-12 w-12 shrink-0 place-items-center rounded-btn bg-fg pb-0.5 text-2xl leading-none text-bg transition-opacity hover:opacity-80"
    >
      {done ? "✓" : "+"}
    </button>
  );
}
