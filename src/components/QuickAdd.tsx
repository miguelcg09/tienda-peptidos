"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { Icon } from "./Icon";

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
      className={`${className} ${done ? "bg-fg text-bg hover:bg-fg" : ""}`}
    >
      <span aria-hidden="true">{done ? <Icon name="check" size={18} /> : "+"}</span>
      <span className="@max-[16rem]:sr-only">{done ? "Agregado" : "Agregar"}</span>
    </button>
  );
}
