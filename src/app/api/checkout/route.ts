import { NextResponse } from "next/server";
import { findVariant, decrementStock } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { cardProviderName, getPaymentProvider } from "@/lib/payments";
import { isValidRut } from "@/lib/rut";
import { createOrder, markPaid, newOrderId, type OrderItem } from "@/lib/orders";
import { sendOrderEmails, sendTransferEmails } from "@/lib/email";
import { applyCoupon, redeemCoupon } from "@/lib/coupons";
import { hasBankData } from "@/lib/config";

type Body = {
  lines: { variantId: string; qty: number }[];
  customer: Record<string, string>;
};

export async function POST(req: Request) {
  const { lines, customer } = (await req.json()) as Body;
  const settings = await getSettings();

  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!customer?.researchAck) {
    return NextResponse.json({ error: "Debes aceptar el uso exclusivo para investigación" }, { status: 400 });
  }
  const required = ["name", "email", "phone", "address", "region", "comuna"] as const;
  if (required.some((k) => !customer[k]?.trim()) || !isValidRut(customer.rut ?? "")) {
    return NextResponse.json({ error: "Datos de contacto incompletos" }, { status: 400 });
  }

  // Medio de pago: transferencia (si hay datos bancarios) o tarjeta (si hay pasarela configurada).
  const method = customer.paymentMethod === "transferencia" ? "transferencia" : "tarjeta";
  if (method === "transferencia" && !hasBankData(settings)) {
    return NextResponse.json({ error: "El pago por transferencia no está habilitado" }, { status: 400 });
  }
  if (method === "tarjeta" && !cardProviderName()) {
    return NextResponse.json({ error: "El pago con tarjeta aún no está habilitado. Elige otro medio de pago." }, { status: 400 });
  }

  // Los precios se recalculan en el servidor; nunca se confía en montos del navegador.
  let subtotal = 0;
  const items: OrderItem[] = [];
  for (const line of lines) {
    const found = await findVariant(line.variantId);
    const qty = Math.floor(Number(line.qty));
    if (!found || !(qty >= 1 && qty <= 99)) {
      return NextResponse.json({ error: "Producto inválido en el carrito" }, { status: 400 });
    }
    if (found.variant.stock != null && found.variant.stock < qty) {
      return NextResponse.json(
        { error: `${found.product.name} ${found.variant.label}: ${found.variant.stock === 0 ? "agotado" : `solo quedan ${found.variant.stock}`}` },
        { status: 409 },
      );
    }
    subtotal += found.variant.price * qty;
    items.push({
      variantId: line.variantId,
      name: `${found.product.name} ${found.variant.label}`,
      qty,
      unitPrice: found.variant.price,
    });
  }

  // Cupón: se vuelve a validar aquí con el subtotal real.
  let discount = 0;
  let coupon: string | null = null;
  if (customer.coupon?.trim()) {
    const r = await applyCoupon(customer.coupon, subtotal);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 400 });
    discount = r.discount;
    coupon = r.coupon.code;
  }
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingCost;

  const order = await createOrder({
    id: newOrderId(),
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      rut: customer.rut.trim(),
      address: customer.address.trim(),
      region: customer.region.trim(),
      comuna: customer.comuna.trim(),
      ...(customer.reference?.trim() ? { reference: customer.reference.trim() } : {}),
      ...(Number.isFinite(Number(customer.lat)) && Number.isFinite(Number(customer.lng)) && customer.lat && customer.lng
        ? { lat: Number(customer.lat), lng: Number(customer.lng) }
        : {}),
    },
    items,
    subtotal,
    discount,
    coupon,
    shipping,
    total: afterDiscount + shipping,
    paymentMethod: method,
  });
  if (coupon) await redeemCoupon(coupon);

  // Transferencia: el pedido queda pendiente; el cliente recibe los datos y la tienda un aviso.
  if (method === "transferencia") {
    await sendTransferEmails(order, settings);
    return NextResponse.json({ orderId: order.id, redirectUrl: `/checkout/exito?orden=${order.id}&pago=transferencia` });
  }

  try {
    const { redirectUrl } = await getPaymentProvider().createPayment({
      orderId: order.id,
      amount: order.total,
      description: `Pedido ${order.id} · ${settings.name}`,
      customer: { name: order.customer.name, email: order.customer.email, rut: order.customer.rut },
    });

    // En modo de prueba no hay pasarela que avise: se confirma el pago aquí mismo.
    if (cardProviderName() === "mock") {
      const paid = await markPaid(order.id, "modo-prueba");
      if (paid) {
        await decrementStock(paid.items);
        await sendOrderEmails(paid, settings);
      }
    }

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta nuevamente." }, { status: 502 });
  }
}
