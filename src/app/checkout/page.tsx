"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/products";
import { isValidRut } from "@/lib/rut";
import { whatsappLink } from "@/lib/whatsapp";
import { AddressPicker } from "@/components/AddressPicker";
import { Icon } from "@/components/Icon";

type Method = "transferencia" | "tarjeta";
type Coupon = { code: string; discount: number; description: string };

export default function Checkout() {
  const { lines, subtotal, find, settings, ready } = useCart();
  const { payments } = settings;
  const methods: Method[] = [...(payments.transfer ? (["transferencia"] as const) : []), ...(payments.card ? (["tarjeta"] as const) : [])];
  const [method, setMethod] = useState<Method>(methods[0] ?? "transferencia");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Al aparecer un error, el foco va al mensaje: así se lee y se ve aunque el botón de pago esté fuera de pantalla.
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  // El descuento se muestra aquí; al crear el pedido el servidor lo vuelve a calcular.
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingCost;
  const total = afterDiscount + shipping;

  // Mientras se lee el carrito guardado no se muestra «vacío» (parpadeaba antes de cargar).
  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">Cargando tu carrito…</div>;
  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <span aria-hidden="true" className="animate-float mb-6 grid h-24 w-24 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="cart" size={44} /></span>
        <h1 className="t-h2">No hay productos en tu carrito</h1>
        <Link href="/productos" className="mt-6 inline-block font-medium text-accent-2 underline underline-offset-4">Ver productos</Link>
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
    <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={onSubmit} className="space-y-8">
        <h1 className="t-page">Finalizar compra</h1>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 flex items-center gap-3 font-display text-lg font-semibold"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="user" size={18} /></span>Datos de contacto</legend>
          <label className="text-sm sm:col-span-2">Nombre completo<input name="name" required minLength={2} maxLength={120} autoComplete="name" className={input} /></label>
          <label className="text-sm">Correo electrónico<input name="email" type="email" required maxLength={254} autoComplete="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}" title="Escribe un correo completo, por ejemplo nombre@correo.cl" className={input} /></label>
          <label className="text-sm">Teléfono<input name="phone" type="tel" required maxLength={30} autoComplete="tel" pattern="[0-9+\(\)\s\-]{8,30}" title="Escribe un teléfono con al menos 8 números, por ejemplo +56 9 1234 5678" placeholder="+56 9" className={input} /></label>
          <label className="text-sm">RUT<input name="rut" required maxLength={14} placeholder="12.345.678-9" className={input} /></label>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 flex items-center gap-3 font-display text-lg font-semibold"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="pin" size={18} /></span>Dirección de despacho</legend>
          <AddressPicker />
        </fieldset>

        <fieldset>
          <legend className="mb-3 flex items-center gap-3 font-display text-lg font-semibold"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="card" size={18} /></span>Medio de pago</legend>
          {methods.length === 0 ? (
            <div className="rounded-[1.5rem] border bg-surface p-4 text-sm">
              <p>Los pagos en línea se habilitan muy pronto. Mientras tanto, escríbenos por WhatsApp o correo y coordinamos tu pedido.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary gap-2 text-sm"><Icon name="chat" size={18} />Pedir por WhatsApp</a>}
                <a href={`mailto:${settings.email}?subject=Pedido&body=${encodeURIComponent(waText)}`} className="btn-ghost gap-2 text-sm"><Icon name="mail" size={18} />Pedir por correo</a>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {payments.transfer && (
                <label className={`lift cursor-pointer rounded-[1.5rem] border bg-surface p-4 text-sm ${method === "transferencia" ? "border-accent ring-2 ring-accent/30" : "hover:border-accent"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="paymentMethod" value="transferencia" checked={method === "transferencia"} onChange={() => setMethod("transferencia")} className="accent-[var(--accent)]" />
                    <Icon name="bank" size={18} className="text-accent-2" /> Transferencia bancaria
                  </span>
                  <span className="mt-1 block text-xs text-muted">Te mostramos los datos al confirmar. Despachamos apenas veamos el abono.</span>
                </label>
              )}
              {payments.card && (
                <label className={`lift cursor-pointer rounded-[1.5rem] border bg-surface p-4 text-sm ${method === "tarjeta" ? "border-accent ring-2 ring-accent/30" : "hover:border-accent"}`}>
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="paymentMethod" value="tarjeta" checked={method === "tarjeta"} onChange={() => setMethod("tarjeta")} className="accent-[var(--accent)]" />
                    <Icon name="card" size={18} className="text-accent-2" /> Tarjeta o Webpay{payments.test && " (modo de prueba)"}
                  </span>
                  <span className="mt-1 block text-xs text-muted">Crédito, débito y otros medios en la pasarela segura.</span>
                </label>
              )}
            </div>
          )}
        </fieldset>

        <label className="flex gap-3 rounded-[1.5rem] border border-line bg-surface-2 p-4 text-sm">
          <input type="checkbox" name="researchAck" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
          <span>
            Declaro ser mayor de 18 años y que los productos serán usados exclusivamente con fines de investigación,
            no para consumo humano o animal. Acepto los <Link href="/terminos" className="underline">términos y condiciones</Link>, la <Link href="/envios" className="underline">política de envíos y devoluciones</Link> y la <Link href="/privacidad" className="underline">política de privacidad</Link>.
          </span>
        </label>
        {error && <p ref={errorRef} role="alert" tabIndex={-1} className="rounded-lg bg-red-500/10 p-3 text-sm text-red-800 outline-none dark:text-red-200">{error}</p>}
        <button disabled={loading || methods.length === 0} className="btn-primary group/pay w-full gap-2">
          {!loading && <Icon name="lock" size={18} />}
          {loading
            ? method === "transferencia" ? "Creando tu pedido…" : "Redirigiendo al pago…"
            : method === "transferencia" ? `Confirmar pedido · ${formatCLP(total)}` : `Pagar ${formatCLP(total)}`}
        </button>
        <p className="text-center text-xs text-muted">
          {method === "transferencia" ? "Verás los datos para transferir en pantalla y en tu correo." : "Serás redirigido a la pasarela de pago segura."}
        </p>
      </form>

      <aside className="h-fit rounded-[1.75rem] border bg-surface p-6 lg:sticky lg:top-[calc(var(--bar-h)+6.5rem)]">
        <h2 className="flex items-center gap-3 font-display text-lg font-semibold"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="receipt" size={18} /></span>Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => {
            const f = find(l.variantId);
            if (!f) return null;
            return (
              <li key={l.variantId} className="flex justify-between gap-3">
                <span className="min-w-0 break-words">{f.product.name} {f.variant.label} × {l.qty}</span>
                <span className="shrink-0">{formatCLP(f.variant.price * l.qty)}</span>
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
            <button type="button" onClick={() => void applyCoupon()} disabled={couponBusy || !couponInput.trim()} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-control px-4 text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2 disabled:opacity-50">
              {couponBusy ? "…" : "Aplicar"}
            </button>
          </div>
          {couponMsg && <p role="status" className={`mt-2 text-xs ${coupon ? "text-accent-2" : "text-red-800 dark:text-red-200"}`} data-testid="cupon-msg">{couponMsg}</p>}
        </div>

        <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-accent-2"><dt>Descuento ({coupon?.code})</dt><dd>-{formatCLP(discount)}</dd></div>}
          <div className="flex justify-between"><dt className="flex items-center gap-2"><Icon name="truck" size={16} className="text-accent-2" />Envío</dt><dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd data-testid="total">{formatCLP(total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
