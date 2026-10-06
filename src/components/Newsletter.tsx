"use client";

import { useId, useState, type CSSProperties } from "react";

const FALLBACK = "No pudimos guardar tu correo. Revisa que esté bien escrito e inténtalo de nuevo.";

// Formulario de correo reutilizable: boletín (pie de página, cierre) o "avísame cuando vuelva" (ficha agotada).
// tone "field": para usarlo sobre un fondo de color, donde los mensajes toman el color del texto del fondo.
export function Newsletter({
  source = "boletin",
  product,
  placeholder = "tu@correo.cl",
  cta = "Suscribirme",
  done = "Listo. Te avisaremos por correo.",
  compact = false,
  testId,
  tone = "surface",
  buttonStyle,
}: {
  source?: "boletin" | "stock";
  product?: string;
  placeholder?: string;
  cta?: string;
  done?: string;
  compact?: boolean;
  testId?: string;
  tone?: "surface" | "field";
  buttonStyle?: CSSProperties;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const uid = useId();

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
      if (!r.ok) throw new Error(data.error ?? FALLBACK);
      setState("ok");
      setMsg(done);
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : FALLBACK);
    }
  }

  const field = tone === "field";
  return (
    <div>
      {state !== "ok" && (
        <form onSubmit={submit} className={`flex ${compact ? "gap-2" : "flex-wrap gap-2"}`} data-testid={testId ?? `suscribir-${source}`}>
          <label htmlFor={`${uid}-correo`} className="sr-only">Correo electrónico</label>
          <input
            id={`${uid}-correo`}
            type="email"
            required
            autoComplete="email"
            aria-describedby={state === "error" ? `${uid}-estado` : undefined}
            aria-invalid={state === "error" || undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="field mt-0 min-h-11 min-w-0 flex-1"
          />
          <button
            disabled={state === "busy"}
            style={buttonStyle}
            className={`${buttonStyle ? "inline-flex min-h-11 shrink-0 items-center rounded-btn px-5 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-60" : "btn-primary shrink-0 text-sm"}`}
          >
            {state === "busy" ? "Guardando…" : cta}
          </button>
        </form>
      )}
      {/* Región de estado siempre presente: así los lectores de pantalla anuncian el resultado */}
      <p
        id={`${uid}-estado`}
        role="status"
        aria-live="polite"
        className={state === "idle" || state === "busy" ? "sr-only" : `mt-2 text-sm ${field ? "font-medium" : state === "error" ? "text-red-700 dark:text-red-300" : "text-fg"}`}
      >
        {state === "ok" || state === "error" ? msg : ""}
      </p>
    </div>
  );
}
