"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  countActiveUsers,
  createUser,
  currentToken,
  endSession,
  endUserSessions,
  getUser,
  normalizeUsername,
  passwordProblem,
  sessionCookieOptions,
  SESSION_COOKIE,
  setUserActive,
  setUserName,
  setUserPassword,
  startSession,
  touchLogin,
  USERNAME_RE,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { personName } from "@/lib/validate";

const back = (params: Record<string, string>): never => {
  redirect(`/admin/usuarios?${new URLSearchParams(params)}`);
};

// Crear una cuenta. Con la sesión de instalación es la primera: queda lista para usar y la sesión pasa a ser suya.
// Las siguientes las crea alguien del equipo con una clave temporal que la persona cambia al entrar.
export async function createUserAction(formData: FormData) {
  const actor = await requireAdmin({ allowBootstrap: true });
  const username = normalizeUsername(String(formData.get("usuario") ?? ""));
  const name = personName(formData.get("nombre"));
  const password = String(formData.get("clave") ?? "");
  const keep = { u: username.slice(0, 30), n: String(formData.get("nombre") ?? "").slice(0, 60) };

  if (!USERNAME_RE.test(username)) back({ ...keep, error: "usuario" });
  if (!name) back({ ...keep, error: "nombre" });
  const problem = passwordProblem(password, username);
  if (problem) back({ ...keep, error: `clave-${problem}` });

  const first = actor.bootstrap;
  if (first && (await countActiveUsers()) > 0) back({ error: "ya" });
  const user = await createUser({ username, name: name!, password, mustChange: !first });
  if (!user) back({ ...keep, error: "existe" });

  if (first) {
    const token = await currentToken();
    const session = await startSession(user!.id);
    if (token) await endSession(token);
    await touchLogin(user!.id);
    (await cookies()).set(SESSION_COOKIE, session.token, sessionCookieOptions(session.maxAge));
  }
  await logAudit(first ? { id: user!.id, name: user!.name } : actor, "usuario.crear", {
    entity: "usuario",
    entityId: username,
    summary: first ? `Creó la primera cuenta del panel: ${user!.name} (@${username})` : `Creó la cuenta de ${user!.name} (@${username})`,
  });
  revalidatePath("/admin", "layout");
  redirect(first ? "/admin/ventas?bienvenida=1" : `/admin/usuarios?ok=creada&u=${encodeURIComponent(username)}`);
}

export async function renameUserAction(id: number, formData: FormData) {
  const actor = await requireAdmin();
  const name = personName(formData.get("nombre"));
  if (!name) back({ error: "nombre", fila: String(id) });
  const user = await getUser(id);
  if (!user) back({ error: "falta" });
  if (user!.name !== name) {
    await setUserName(id, name!);
    await logAudit(actor, "usuario.nombre", { entity: "usuario", entityId: user!.username, summary: `Cambió el nombre de @${user!.username}: «${user!.name}» → «${name}»` });
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/usuarios?ok=nombre");
}

// Poner una clave temporal a otra persona (por ejemplo, si la olvidó). Sus sesiones abiertas se cierran y debe cambiarla al entrar.
export async function resetPasswordAction(id: number, formData: FormData) {
  const actor = await requireAdmin();
  if (id === actor.id) back({ error: "propia" });
  const user = await getUser(id);
  if (!user) back({ error: "falta" });
  const password = String(formData.get("clave") ?? "");
  const problem = passwordProblem(password, user!.username);
  if (problem) back({ error: `clave-${problem}`, fila: String(id) });
  await setUserPassword(id, password, true);
  await endUserSessions(id);
  await logAudit(actor, "usuario.reiniciar_clave", { entity: "usuario", entityId: user!.username, summary: `Puso una clave temporal a ${user!.name} (@${user!.username})` });
  redirect(`/admin/usuarios?ok=clave&u=${encodeURIComponent(user!.username)}`);
}

export async function setUserActiveAction(id: number, active: boolean) {
  const actor = await requireAdmin();
  if (id === actor.id) back({ error: "propia" });
  const user = await getUser(id);
  if (!user) back({ error: "falta" });
  if (user!.active === active) redirect("/admin/usuarios");
  const done = await setUserActive(id, active);
  if (!done) back({ error: "ultima" });
  await logAudit(actor, active ? "usuario.reactivar" : "usuario.desactivar", {
    entity: "usuario",
    entityId: user!.username,
    summary: active ? `Reactivó la cuenta de ${user!.name} (@${user!.username})` : `Desactivó la cuenta de ${user!.name} (@${user!.username})`,
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/usuarios?ok=${active ? "reactivada" : "desactivada"}`);
}
