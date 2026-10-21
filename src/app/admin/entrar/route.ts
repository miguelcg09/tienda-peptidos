import { NextResponse } from "next/server";
import {
  burnPasswordCheck,
  countActiveUsers,
  getUserRowByUsername,
  installPasswordMatches,
  normalizeUsername,
  sessionCookieOptions,
  SESSION_COOKIE,
  startSession,
  touchLogin,
  verifyPassword,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { tooManyRequests } from "@/lib/rate-limit";

// Ingreso al panel. Con cuentas creadas se pide usuario y clave propios. Mientras no exista ninguna cuenta, la
// clave de instalación (ADMIN_PASSWORD) abre una sesión que solo sirve para crear la primera.
export async function POST(req: Request) {
  const back = (error: string) => {
    const url = new URL("/admin", req.url);
    url.searchParams.set("error", error);
    return NextResponse.redirect(url, 303);
  };
  if (tooManyRequests(req, "admin-entrar", 12, 10 * 60_000)) return back("espera");

  const form = await req.formData().catch(() => null);
  const usuario = normalizeUsername(String(form?.get("usuario") ?? "")).slice(0, 60);
  const clave = String(form?.get("clave") ?? "").slice(0, 300);
  // Además del límite por visitante, cada cuenta admite pocos intentos seguidos (frena claves probadas desde varios lugares).
  if (usuario && tooManyRequests(req, "admin-entrar-usuario", 6, 10 * 60_000, usuario)) return back("espera");

  let token: string;
  let maxAge: number;
  if ((await countActiveUsers()) === 0) {
    if (!process.env.ADMIN_PASSWORD) return back("config");
    if (!installPasswordMatches(clave)) return back("1");
    ({ token, maxAge } = await startSession(null));
  } else {
    const row = usuario ? await getUserRowByUsername(usuario) : null;
    const ok = row && row.active ? await verifyPassword(row.password_hash, clave) : (await burnPasswordCheck(clave), false);
    if (!row || !row.active || !ok) {
      if (row?.active) await logAudit({ id: Number(row.id), name: row.name }, "ingreso.fallido", { entity: "usuario", entityId: row.username, summary: `Intento de ingreso con clave incorrecta (@${row.username})` });
      return back("1");
    }
    await touchLogin(Number(row.id));
    ({ token, maxAge } = await startSession(Number(row.id)));
    await logAudit({ id: Number(row.id), name: row.name }, "ingreso", { entity: "usuario", entityId: row.username, summary: `Ingresó al panel (@${row.username})` });
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
  res.cookies.delete({ name: "admin", path: "/admin" }); // cookie de la versión anterior (clave única)
  return res;
}
