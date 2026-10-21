import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// La cookie de sesión guarda una firma derivada de la clave, no la clave misma: si alguien ve la cookie
// (copia del navegador, soporte técnico) no obtiene la clave real. Cambiar ADMIN_PASSWORD cierra todas
// las sesiones abiertas.
export function sessionToken() {
  return createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update("helix-admin-session-v1").digest("hex");
}

const digest = (s: string) => createHash("sha256").update(s).digest();

// Comparación de tiempo constante (no revela cuántas letras coinciden).
export function passwordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return timingSafeEqual(digest(input), digest(password));
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const cookie = (await cookies()).get("admin")?.value;
  if (!cookie) return false;
  return timingSafeEqual(digest(cookie), digest(sessionToken()));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

// Cada página del panel debe llamar a esto ANTES de leer datos. No basta con revisar la sesión en el layout:
// Next prepara la página en paralelo con el layout, y sus datos viajan en la respuesta aunque el layout muestre
// solo el formulario de ingreso.
export async function requirePage() {
  if (!(await isAdmin())) redirect("/admin");
}
