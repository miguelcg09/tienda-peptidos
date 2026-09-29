import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { getProduct, productSlugsForVariants } from "@/lib/catalog";
import { reviewedSlugs } from "@/lib/reviews";

// Resumen público de un pedido (sin datos personales). Si además llega el correo
// del comprador y coincide, se devuelve el seguimiento completo.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id.trim().toUpperCase());
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase();
  const verified = Boolean(email) && email === order.customer.email.toLowerCase();

  // Con el pedido despachado, se informa qué productos puede reseñar el comprador.
  let reviewable: { slug: string; name: string; done: boolean }[] | undefined;
  if (verified && order.status === "despachado") {
    const map = await productSlugsForVariants(order.items.map((i) => i.variantId));
    const slugs = [...new Set(order.items.map((i) => map[i.variantId]).filter(Boolean))];
    const done = new Set(await reviewedSlugs(order.id));
    reviewable = [];
    for (const slug of slugs) {
      const p = await getProduct(slug, { includeHidden: true });
      if (p) reviewable.push({ slug, name: p.name, done: done.has(slug) });
    }
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    items: order.items,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    emailHint: order.customer.email.replace(/^(.).+(@.+)$/, "$1***$2"),
    createdAt: order.createdAt,
    ...(verified
      ? {
          verified: true,
          paidAt: order.paidAt,
          shippedAt: order.shippedAt,
          tracking: order.tracking,
          name: order.customer.name.split(" ")[0],
          destination: `${order.customer.comuna}, ${order.customer.region}`,
          ...(reviewable ? { reviewable } : {}),
        }
      : { verified: false }),
  });
}
