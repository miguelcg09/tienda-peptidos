import { NextResponse } from "next/server";
import { addSubscriber, isEmail } from "@/lib/subscribers";
import { getProduct } from "@/lib/catalog";
import { isRecord, text } from "@/lib/validate";
import { tooManyRequests } from "@/lib/rate-limit";

const sources = ["boletin", "stock"] as const;

// Guarda un correo del boletín o de "avísame cuando vuelva" (ficha de producto agotado).
export async function POST(req: Request) {
  if (tooManyRequests(req, "suscribir", 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." }, { status: 429 });
  }
  const body: unknown = await req.json().catch(() => null);
  const b = isRecord(body) ? body : {};
  const email = text(b.email, 254) ?? "";
  if (!isEmail(email)) return NextResponse.json({ error: "Escribe un correo válido" }, { status: 400 });
  const source = sources.includes(b.source as (typeof sources)[number]) ? (b.source as string) : "boletin";
  let product = "";
  if (source === "stock") {
    const slug = text(b.product, 120);
    const p = slug ? await getProduct(slug) : null;
    if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 400 });
    product = p.slug;
  }
  const created = await addSubscriber(email, source, product);
  return NextResponse.json({ ok: true, created });
}
