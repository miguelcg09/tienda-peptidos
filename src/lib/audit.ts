import "server-only";
import { query } from "./db";
import type { Actor } from "./auth";

// Registro de auditoría: quién hizo qué y cuándo en el panel. Solo se agrega; no hay forma de editarlo ni borrarlo
// desde el panel. Si anotar falla, la acción del panel igual se completa (queda el error en el registro del servidor).

export type AuditEntry = {
  id: number;
  at: string;
  actorId: number | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  details: unknown;
};

type Row = {
  id: number;
  at: string | Date;
  actor_id: number | null;
  actor_name: string;
  action: string;
  entity: string;
  entity_id: string;
  summary: string;
  details: unknown;
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export async function logAudit(
  actor: Pick<Actor, "id" | "name">,
  action: string,
  what: { entity?: string; entityId?: string; summary: string; details?: unknown },
) {
  try {
    await query(
      `INSERT INTO audit_log (actor_id, actor_name, action, entity, entity_id, summary, details) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [actor.id, actor.name, action, what.entity ?? "", clip(what.entityId ?? "", 80), clip(what.summary, 400), what.details === undefined ? null : JSON.stringify(what.details)],
    );
  } catch (err) {
    console.error("No se pudo anotar en la auditoría", err);
  }
}

export type AuditFilter = {
  from?: Date;
  to?: Date; // exclusivo
  actorId?: number | null;
  group?: string; // prefijo de la acción (producto, pedido…)
  q?: string;
};

function where(f: AuditFilter) {
  const conds: string[] = [];
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };
  if (f.from) conds.push(`at >= ${p(f.from.toISOString())}`);
  if (f.to) conds.push(`at < ${p(f.to.toISOString())}`);
  if (f.actorId != null) conds.push(`actor_id = ${p(f.actorId)}`);
  if (f.group) {
    const g = p(f.group);
    conds.push(`(action = ${g} OR action LIKE ${g} || '.%')`);
  }
  if (f.q) {
    const q = p(`%${f.q.replace(/[%_\\]/g, "\\$&")}%`);
    conds.push(`(summary ILIKE ${q} OR entity_id ILIKE ${q} OR actor_name ILIKE ${q})`);
  }
  return { sql: conds.length ? `WHERE ${conds.join(" AND ")}` : "", params };
}

const toEntry = (r: Row): AuditEntry => ({
  id: Number(r.id),
  at: new Date(r.at).toISOString(),
  actorId: r.actor_id == null ? null : Number(r.actor_id),
  actorName: r.actor_name,
  action: r.action,
  entity: r.entity,
  entityId: r.entity_id,
  summary: r.summary,
  details: typeof r.details === "string" ? safeParse(r.details) : r.details,
});

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export async function listAudit(f: AuditFilter, limit: number, offset = 0) {
  const w = where(f);
  const rows = await query<Row>(`SELECT * FROM audit_log ${w.sql} ORDER BY at DESC, id DESC LIMIT ${Math.max(1, Math.min(limit, 50000))} OFFSET ${Math.max(0, offset)}`, w.params);
  return rows.map(toEntry);
}

export async function countAudit(f: AuditFilter) {
  const w = where(f);
  const [r] = await query<{ n: number | string }>(`SELECT count(*)::int AS n FROM audit_log ${w.sql}`, w.params);
  return Number(r?.n ?? 0);
}
