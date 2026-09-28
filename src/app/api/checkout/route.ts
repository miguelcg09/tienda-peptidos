import { NextResponse } from "next/server";
import { findVariant } from "@/lib/products";
import { store } from "@/lib/config";
import { getPaymentProvider } from "@/lib/payments";
import { isValidRut } from "@/lib/rut";
import { createOrder, markPaid, newOrderId, type OrderItem } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";

type Body = {
  lines: { variantId: string; qty: number }[];
  customer: Record<string, string>;
};

export async function POST(req: Request) {
  const { lines, customer } = (await req.json()) as Body;

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

  // Los precios se recalculan en el servidor; nunca se confía en montos del navegador.
  let subtotal = 0;
  const items: OrderItem[] = [];
  for (const line of lines) {
    const found = findVariant(line.variantId);
    const qty = Math.floor(Number(line.qty));
    if (!found || !(qty >= 1 && qty <= 99)) {
      return NextResponse.json({ error: "Producto inválido en el carrito" }, { status: 400 });
    }
    subtotal += found.variant.price * qty;
    items.push({
      variantId: line.variantId,
      name: `${found.product.name} ${found.variant.label}`,
      qty,
      unitPrice: found.variant.price,
    });
  }
  const shipping = subtotal >= store.freeShippingFrom ? 0 : store.shippingCost;

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
    },
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
  });

  try {
    const { redirectUrl } = await getPaymentProvider().createPayment({
      orderId: order.id,
      amount: order.total,
      description: `Pedido ${order.id} · ${store.name}`,
      customer: { name: order.customer.name, email: order.customer.email, rut: order.customer.rut },
    });

    // En modo de prueba no hay pasarela que avise: se confirma el pago aquí mismo.
    if ((process.env.PAYMENT_PROVIDER ?? "mock") === "mock") {
      const paid = await markPaid(order.id, "modo-prueba");
      if (paid) await sendOrderEmails(paid);
    }

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta nuevamente." }, { status: 502 });
  }
}
