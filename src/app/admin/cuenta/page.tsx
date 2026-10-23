import { requirePage } from "@/lib/admin";
import { MIN_PASSWORD, PASSWORD_PROBLEMS } from "@/lib/auth";
import { PasswordField } from "../PasswordField";
import { changeOwnPasswordAction, renameSelfAction } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  actual: "La clave actual no es correcta.",
  repetir: "Las dos claves nuevas no son iguales.",
  igual: "La clave nueva debe ser distinta de la actual.",
  nombre: "Escribe tu nombre (de 2 a 60 caracteres).",
  espera: "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.",
  falta: "Esta sesión no tiene una cuenta propia.",
  ...Object.fromEntries(Object.entries(PASSWORD_PROBLEMS).map(([k, v]) => [`clave-${k}`, v])),
};
const OKS: Record<string, string> = { clave: "Clave cambiada. Se cerraron tus otras sesiones abiertas.", nombre: "Nombre actualizado." };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Cuenta({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requirePage({ allowMustChange: true });
  const sp = await searchParams;
  const error = ERRORS[one(sp.error)];
  const ok = OKS[one(sp.ok)];

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-bold">{actor.mustChange ? "Elige tu clave" : "Mi cuenta"}</h1>
      <p className="mt-1 text-sm text-muted">
        {actor.mustChange
          ? `Hola, ${actor.name}. La clave con la que entraste es temporal: elige una propia para usar el panel.`
          : `Usuario: ${actor.username}. Todo lo que haces en el panel queda anotado con tu nombre.`}
      </p>
      {ok && <p role="status" className="mt-4 rounded-lg bg-surface-2 p-3 text-sm text-accent-2">{ok}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

      <form action={changeOwnPasswordAction} className="mt-8 grid gap-4 rounded-2xl border bg-surface p-5">
        <h2 className="font-display text-xl font-bold">Cambiar mi clave</h2>
        <PasswordField name="actual" label="Clave actual" autoComplete="current-password" minLength={1} />
        <PasswordField name="nueva" label="Clave nueva" />
        <PasswordField name="repetir" label="Repite la clave nueva" />
        <p className="text-xs text-muted">Mínimo {MIN_PASSWORD} caracteres. Una frase larga que solo tú recuerdes es mejor que una palabra con símbolos. Al cambiarla se cierran tus otras sesiones abiertas.</p>
        <button className="btn-primary justify-self-start text-sm">Guardar clave</button>
      </form>

      {!actor.mustChange && (
        <form action={renameSelfAction} className="mt-6 grid gap-3 rounded-2xl border bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Mi nombre</h2>
          <label className="text-sm">Nombre que se muestra en el registro<input name="nombre" defaultValue={actor.name} required minLength={2} maxLength={60} className="field" /></label>
          <button className="btn-ghost justify-self-start text-sm">Guardar nombre</button>
        </form>
      )}
    </div>
  );
}
