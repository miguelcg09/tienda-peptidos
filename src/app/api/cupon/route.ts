import { NextResponse } from "next/server";
import { applyCoupon, describeCoupon } from "@/lib/coupons";

// Valida un cupón para mostrar el descuento en el checkout (el cobro real se recalcula al crear el pedido).
export async function POST(req: Request) {
  const { code, subtotal } = (await req.json().catch(() => ({}))) as { code?: string; subtotal?: number };
  if (!code?.trim()) return NextResponse.json({ error: "Escribe un cupón" }, { status: 400 });
  const r = await applyCoupon(code, Math.max(0, Number(subtotal) || 0));
  if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 400 });
  return NextResponse.json({ code: r.coupon.code, discount: r.discount, description: describeCoupon(r.coupon) });
}
