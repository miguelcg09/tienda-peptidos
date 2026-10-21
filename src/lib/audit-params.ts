import { AUDIT_GROUPS } from "./audit-labels";
import { addDays, isDayKey, startOfDay } from "./period";

// Filtros de la pantalla de auditoría y de su descarga, leídos de la dirección de la página. Todo se valida:
// lo que no corresponde se ignora en vez de fallar.
export type AuditQuery = { persona?: number; tipo?: string; desde?: string; hasta?: string; q?: string };

export function parseAuditQuery(get: (k: string) => string | undefined): AuditQuery {
  const persona = Number(get("persona"));
  const tipo = get("tipo");
  const desde = get("desde");
  const hasta = get("hasta");
  const q = (get("q") ?? "").trim().slice(0, 80);
  return {
    persona: Number.isInteger(persona) && persona > 0 ? persona : undefined,
    tipo: AUDIT_GROUPS.some((g) => g.key === tipo) ? tipo : undefined,
    desde: isDayKey(desde) ? desde : undefined,
    hasta: isDayKey(hasta) ? hasta : undefined,
    q: q || undefined,
  };
}

export function auditFilter(a: AuditQuery) {
  return {
    actorId: a.persona,
    group: a.tipo,
    from: a.desde ? startOfDay(a.desde) : undefined,
    to: a.hasta ? startOfDay(addDays(a.hasta, 1)) : undefined,
    q: a.q,
  };
}

export function auditQueryString(a: AuditQuery, extra: Record<string, string> = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...a, ...extra })) if (v != null && v !== "") p.set(k, String(v));
  return p.toString();
}
