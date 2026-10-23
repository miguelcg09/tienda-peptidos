import { requirePage } from "@/lib/admin";
import { listUsers, MIN_PASSWORD, PASSWORD_PROBLEMS } from "@/lib/auth";
import { createUserAction, renameUserAction, resetPasswordAction, setUserActiveAction } from "./actions";
import { ConfirmButton } from "../ConfirmButton";
import { PasswordField } from "../PasswordField";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  usuario: "El usuario debe tener de 3 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo, y empezar con letra o número.",
  nombre: "Escribe el nombre de la persona (de 2 a 60 caracteres).",
  existe: "Ya existe una cuenta con ese usuario. Elige otro.",
  propia: "No puedes hacer eso con tu propia cuenta. Para cambiar tu clave usa «Mi cuenta».",
  ultima: "No se puede desactivar la última cuenta activa: la tienda quedaría sin acceso.",
  falta: "No se encontró esa cuenta.",
  ya: "Ya existen cuentas: ingresa con tu usuario y tu clave.",
  ...Object.fromEntries(Object.entries(PASSWORD_PROBLEMS).map(([k, v]) => [`clave-${k}`, v])),
};

const OKS: Record<string, string> = {
  creada: "Cuenta creada. Entrégale el usuario y la clave temporal; al entrar por primera vez deberá elegir una clave propia.",
  clave: "Clave temporal puesta. Se cerraron las sesiones abiertas de esa persona y deberá elegir una clave propia al entrar.",
  nombre: "Nombre actualizado.",
  desactivada: "Cuenta desactivada. Ya no puede entrar y sus sesiones abiertas se cerraron.",
  reactivada: "Cuenta reactivada.",
};

const fmtDate = (iso: string) => new Date(iso).toLocaleString("es-CL", { timeZone: "America/Santiago", dateStyle: "medium", timeStyle: "short" });
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Usuarios({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requirePage({ allowBootstrap: true });
  const sp = await searchParams;
  const error = ERRORS[one(sp.error)];
  const ok = OKS[one(sp.ok)];
  const fila = Number(one(sp.fila)) || null;
  const users = actor.bootstrap ? [] : await listUsers();
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">{actor.bootstrap ? "Crea tu cuenta" : "Equipo"}</h1>
      <p className="mt-1 text-sm text-muted">
        {actor.bootstrap
          ? "Esta será la primera cuenta del panel. Después podrás crear las del resto del equipo. Entraste con la clave de instalación; desde que exista una cuenta, esa clave deja de servir para entrar."
          : "Cada persona entra con su propio usuario y su propia clave, y todo lo que hace queda anotado en Auditoría. Todas las cuentas tienen acceso completo."}
      </p>
      {ok && <p role="status" className="mt-4 rounded-lg bg-surface-2 p-3 text-sm text-accent-2">{ok}{one(sp.u) && <> Usuario: <strong className="font-mono">{one(sp.u)}</strong>.</>}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

      {!actor.bootstrap && (
        <ul className="mt-8 space-y-3">
          {users.map((u) => {
            const me = u.id === actor.id;
            return (
              <li key={u.id} className={`rounded-2xl border bg-surface p-5 ${u.active ? "" : "opacity-80"}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">{u.name}</span>
                  <span className="font-mono text-sm text-muted">@{u.username}</span>
                  {me && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-accent-2">tú</span>}
                  {!u.active && <span className="rounded-full bg-tint/10 px-2 py-0.5 text-xs font-medium text-muted">desactivada</span>}
                  {u.active && u.mustChange && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">aún no cambia su clave</span>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  Creada el {fmtDate(u.createdAt)} · {u.lastLoginAt ? `Último ingreso: ${fmtDate(u.lastLoginAt)}` : "Todavía no ha ingresado"}
                </p>
                {!me && (
                  <div className="mt-3 flex flex-wrap items-start gap-x-2 gap-y-1 text-sm">
                    {u.active && (
                      <>
                        <details open={fila === u.id} className="w-full sm:w-auto">
                          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center px-3 text-accent-2 hover:underline">Cambiar nombre</summary>
                          <form action={renameUserAction.bind(null, u.id)} className="mt-2 flex flex-wrap items-end gap-2">
                            <label className="text-sm">Nombre<input name="nombre" defaultValue={u.name} required minLength={2} maxLength={60} className="field" /></label>
                            <button className="btn-ghost text-sm">Guardar</button>
                          </form>
                        </details>
                        <details open={fila === u.id && one(sp.error).startsWith("clave")} className="w-full sm:w-auto">
                          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center px-3 text-accent-2 hover:underline">Poner clave temporal</summary>
                          <form action={resetPasswordAction.bind(null, u.id)} className="mt-2 grid max-w-sm gap-2">
                            <PasswordField label={`Clave temporal para ${u.name}`} suggestable />
                            <p className="text-xs text-muted">Se cerrarán sus sesiones abiertas y tendrá que elegir una clave propia al entrar.</p>
                            <button className="btn-ghost justify-self-start text-sm">Guardar clave temporal</button>
                          </form>
                        </details>
                      </>
                    )}
                    <form action={setUserActiveAction.bind(null, u.id, !u.active)}>
                      {u.active ? (
                        <ConfirmButton message={`¿Desactivar la cuenta de ${u.name}? No podrá entrar y se cerrarán sus sesiones abiertas. Su historial en Auditoría se conserva.`} className="inline-flex min-h-10 items-center px-3 text-red-700 hover:underline dark:text-red-300">
                          Desactivar
                        </ConfirmButton>
                      ) : (
                        <button className="inline-flex min-h-10 items-center px-3 text-accent-2 hover:underline">Reactivar</button>
                      )}
                    </form>
                  </div>
                )}
                {me && <p className="mt-3 text-xs text-muted">Tu nombre y tu clave se cambian en «Mi cuenta» (arriba a la derecha).</p>}
              </li>
            );
          })}
        </ul>
      )}

      <form action={createUserAction} className="mt-10 grid gap-4 rounded-2xl border bg-surface p-5">
        <h2 className="font-display text-xl font-bold">{actor.bootstrap ? "Tu cuenta" : "Agregar una persona"}</h2>
        <label className="text-sm">
          Nombre
          <input name="nombre" defaultValue={one(sp.n)} required minLength={2} maxLength={60} autoComplete="off" placeholder="Camila Rojas" className="field" />
        </label>
        <label className="text-sm">
          Usuario
          <input name="usuario" defaultValue={one(sp.u)} required minLength={3} maxLength={30} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="camila" className="field" />
          <span className="mt-1 block text-xs text-muted">Con este nombre entrará al panel. Minúsculas, números, punto o guion.</span>
        </label>
        <PasswordField label={actor.bootstrap ? "Tu clave" : "Clave temporal"} suggestable={!actor.bootstrap} />
        <p className="text-xs text-muted">
          Mínimo {MIN_PASSWORD} caracteres. Una frase larga sirve más que una palabra con símbolos.
          {!actor.bootstrap && " La persona deberá cambiarla la primera vez que entre."}
        </p>
        <button className="btn-primary justify-self-start text-sm">{actor.bootstrap ? "Crear mi cuenta y entrar" : "Crear cuenta"}</button>
      </form>
      {!actor.bootstrap && <p className="mt-4 text-xs text-muted">{activeCount} {activeCount === 1 ? "cuenta activa" : "cuentas activas"}.</p>}
    </div>
  );
}
