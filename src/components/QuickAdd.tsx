"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

// Botón "Agregar" que aparece al pasar el mouse por la tarjeta; agrega sin salir del catálogo.
export function QuickAdd({ variantId }: { variantId: string }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(variantId, 1);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-fg px-4 py-2 text-xs font-semibold text-bg opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
    >
      {done ? "✓ En el carrito" : "+ Agregar"}
    </button>
  );
}
