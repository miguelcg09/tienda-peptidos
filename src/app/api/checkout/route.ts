import { NextResponse } from "next/server";
import { findVariant } from "@/lib/products";
import { store } from "@/lib/config";
import { getPaymentProvider } from "@/lib/payments";
import { isValidRut } from "@/lib/rut";

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
  if (!customer.email || !customer.name || !isValidRut(customer.rut ?? "")) {
    return NextResponse.json({ error: "Datos de contacto incompletos" }, { status: 400 });
  }

  // Los precios se recalculan en el servidor; nunca se confía en montos del navegador.
  let subtotal = 0;
  const items: string[] = [];
  for (const line of lines) {
    const found = findVariant(line.variantId);
    const qty = Math.floor(Number(line.qty));
    if (!found || !(qty >= 1 && qty <= 99)) {
      return NextResponse.json({ error: "Producto inválido en el carrito" }, { status: 400 });
    }
    subtotal += found.variant.price * qty;
    items.push(`${found.product.name} ${found.variant.label} x${qty}`);
  }
  const shipping = subtotal >= store.freeShippingFrom ? 0 : store.shippingCost;
  const orderId = `HX-${Date.now().toString(36).toUpperCase()}`;

  // TODO: guardar la orden (base de datos o planilla) y enviar correo de confirmación.
  console.log("Nueva orden", { orderId, customer, items, subtotal, shipping });

  try {
    const { redirectUrl } = await getPaymentProvider().createPayment({
      orderId,
      amount: subtotal + shipping,
      description: `Pedido ${orderId} · ${store.name}`,
      customer: { name: customer.name, email: customer.email, rut: customer.rut },
    });
    return NextResponse.json({ orderId, redirectUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta nuevamente." }, { status: 502 });
  }
}
