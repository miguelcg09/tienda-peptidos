"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  espera: "Demasiados intentos. Espera unos minutos antes de volver a probar.",
  config: "Falta configurar ADMIN_PASSWORD en el servidor para poder crear la primera cuenta.",
  "1": "El usuario o la clave no son correctos. Revisa que estén bien escritos.",
};

// Mensaje de la pantalla de acceso: el servidor redirige con ?error=1, ?error=espera o ?error=config.
export function LoginNotice() {
  const error = useSearchParams().get("error");
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200">
      {messages[error] ?? messages["1"]}
    </p>
  );
}
