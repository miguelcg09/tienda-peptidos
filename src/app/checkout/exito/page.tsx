"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useCart } from "@/components/CartProvider";

function Exito() {
  const params = useSearchParams();
  const { clear } = useCart();
  useEffect(() => clear(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime/15 text-3xl text-lime">✓</div>
      <h1 className="mt-6 font-display text-3xl font-bold md:text-4xl">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-muted">
        Tu pedido <strong>{params.get("orden")}</strong> fue recibido. Te enviaremos la confirmación y el número de seguimiento por correo.
      </p>
      {params.get("modo") === "prueba" && (
        <p className="mt-4 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-800 dark:text-amber-200">Modo de prueba: no se realizó ningún cobro.</p>
      )}
      <Link href="/productos" className="btn-primary mt-8">
        Seguir comprando
      </Link>
    </div>
  );
}

export default function Page() {
  return <Suspense><Exito /></Suspense>;
}
