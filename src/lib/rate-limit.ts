import "server-only";

// Límite de intentos por visitante, en memoria. En un servidor sin estado (Vercel) cada instancia lleva su
// propia cuenta, así que no es una barrera absoluta, pero frena el uso automatizado: probar cupones o claves
// a ritmo de máquina, o llenar el boletín y los pedidos de basura.
const hits = new Map<string, { n: number; reset: number }>();

function clientId(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "local";
}

// true si este visitante ya superó `max` intentos de `scope` en la ventana de `windowMs`.
// `who` permite contar por otra clave que la IP (por ejemplo, por nombre de usuario).
export function tooManyRequests(req: Request, scope: string, max: number, windowMs: number, who?: string) {
  if (process.env.RATE_LIMIT_OFF) return false; // solo para las pruebas automáticas
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const key = `${scope}:${who ?? clientId(req)}`;
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  cur.n += 1;
  return cur.n > max;
}
