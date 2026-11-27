import { NextResponse } from "next/server";
import { getOrder, markFailed, markPaid } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { decrementStock } from "@/lib/catalog";
import { tooManyRequests } from "@/lib/rate-limit";
import { FLOW_STATUS, flowGetStatus, readFlowToken } from "@/lib/flow";

// Aviso de Flow (urlConfirmation): llega un POST que solo trae "token" y no viene firmado.
// No se confía en él: se consulta el estado en la API de Flow (firmada con la secretKey) y se comprueba
// que el pedido, el monto y la moneda coincidan antes de marcarlo pagado.
export async function POST(req: Request) {
  // Cada aviso hace una consulta a Flow: sin límite, alguien podría agotar el cupo con avisos falsos.
  if (tooManyRequests(req, "webhook-flow", 120, 60_000)) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const token = await readFlowToken(req);
  if (!token || token.length > 200) return NextResponse.json({ error: "Falta token" }, { status: 400 });

  let payment;
  try {
    payment = await flowGetStatus(token);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 502 });
  }
  if (!payment.commerceOrder) return NextResponse.json({ error: "El pago no indica pedido" }, { status: 400 });

  const order = await getOrder(payment.commerceOrder);
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  const ref = `flow-${payment.flowOrder}`;

  if (payment.status === FLOW_STATUS.PAID) {
    const amountOk = Math.round(Number(payment.amount)) === order.total;
    const currencyOk = String(payment.currency ?? "").toUpperCase() === "CLP";
    if (!amountOk || !currencyOk) {
      console.error(`Pago Flow ${payment.flowOrder} no coincide con el pedido ${order.id}: ${payment.amount} ${payment.currency} vs ${order.total} CLP`);
      return NextResponse.json({ error: "El monto o la moneda no coinciden con el pedido" }, { status: 409 });
    }
    const paid = await markPaid(order.id, ref);
    if (paid) {
      await decrementStock(paid.items);
      await sendOrderEmails(paid, await getSettings());
    }
  } else if (payment.status === FLOW_STATUS.REJECTED || payment.status === FLOW_STATUS.CANCELED) {
    await markFailed(order.id, ref);
  }

  return NextResponse.json({ ok: true, status: payment.status });
}
