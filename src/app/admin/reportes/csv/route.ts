import { adminOrNull } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { csvResponse, toCsv } from "@/lib/csv";
import { resolvePeriod } from "@/lib/period";
import { fileStem, orderRows, productRows, seriesRows } from "@/lib/report-calc";
import { loadReport } from "@/lib/reports";

export const dynamic = "force-dynamic";

const KINDS = {
  ventas: { name: "Ventas por período", rows: seriesRows },
  productos: { name: "Productos vendidos", rows: productRows },
  pedidos: { name: "Pedidos del período", rows: orderRows },
} as const;

// Descarga de un reporte en CSV. Sin sesión no hay datos: responde 401 antes de consultar nada.
export async function GET(req: Request) {
  const actor = await adminOrNull();
  if (!actor) return new Response("No autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") ?? "";
  if (!(tipo in KINDS)) return new Response("Tipo de reporte desconocido", { status: 400 });
  const kind = KINDS[tipo as keyof typeof KINDS];

  const period = resolvePeriod({
    preset: url.searchParams.get("preset") ?? undefined,
    desde: url.searchParams.get("desde") ?? undefined,
    hasta: url.searchParams.get("hasta") ?? undefined,
    agrupar: url.searchParams.get("agrupar") ?? undefined,
  });
  const report = await loadReport(period);
  await logAudit(actor, "reporte.descargar", {
    entity: "reporte",
    entityId: tipo,
    summary: `Descargó el reporte «${kind.name}» (${period.label})`,
    details: { tipo, desde: period.fromKey, hasta: period.toKey, agrupar: period.group },
  });
  return csvResponse(toCsv(kind.rows(report)), `${fileStem(tipo, period)}.csv`);
}
