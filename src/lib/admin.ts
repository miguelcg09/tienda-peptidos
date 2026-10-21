import "server-only";
import { redirect } from "next/navigation";
import { currentActor, type Actor } from "./auth";

export type { Actor };

// Acceso al panel. Hay tres tipos de sesión:
// - persona con cuenta (lo normal);
// - persona con cuenta que debe cambiar la clave que le dieron (solo ve /admin/cuenta);
// - sesión de instalación (clave ADMIN_PASSWORD, solo mientras no existe ninguna cuenta; solo ve /admin/usuarios
//   para crear la primera cuenta).
export type AccessOptions = { allowMustChange?: boolean; allowBootstrap?: boolean };

const allowed = (a: Actor, o: AccessOptions) => (!a.mustChange || o.allowMustChange) && (!a.bootstrap || o.allowBootstrap);

// ¿Hay una persona con acceso completo al panel?
export async function isAdmin() {
  const a = await currentActor();
  return Boolean(a && allowed(a, {}));
}

// Cada página del panel debe llamar a esto ANTES de leer datos. No basta con revisar la sesión en el layout:
// Next prepara la página en paralelo con el layout, y sus datos viajan en la respuesta aunque el layout muestre
// solo el formulario de ingreso.
export async function requirePage(options: AccessOptions = {}): Promise<Actor> {
  const a = await currentActor();
  if (!a) redirect("/admin");
  if (a.bootstrap && !options.allowBootstrap) redirect("/admin/usuarios");
  if (a.mustChange && !options.allowMustChange) redirect("/admin/cuenta");
  return a;
}

// Para acciones del servidor: devuelve quién la ejecuta (para el registro de auditoría) o corta con un error.
export async function requireAdmin(options: AccessOptions = {}): Promise<Actor> {
  const a = await currentActor();
  if (!a || !allowed(a, options)) throw new Error("No autorizado");
  return a;
}

// Para rutas de descarga: devuelve la persona o null (la ruta responde 401).
export async function adminOrNull(): Promise<Actor | null> {
  const a = await currentActor();
  return a && allowed(a, {}) ? a : null;
}
