"use client";

import { useState } from "react";

// Formulario de correo reutilizable: boletín (pie de página) o "avísame cuando vuelva" (ficha agotada).
export function Newsletter({
  source = "boletin",
  product,
  placeholder = "tu@correo.cl",
  cta = "Suscribirme",
  done = "¡Listo! Te avisaremos por correo.",
  compact = false,
}: {
  source?: "boletin" | "stock";
  product?: string;
  placeholder?: string;
  cta?: string;
  done?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const r = await fetch("/api/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, product }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(data.error ?? "No pudimos guardar tu correo");
      setState("ok");
      setMsg(done);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "No pudimos guardar tu correo");
    }
  }

  if (state === "ok") return <p className="text-sm text-accent" role="status">{msg}</p>;

  return (
    <form onSubmit={submit} className={`flex ${compact ? "gap-2" : "flex-wrap gap-2"}`} data-testid={`suscribir-${source}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label="Correo electrónico"
        className="field mt-0 min-w-0 flex-1"
      />
      <button disabled={state === "busy"} className="btn-primary shrink-0 text-sm">{state === "busy" ? "Guardando…" : cta}</button>
      {state === "error" && <p className="basis-full text-xs text-red-600 dark:text-red-300">{msg}</p>}
    </form>
  );
}
