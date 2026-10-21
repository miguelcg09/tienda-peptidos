import { NextResponse } from "next/server";
import { sessionToken, passwordMatches } from "@/lib/admin";
import { tooManyRequests } from "@/lib/rate-limit";

// Recibe la clave del formulario y, si es correcta, deja una cookie por 30 días.
export async function POST(req: Request) {
  const url = new URL("/admin", req.url);
  if (tooManyRequests(req, "admin-entrar", 8, 10 * 60_000)) {
    url.searchParams.set("error", "espera");
    return NextResponse.redirect(url, 303);
  }
  const form = await req.formData().catch(() => null);
  const clave = String(form?.get("clave") ?? "");
  if (!passwordMatches(clave)) {
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(new URL("/admin/pedidos", req.url), 303);
  res.cookies.set("admin", sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
