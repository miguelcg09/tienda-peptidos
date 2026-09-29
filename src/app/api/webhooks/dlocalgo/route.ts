import { NextResponse } from "next/server";
import { getOrder, markFailed, markPaid } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { decrementStock } from "@/lib/catalog";

// Notificación de dLocal Go cuando cambia el estado de un pago.
// No se confía en lo recibido: se consulta el pago en la API de dLocal Go y se
// comprueba que el pedido, el monto y la moneda coincidan antes de marcarlo pagado.
// Endpoints verificados contra el cliente oficial (GET /v1/payments/{id}, Bearer apiKey:secretKey).

type Payment = { id: string; status: string; order_id?: string; amount?: number; currency?: string };

const PAID = ["PAID", "COMPLETED", "APPROVED"];
const FAILED = ["REJECTED", "CANCELLED", "CANCELED", "EXPIRED"];

// El aviso puede llegar como JSON, formulario o con el id en la URL; se aceptan los tres.
async function readPaymentId(req: Request) {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("payment_id") ?? url.searchParams.get("id");
  if (fromQuery) return fromQuery;
  const type = req.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      return String(body.payment_id ?? body.id ?? "");
    }
    if (type.includes("form")) {
      const form = await req.formData();
      return String(form.get("payment_id") ?? form.get("id") ?? "");
    }
    const text = await req.text();
    try {
      const body = JSON.parse(text) as Record<string, unknown>;
      return String(body.payment_id ?? body.id ?? "");
    } catch {
      return new URLSearchParams(text).get("payment_id") ?? "";
    }
  } catch {
    return "";
  }
}

async function handle(req: Request) {
  const paymentId = await readPaymentId(req);
  if (!paymentId) return NextResponse.json({ error: "Falta payment_id" }, { status: 400 });

  const apiKey = process.env.DLOCALGO_API_KEY;
  const secretKey = process.env.DLOCALGO_SECRET_KEY;
  if (!apiKey || !secretKey) return NextResponse.json({ error: "Pasarela no configurada" }, { status: 500 });

  const base = process.env.DLOCALGO_SANDBOX === "false" ? "https://api.dlocalgo.com" : "https://api-sbx.dlocalgo.com";
  const res = await fetch(`${base}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${apiKey}:${secretKey}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error(`dLocal Go respondió ${res.status} al consultar el pago ${paymentId}`);
    return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 502 });
  }
  const payment = (await res.json()) as Payment;
  const status = String(payment.status ?? "").toUpperCase();
  if (!payment.order_id) return NextResponse.json({ error: "El pago no indica pedido" }, { status: 400 });

  const order = await getOrder(payment.order_id);
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  if (PAID.includes(status)) {
    const amountOk = payment.amount == null || Math.round(Number(payment.amount)) === order.total;
    const currencyOk = !payment.currency || payment.currency.toUpperCase() === "CLP";
    if (!amountOk || !currencyOk) {
      console.error(`Pago ${payment.id} no coincide con el pedido ${order.id}: ${payment.amount} ${payment.currency} vs ${order.total} CLP`);
      return NextResponse.json({ error: "El monto o la moneda no coinciden con el pedido" }, { status: 409 });
    }
    const paid = await markPaid(order.id, payment.id);
    if (paid) {
      await decrementStock(paid.items);
      await sendOrderEmails(paid, await getSettings());
    }
  } else if (FAILED.includes(status)) {
    await markFailed(order.id, payment.id);
  }

  return NextResponse.json({ ok: true, status });
}

export const POST = handle;
export const GET = handle;
