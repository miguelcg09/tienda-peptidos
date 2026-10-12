"use client";

import { useSearchParams } from "next/navigation";

// Mensaje de la pantalla de acceso: el servidor redirige con ?error=1 (clave incorrecta) o ?error=espera.
export function LoginNotice() {
  const error = useSearchParams().get("error");
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200">
      {error === "espera" ? "Demasiados intentos. Espera unos minutos antes de volver a probar." : "La clave no es correcta. Revisa que esté bien escrita."}
    </p>
  );
}
