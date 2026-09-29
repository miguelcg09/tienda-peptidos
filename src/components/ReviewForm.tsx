"use client";

import { useState } from "react";

export type Reviewable = { slug: string; name: string; done: boolean };

function One({ orden, email, item }: { orden: string; email: string; item: Reviewable }) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">(item.done ? "ok" : "idle");
  const [msg, setMsg] = useState(item.done ? "Ya dejaste tu reseña de este producto. Gracias." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setState("error"); setMsg("Elige de 1 a 5 estrellas."); return; }
    setState("busy");
    try {
      const r = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orden, email, product: item.slug, rating, body }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(data.error ?? "No pudimos guardar tu reseña");
      setState("ok");
      setMsg("¡Gracias! Revisamos las reseñas antes de publicarlas.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "No pudimos guardar tu reseña");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border bg-surface p-4" data-testid={`resena-${item.slug}`}>
      <p className="font-semibold">{item.name}</p>
      {state === "ok" ? (
        <p className="mt-2 text-sm text-accent" role="status">{msg}</p>
      ) : (
        <>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label={`Valoración de ${item.name}`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                onClick={() => setRating(n)}
                className={`text-3xl leading-none transition hover:scale-110 ${n <= rating ? "text-accent-2" : "text-tint/20"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={800}
            rows={3}
            placeholder="Cuéntanos del pedido, el envío y la calidad del producto como reactivo (opcional)"
            className="field"
            aria-label={`Comentario sobre ${item.name}`}
          />
          <p className="mt-1 text-xs text-muted">No describas usos en personas ni animales: esas reseñas no se publican.</p>
          {state === "error" && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{msg}</p>}
          <button disabled={state === "busy"} className="btn-primary mt-3 text-sm">{state === "busy" ? "Enviando…" : "Enviar reseña"}</button>
        </>
      )}
    </form>
  );
}

export function ReviewForm({ orden, email, items }: { orden: string; email: string; items: Reviewable[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => <One key={it.slug} orden={orden} email={email} item={it} />)}
    </div>
  );
}
