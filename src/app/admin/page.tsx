import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { LoginNotice } from "./LoginNotice";

export const dynamic = "force-dynamic";

// Pantalla de ingreso. Con la sesión abierta lleva directo a los pedidos.
export default async function AdminEntrada() {
  if (await isAdmin()) redirect("/admin/pedidos");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Acceso privado</h1>
      <p className="mt-3 text-sm text-muted">
        {process.env.ADMIN_PASSWORD ? "Escribe la clave de administrador." : "Configura ADMIN_PASSWORD para habilitar la administración."}
      </p>
      <form method="post" action="/admin/entrar" className="mt-6 flex gap-2">
        <label htmlFor="clave" className="sr-only">Clave de administrador</label>
        <input id="clave" name="clave" type="password" placeholder="Clave" autoComplete="current-password" autoFocus className="field mt-0" />
        <button className="btn-primary text-sm">Entrar</button>
      </form>
      <Suspense><LoginNotice /></Suspense>
    </div>
  );
}
