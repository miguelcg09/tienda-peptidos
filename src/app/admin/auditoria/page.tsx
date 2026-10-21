import Link from "next/link";
import { requirePage } from "@/lib/admin";
import { listUsers } from "@/lib/auth";
import { countAudit, listAudit } from "@/lib/audit";
import { actionLabel, AUDIT_GROUPS } from "@/lib/audit-labels";
import { auditFilter, auditQueryString, parseAuditQuery } from "@/lib/audit-params";
import { dayKey, stamp } from "@/lib/period";

export const dynamic = "force-dynamic";

const PAGE = 50;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function Details({ value }: { value: unknown }) {
  if (value == null || value === "") return null;
  const list = Array.isArray(value) && value.every((v) => typeof v === "string");
  return (
    <details className="mt-1 text-xs">
      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center text-accent hover:underline">Ver detalle</summary>
      {list ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">{(value as string[]).map((c, i) => <li key={i} className="break-words">{c}</li>)}</ul>
      ) : (
        <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-tint/5 p-3 text-muted">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
      )}
    </details>
  );
}

export default async function Auditoria({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePage();
  const sp = await searchParams;
  const query = parseAuditQuery((k) => one(sp[k]));
  const filter = auditFilter(query);
  const page = Math.max(1, Math.floor(Number(one(sp.p))) || 1);
  const [users, total] = await Promise.all([listUsers(), countAudit(filter)]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const current = Math.min(page, pages);
  const entries = await listAudit(filter, PAGE, (current - 1) * PAGE);
  const today = dayKey(new Date());
  const filtered = Object.values(query).some((v) => v != null);
  const link = (p: number) => `/admin/auditoria?${auditQueryString(query, p > 1 ? { p: String(p) } : {})}`;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Auditoría</h1>
      <p className="mt-1 text-sm text-muted">Quién hizo qué y cuándo en el panel. Este registro solo se agrega: nadie puede editarlo ni borrarlo desde aquí. Hora de Chile.</p>

      <form method="get" action="/admin/auditoria" className="mt-6 grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm">Persona
          <select name="persona" defaultValue={query.persona ? String(query.persona) : ""} className="field">
            <option value="" className="bg-surface">Todas</option>
            {users.map((u) => <option key={u.id} value={u.id} className="bg-surface">{u.name}{u.active ? "" : " (desactivada)"}</option>)}
          </select>
        </label>
        <label className="text-sm">Tipo de acción
          <select name="tipo" defaultValue={query.tipo ?? ""} className="field">
            <option value="" className="bg-surface">Todas</option>
            {AUDIT_GROUPS.map((g) => <option key={g.key} value={g.key} className="bg-surface">{g.label}</option>)}
          </select>
        </label>
        <label className="text-sm">Buscar
          <input name="q" defaultValue={query.q ?? ""} maxLength={80} placeholder="Pedido, producto, cupón…" className="field" />
        </label>
        <label className="text-sm">Desde<input type="date" name="desde" defaultValue={query.desde ?? ""} max={today} className="field" /></label>
        <label className="text-sm">Hasta<input type="date" name="hasta" defaultValue={query.hasta ?? ""} max={today} className="field" /></label>
        <div className="flex items-end gap-2">
          <button className="btn-primary text-sm">Filtrar</button>
          {filtered && <Link href="/admin/auditoria" className="inline-flex min-h-10 items-center px-3 text-sm text-accent hover:underline">Quitar filtros</Link>}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" role="status">{total === 0 ? "Sin registros" : `${total.toLocaleString("es-CL")} ${total === 1 ? "registro" : "registros"}`}{filtered && " con estos filtros"}.</p>
        {total > 0 && (
          <a href={`/admin/auditoria/csv?${auditQueryString(query)}`} className="btn-ghost inline-flex min-h-10 items-center text-sm">Descargar CSV</a>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 text-muted">{filtered ? "No hay registros con esos filtros." : "Todavía no hay registros. Aparecerán aquí a medida que el equipo use el panel."}</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-2xl border bg-surface px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-muted">
                <time dateTime={e.at} className="tabular-nums">{stamp(e.at)}</time>
                <span className="font-semibold text-fg">{e.actorName}</span>
                <span>{actionLabel(e.action)}</span>
              </div>
              <p className="mt-1 break-words text-sm">{e.summary}</p>
              <Details value={e.details} />
            </li>
          ))}
        </ol>
      )}

      {pages > 1 && (
        <nav aria-label="Páginas" className="mt-6 flex items-center justify-between gap-3 text-sm">
          {current > 1 ? <Link href={link(current - 1)} className="btn-ghost inline-flex min-h-10 items-center">← Más recientes</Link> : <span />}
          <span className="text-muted">Página {current} de {pages}</span>
          {current < pages ? <Link href={link(current + 1)} className="btn-ghost inline-flex min-h-10 items-center">Más antiguos →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
