import { NextResponse } from "next/server";
import { addSubscriber, isEmail } from "@/lib/subscribers";
import { getProduct } from "@/lib/catalog";

const sources = ["boletin", "stock"] as const;

// Guarda un correo del boletín o de "avísame cuando vuelva" (ficha de producto agotado).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; source?: string; product?: string };
  const email = body.email?.trim() ?? "";
  if (!isEmail(email)) return NextResponse.json({ error: "Escribe un correo válido" }, { status: 400 });
  const source = sources.includes(body.source as (typeof sources)[number]) ? (body.source as string) : "boletin";
  let product = "";
  if (source === "stock") {
    const p = body.product ? await getProduct(body.product) : null;
    if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });
    product = p.slug;
  }
  const created = await addSubscriber(email, source, product);
  return NextResponse.json({ ok: true, created });
}
