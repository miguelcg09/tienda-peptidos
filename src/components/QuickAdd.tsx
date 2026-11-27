"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { useT } from "./T";

// Botón "Agregar" de las tarjetas: agrega la presentación única sin salir del listado.
export function QuickAdd({ variantId, name, className = "" }: { variantId: string; name: string; className?: string }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const t = useT();
  return (
    <button
      onClick={() => {
        add(variantId, 1);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      aria-label={done ? `${name} agregado al carrito` : `Agregar ${name} al carrito`}
      className={`${className} ${done ? "!bg-fg !text-bg" : ""}`}
    >
      {done ? t("ficha.agregado") : t("ficha.agregar")}
      <span aria-hidden="true" className="font-mono">{done ? "✓" : "+"}</span>
    </button>
  );
}
