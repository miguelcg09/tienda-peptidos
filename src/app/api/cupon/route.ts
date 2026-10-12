import { NextResponse } from "next/server";
import { applyCoupon, describeCoupon } from "@/lib/coupons";
import { isRecord, text } from "@/lib/validate";
import { tooManyRequests } from "@/lib/rate-limit";

// Valida un cupón para mostrar el descuento en el checkout (el cobro real se recalcula al crear el pedido).
export async function POST(req: Request) {
  if (tooManyRequests(req, "cupon", 30, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." }, { status: 429 });
  }
  const body: unknown = await req.json().catch(() => null);
  const code = isRecord(body) ? text(body.code, 40) : null;
  if (!code) return NextResponse.json({ error: "Escribe un cupón" }, { status: 400 });
  const subtotal = isRecord(body) ? Math.max(0, Number(body.subtotal) || 0) : 0;
  const r = await applyCoupon(code, subtotal);
  if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 400 });
  return NextResponse.json({ code: r.coupon.code, discount: r.discount, description: describeCoupon(r.coupon) });
}
