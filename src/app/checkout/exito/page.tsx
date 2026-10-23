"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatCLP } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";
import { Icon } from "@/components/Icon";

type Summary = {
  id: string;
  status: "pendiente" | "pagado" | "despachado" | "fallido";
  items: { variantId: string; name: string; qty: number; unitPrice: number }[];
  discount: number;
  shipping: number;
  total: number;
  emailHint: string;
};

function Exito() {
  const params = useSearchParams();
  const orderId = params.get("orden");
  const transfer = params.get("pago") === "transferencia";
  const { clear, settings } = useCart();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [missing, setMissing] = useState(!orderId);
  const [copied, setCopied] = useState(false);

  // El carrito se vacía solo cuando el pedido existe y no falló el pago: abrir un enlace cualquiera, o volver
  // tras un pago rechazado, no debe borrar lo que el cliente tenía en el carrito.
  useEffect(() => {
    if (summary && summary.status !== "fallido") clear();
  }, [summary]); // eslint-disable-line react-hooks/exhaustive-deps

  // Con una pasarela real el pago se confirma por webhook unos segundos después:
  // se vuelve a consultar cada 3 s durante 2 minutos mientras siga pendiente (no aplica a transferencias).
  useEffect(() => {
    if (!orderId) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" })
        .then(async (r) => {
          if (r.status === 404) return { notFound: true as const };
          return r.ok ? { summary: (await r.json()) as Summary } : {};
        })
        .then((res) => {
          if ("notFound" in res) return setMissing(true);
          const s = "summary" in res ? (res.summary ?? null) : null;
          setSummary(s);
          if (!transfer && s?.status === "pendiente" && tries++ < 40) timer = setTimeout(load, 3000);
        })
        .catch(() => setSummary(null));
    };
    load();
    return () => clearTimeout(timer);
  }, [orderId, transfer]);

  const pending = summary?.status === "pendiente";
  const failed = summary?.status === "fallido";
  const paid = summary?.status === "pagado" || summary?.status === "despachado";
  const bank = [
    ["Banco", settings.bankName],
    ["Tipo de cuenta", settings.bankAccountType],
    ["N.º de cuenta", settings.bankAccount],
    ["Titular", settings.bankHolder],
    ["RUT", settings.bankRut],
    ["Correo", settings.bankEmail],
    ["Comentario", `Pedido ${orderId}`],
  ].filter(([, v]) => v);
  const bankText = bank.map(([k, v]) => `${k}: ${v}`).join("\n");
  const wa = whatsappLink(settings.whatsapp, `Hola, envío el comprobante de transferencia del pedido ${orderId}.`);

  function copy() {
    navigator.clipboard?.writeText(`${bankText}\nMonto: ${summary ? formatCLP(summary.total) : ""}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (missing) {
    return (
      <div className="animate-fade mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-tint/10 text-3xl text-muted" aria-hidden="true">?</div>
        <h1 className="t-page mt-6">No encontramos este pedido</h1>
        <p className="mt-3 text-muted">Revisa el enlace de tu correo de confirmación o busca tu pedido con su número. Si acabas de pagar y no ves el correo, escríbenos.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/pedido" className="btn-primary">Buscar mi pedido</Link>
          <Link href="/productos" className="btn-ghost">Ver productos</Link>
        </div>
      </div>
    );
  }

  const title = failed
    ? "El pago no se completó"
    : transfer && !paid
      ? "Pedido recibido: falta tu transferencia"
      : pending
        ? "Estamos confirmando tu pago"
        : "¡Gracias por tu compra!";

  return (
    <div className="animate-fade mx-auto max-w-xl px-4 py-20 text-center">
      <div aria-hidden="true" className={`animate-pop mx-auto grid h-20 w-20 place-items-center rounded-full ${failed ? "bg-red-500/15 text-red-700 dark:text-red-300" : "bg-surface-2 text-accent-2"}`}>
        <Icon name={failed ? "close" : transfer && !paid ? "bank" : pending ? "clock" : "check"} size={36} />
      </div>
      <h1 className="t-page mt-6">{title}</h1>
      {failed && (
        <p className="mt-3 text-muted">No se realizó ningún cobro. Puedes volver al carrito e intentarlo con otro medio de pago.</p>
      )}
      <p className="mt-3 text-muted">
        Tu pedido <strong className="break-all text-fg">{orderId}</strong> fue recibido.
        {summary && !transfer && <> Te enviaremos la confirmación y el número de seguimiento a <strong className="text-fg">{summary.emailHint}</strong>.</>}
        {summary && transfer && <> Te enviamos estos mismos datos a <strong className="text-fg">{summary.emailHint}</strong>.</>}
      </p>

      {transfer && !paid && !failed && (
        <div className="mt-8 rounded-[1.75rem] border border-accent/30 bg-surface-2 p-5 text-left text-sm" data-testid="transferencia">
          <p className="font-semibold">Transfiere {summary ? <span className="text-accent-2">{formatCLP(summary.total)}</span> : "el total"} a esta cuenta:</p>
          <dl className="mt-3 grid gap-1 sm:grid-cols-[150px_1fr]">
            {bank.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-muted">
            Pon el número de pedido en el comentario de la transferencia y envíanos el comprobante. Reservamos tu pedido por 48 horas y lo despachamos apenas confirmemos el abono.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary gap-2 text-sm"><Icon name="chat" size={18} />Enviar comprobante por WhatsApp</a>}
            <a href={`mailto:${settings.bankEmail || settings.email}?subject=${encodeURIComponent(`Comprobante pedido ${orderId}`)}`} className="btn-ghost gap-2 text-sm"><Icon name="mail" size={18} />Enviar por correo</a>
            <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-control px-5 text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2"><Icon name={copied ? "check" : "doc"} size={16} />{copied ? "Copiado" : "Copiar datos"}</button>
          </div>
        </div>
      )}

      {summary && (
        <div className="glass mt-8 rounded-[1.75rem] p-5 text-left text-sm">
          <ul className="space-y-2">
            {summary.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-4">
                <span className="min-w-0 break-words">{i.name} × {i.qty}</span>
                <span className="shrink-0">{formatCLP(i.unitPrice * i.qty)}</span>
              </li>
            ))}
            {summary.discount > 0 && (
              <li className="flex justify-between border-t pt-2 text-accent-2"><span>Descuento</span><span>-{formatCLP(summary.discount)}</span></li>
            )}
            <li className={`flex justify-between text-muted ${summary.discount > 0 ? "" : "border-t pt-2"}`}>
              <span>Envío</span><span>{summary.shipping ? formatCLP(summary.shipping) : "Gratis"}</span>
            </li>
            <li className="flex justify-between font-semibold"><span>Total</span><span>{formatCLP(summary.total)}</span></li>
          </ul>
        </div>
      )}

      {params.get("modo") === "prueba" && (
        <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-sm">Modo de prueba: no se realizó ningún cobro.</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={failed ? "/carrito" : "/productos"} className="btn-primary">{failed ? "Volver al carrito" : "Seguir comprando"}</Link>
        {orderId && !failed && <Link href={`/pedido?orden=${encodeURIComponent(orderId)}`} className="btn-ghost">Seguir mi pedido</Link>}
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><Exito /></Suspense>;
}
