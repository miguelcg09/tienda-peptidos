import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { productSlugsForVariants, getProduct } from "@/lib/catalog";
import { createReview, displayName } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";
import { sendReviewNotice } from "@/lib/email";
import { isRecord, text } from "@/lib/validate";
import { tooManyRequests } from "@/lib/rate-limit";

// Recibe la reseña de un comprador. Se exige el número de pedido y el correo de la compra, y que el pedido
// ya esté despachado. Queda "pendiente" hasta que la tienda la aprueba en el panel.
export async function POST(req: Request) {
  if (tooManyRequests(req, "resenas", 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." }, { status: 429 });
  }
  const raw: unknown = await req.json().catch(() => null);
  const b = isRecord(raw) ? raw : {};
  const orden = text(b.orden, 40);
  const order = orden ? await getOrder(orden.toUpperCase()) : null;
  const email = (text(b.email, 254) ?? "").toLowerCase();
  if (!order || !email || email !== order.customer.email.toLowerCase()) {
    return NextResponse.json({ error: "No pudimos verificar tu compra. Revisa el número de pedido y el correo." }, { status: 403 });
  }
  if (order.status !== "despachado") {
    return NextResponse.json({ error: "Podrás dejar tu reseña cuando tu pedido esté despachado." }, { status: 409 });
  }
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Elige de 1 a 5 estrellas." }, { status: 400 });
  const body = (typeof b.body === "string" ? b.body : "").trim().slice(0, 800);

  const map = await productSlugsForVariants(order.items.map((i) => i.variantId));
  const slug = text(b.product, 120) ?? "";
  if (!Object.values(map).includes(slug)) return NextResponse.json({ error: "Ese producto no está en tu pedido." }, { status: 400 });

  const review = await createReview({ productSlug: slug, orderId: order.id, name: displayName(order.customer.name), rating, body });
  if (!review) return NextResponse.json({ error: "Ya dejaste tu reseña de este producto." }, { status: 409 });

  const product = await getProduct(slug, { includeHidden: true });
  await sendReviewNotice(review, product?.name ?? slug, await getSettings());
  return NextResponse.json({ ok: true });
}
