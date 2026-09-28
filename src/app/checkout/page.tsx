"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { findVariant, formatCLP } from "@/lib/products";
import { isValidRut } from "@/lib/rut";

const regiones = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
  "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos",
  "Los Lagos", "Aysén", "Magallanes",
];

export default function Checkout() {
  const { lines, subtotal, shipping, total } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">No hay productos en tu carrito</h1>
        <Link href="/productos" className="mt-6 inline-block text-accent underline">Ver productos</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const customer = Object.fromEntries(form.entries()) as Record<string, string>;
    if (!isValidRut(customer.rut)) return setError("El RUT ingresado no es válido.");

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  const input = "field";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Finalizar compra</h1>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Datos de contacto</legend>
          <label className="text-sm sm:col-span-2">Nombre completo<input name="name" required className={input} /></label>
          <label className="text-sm">Correo electrónico<input name="email" type="email" required className={input} /></label>
          <label className="text-sm">Teléfono<input name="phone" type="tel" required placeholder="+56 9" className={input} /></label>
          <label className="text-sm">RUT<input name="rut" required placeholder="12.345.678-9" className={input} /></label>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Dirección de despacho</legend>
          <label className="text-sm sm:col-span-2">Dirección<input name="address" required placeholder="Calle, número, depto." className={input} /></label>
          <label className="text-sm">Región
            <select name="region" required defaultValue="Metropolitana" className={input}>
              {regiones.map((r) => <option key={r} className="bg-surface">{r}</option>)}
            </select>
          </label>
          <label className="text-sm">Comuna<input name="comuna" required className={input} /></label>
        </fieldset>
        <label className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          <input type="checkbox" name="researchAck" required className="mt-1" />
          <span>
            Declaro ser mayor de 18 años y que los productos serán usados exclusivamente con fines de investigación,
            no para consumo humano o animal. Acepto los <Link href="/terminos" className="underline">términos y condiciones</Link>.
          </span>
        </label>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Redirigiendo al pago…" : `Pagar ${formatCLP(total)}`}
        </button>
        <p className="text-center text-xs text-muted">Serás redirigido a la pasarela de pago segura.</p>
      </form>

      <aside className="h-fit rounded-2xl bg-surface border p-6">
        <h2 className="font-semibold">Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => {
            const f = findVariant(l.variantId);
            if (!f) return null;
            return (
              <li key={l.variantId} className="flex justify-between gap-3">
                <span>{f.product.name} {f.variant.label} × {l.qty}</span>
                <span>{formatCLP(f.variant.price * l.qty)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío</dt><dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatCLP(total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
