"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/products";
import { isValidRut } from "@/lib/rut";
import { whatsappLink } from "@/lib/whatsapp";
import { AddressPicker } from "@/components/AddressPicker";

type Method = "transferencia" | "tarjeta";
type Coupon = { code: string; discount: number; description: string };

export default function Checkout() {
  const { lines, subtotal, find, settings } = useCart();
  const { payments } = settings;
  const methods: Method[] = [...(payments.transfer ? (["transferencia"] as const) : []), ...(payments.card ? (["tarjeta"] as const) : [])];
  const [method, setMethod] = useState<Method>(methods[0] ?? "transferencia");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  // El descuento se muestra aquí; al crear el pedido el servidor lo vuelve a calcular.
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingCost;
  const total = afterDiscount + shipping;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">No hay productos en tu carrito</h1>
        <Link href="/productos" className="mt-6 inline-block text-accent underline">Ver productos</Link>
      </div>
    );
  }

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponBusy(true);
    setCouponMsg("");
    try {
      const r = await fetch("/api/cupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotal }) });
      const data = (await r.json()) as Coupon & { error?: string };
      if (!r.ok) {
        setCoupon(null);
        setCouponMsg(data.error ?? "Cupón no válido");
      } else {
        setCoupon(data);
        setCouponMsg(`Cupón aplicado: ${data.description}.`);
      }
    } catch {
      setCouponMsg("No pudimos validar el cupón. Intenta de nuevo.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const customer = Object.fromEntries(form.entries()) as Record<string, string>;
    if (!isValidRut(customer.rut)) return setError("El RUT ingresado no es válido.");
    customer.coupon = coupon?.code ?? "";
    customer.paymentMethod = method;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el pedido");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  const input = "field";
  const waText = `Hola, quiero hacer un pedido: ${lines
    .map((l) => { const f = find(l.variantId); return f ? `${f.product.name} ${f.variant.label} ×${l.qty}` : ""; })
    .filter(Boolean)
    .join(", ")}.`;
  const wa = whatsappLink(settings.whatsapp, waText);

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
          <AddressPicker />
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-semibold">Medio de pago</legend>
          {methods.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm">
              <p>Los pagos en línea se habilitan muy pronto. Mientras tanto, escríbenos por WhatsApp o correo y coordinamos tu pedido.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary text-sm">Pedir por WhatsApp</a>}
                <a href={`mailto:${settings.email}?subject=Pedido&body=${encodeURIComponent(waText)}`} className="btn-ghost text-sm">Pedir por correo</a>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {payments.transfer && (
                <label className={`cursor-pointer rounded-xl border p-4 text-sm transition ${method === "transferencia" ? "border-accent ring-2 ring-accent/30" : "hover:border-accent"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="paymentMethod" value="transferencia" checked={method === "transferencia"} onChange={() => setMethod("transferencia")} />
                    🏦 Transferencia bancaria
                  </span>
                  <span className="mt-1 block text-xs text-muted">Te mostramos los datos al confirmar. Despachamos apenas veamos el abono.</span>
                </label>
              )}
              {payments.card && (
                <label className={`cursor-pointer rounded-xl border p-4 text-sm transition ${method === "tarjeta" ? "border-accent ring-2 ring-accent/30" : "hover:border-accent"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="paymentMethod" value="tarjeta" checked={method === "tarjeta"} onChange={() => setMethod("tarjeta")} />
                    💳 Tarjeta o Webpay{payments.test && " (modo de prueba)"}
                  </span>
                  <span className="mt-1 block text-xs text-muted">Crédito, débito y otros medios en la pasarela segura.</span>
                </label>
              )}
            </div>
          )}
        </fieldset>

        <label className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          <input type="checkbox" name="researchAck" required className="mt-1" />
          <span>
            Declaro ser mayor de 18 años y que los productos serán usados exclusivamente con fines de investigación,
            no para consumo humano o animal. Acepto los <Link href="/terminos" className="underline">términos y condiciones</Link>, la <Link href="/envios" className="underline">política de envíos y devoluciones</Link> y la <Link href="/privacidad" className="underline">política de privacidad</Link>.
          </span>
        </label>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <button disabled={loading || methods.length === 0} className="btn-primary w-full">
          {loading
            ? method === "transferencia" ? "Creando tu pedido…" : "Redirigiendo al pago…"
            : method === "transferencia" ? `Confirmar pedido · ${formatCLP(total)}` : `Pagar ${formatCLP(total)}`}
        </button>
        <p className="text-center text-xs text-muted">
          {method === "transferencia" ? "Verás los datos para transferir en pantalla y en tu correo." : "Serás redirigido a la pasarela de pago segura."}
        </p>
      </form>

      <aside className="h-fit rounded-2xl border bg-surface p-6">
        <h2 className="font-semibold">Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => {
            const f = find(l.variantId);
            if (!f) return null;
            return (
              <li key={l.variantId} className="flex justify-between gap-3">
                <span>{f.product.name} {f.variant.label} × {l.qty}</span>
                <span>{formatCLP(f.variant.price * l.qty)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t pt-4">
          <p className="text-xs text-muted">¿Tienes un cupón?</p>
          <div className="mt-1 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void applyCoupon(); } }}
              placeholder="CÓDIGO"
              aria-label="Cupón de descuento"
              className="field mt-0 min-w-0 flex-1 uppercase"
            />
            <button type="button" onClick={() => void applyCoupon()} disabled={couponBusy || !couponInput.trim()} className="shrink-0 rounded-xl border px-3 text-sm transition hover:border-accent disabled:opacity-50">
              {couponBusy ? "…" : "Aplicar"}
            </button>
          </div>
          {couponMsg && <p className={`mt-2 text-xs ${coupon ? "text-accent" : "text-red-600 dark:text-red-300"}`} data-testid="cupon-msg">{couponMsg}</p>}
        </div>

        <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-accent"><dt>Descuento ({coupon?.code})</dt><dd>-{formatCLP(discount)}</dd></div>}
          <div className="flex justify-between"><dt>Envío</dt><dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd data-testid="total">{formatCLP(total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
