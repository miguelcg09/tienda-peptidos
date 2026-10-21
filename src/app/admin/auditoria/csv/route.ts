import { adminOrNull } from "@/lib/admin";
import { listAudit, logAudit } from "@/lib/audit";
import { actionLabel } from "@/lib/audit-labels";
import { auditFilter, parseAuditQuery } from "@/lib/audit-params";
import { csvResponse, toCsv } from "@/lib/csv";
import { dayKey, stamp } from "@/lib/period";

export const dynamic = "force-dynamic";
const MAX_ROWS = 20000;

const detailText = (d: unknown) => (d == null ? "" : Array.isArray(d) && d.every((x) => typeof x === "string") ? d.join(" | ") : typeof d === "string" ? d : JSON.stringify(d));

// Descarga del registro de auditoría (con los mismos filtros de la pantalla). Sin sesión responde 401 sin consultar nada.
export async function GET(req: Request) {
  const actor = await adminOrNull();
  if (!actor) return new Response("No autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  const params = new URL(req.url).searchParams;
  const query = parseAuditQuery((k) => params.get(k) ?? undefined);
  const entries = await listAudit(auditFilter(query), MAX_ROWS);
  await logAudit(actor, "reporte.descargar", {
    entity: "reporte",
    entityId: "auditoria",
    summary: `Descargó el registro de auditoría (${entries.length} registros)`,
    details: query,
  });
  const rows = [
    ["Fecha", "Persona", "Acción", "Detalle", "Referencia", "Cambios"],
    ...entries.map((e) => [stamp(e.at), e.actorName, actionLabel(e.action), e.summary, e.entityId, detailText(e.details)]),
  ];
  return csvResponse(toCsv(rows), `helix-auditoria_${dayKey(new Date())}.csv`);
}
