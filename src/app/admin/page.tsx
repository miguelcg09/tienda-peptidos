import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentActor, countActiveUsers } from "@/lib/auth";
import { LoginNotice } from "./LoginNotice";

export const dynamic = "force-dynamic";

// Pantalla de ingreso. Con una sesión abierta lleva a donde corresponde.
export default async function AdminEntrada() {
  const actor = await currentActor();
  if (actor) {
    if (actor.bootstrap) redirect("/admin/usuarios");
    if (actor.mustChange) redirect("/admin/cuenta");
    redirect("/admin/ventas");
  }
  const hasUsers = (await countActiveUsers()) > 0;
  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-center font-display text-2xl font-bold">Acceso privado</h1>
      <p className="mt-3 text-center text-sm text-muted">
        {hasUsers
          ? "Ingresa con tu usuario y tu clave."
          : "Primera vez: escribe la clave de instalación (ADMIN_PASSWORD) para crear tu cuenta y las del equipo."}
      </p>
      <form method="post" action="/admin/entrar" className="mt-6 grid gap-3">
        {hasUsers && (
          <label className="text-sm">
            Usuario
            <input name="usuario" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus maxLength={60} className="field" />
          </label>
        )}
        <label className="text-sm">
          {hasUsers ? "Clave" : "Clave de instalación"}
          <input name="clave" type="password" autoComplete={hasUsers ? "current-password" : "off"} required maxLength={300} autoFocus={!hasUsers} className="field" />
        </label>
        <button className="btn-primary text-sm">Entrar</button>
      </form>
      <Suspense><LoginNotice /></Suspense>
    </div>
  );
}
