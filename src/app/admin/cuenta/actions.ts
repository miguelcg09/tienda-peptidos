"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { currentToken, endUserSessions, getUserRowByUsername, passwordProblem, setUserName, setUserPassword, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { tooManyRequests } from "@/lib/rate-limit";
import { personName } from "@/lib/validate";
import { headers } from "next/headers";

const back = (error: string): never => redirect(`/admin/cuenta?error=${error}`);

// Cambiar la propia clave. Se pide la actual (si alguien deja el computador abierto no puede cambiarla), las demás
// sesiones de esta cuenta se cierran y deja de ser «clave temporal».
export async function changeOwnPasswordAction(formData: FormData) {
  const actor = await requireAdmin({ allowMustChange: true });
  if (actor.id == null) back("falta");
  const current = String(formData.get("actual") ?? "");
  const next = String(formData.get("nueva") ?? "");
  const again = String(formData.get("repetir") ?? "");

  // Evita probar claves actuales a ritmo de máquina desde una sesión robada.
  const h = await headers();
  const req = new Request("http://local/", { headers: { "x-forwarded-for": h.get("x-forwarded-for") ?? "", "x-real-ip": h.get("x-real-ip") ?? "" } });
  if (tooManyRequests(req, "admin-clave", 8, 10 * 60_000, actor.username)) back("espera");

  const row = await getUserRowByUsername(actor.username);
  if (!row || !(await verifyPassword(row.password_hash, current))) back("actual");
  if (next !== again) back("repetir");
  const problem = passwordProblem(next, actor.username);
  if (problem) back(`clave-${problem}`);
  if (await verifyPassword(row!.password_hash, next)) back("igual");

  await setUserPassword(actor.id!, next, false);
  const token = await currentToken();
  await endUserSessions(actor.id!, token ?? undefined);
  await logAudit(actor, "clave.cambiar", { entity: "usuario", entityId: actor.username, summary: `Cambió su propia clave (@${actor.username})` });
  revalidatePath("/admin", "layout");
  redirect("/admin/cuenta?ok=clave");
}

export async function renameSelfAction(formData: FormData) {
  const actor = await requireAdmin();
  if (actor.id == null) back("falta");
  const name = personName(formData.get("nombre"));
  if (!name) back("nombre");
  if (name !== actor.name) {
    await setUserName(actor.id!, name!);
    await logAudit(actor, "usuario.nombre", { entity: "usuario", entityId: actor.username, summary: `Cambió su nombre: «${actor.name}» → «${name}»` });
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/cuenta?ok=nombre");
}
