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
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl text-green-700">✓</div>
      <h1 className="mt-6 text-3xl font-bold">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-slate-600">
        Tu pedido <strong>{params.get("orden")}</strong> fue recibido. Te enviaremos la confirmación y el número de seguimiento por correo.
      </p>
      {params.get("modo") === "prueba" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Modo de prueba: no se realizó ningún cobro.</p>
      )}
      <Link href="/productos" className="mt-8 inline-block rounded-full bg-brand px-6 py-3 font-medium text-white">
        Seguir comprando
      </Link>
    </div>
  );
}

export default function Page() {
  return <Suspense><Exito /></Suspense>;
}
