import { adminOrNull } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { listSubscribers } from "@/lib/subscribers";

// Descarga de suscriptores en CSV (para importar en una herramienta de correo).
export async function GET() {
  const actor = await adminOrNull();
  if (!actor) return new Response("No autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  const rows = await listSubscribers();
  await logAudit(actor, "reporte.descargar", { entity: "reporte", entityId: "suscriptores", summary: `Descargó la lista de suscriptores (${rows.length} correos)` });
  // Una celda que empieza con = + - @ se interpretaría como fórmula en Excel: se antepone una comilla simple.
  const cell = (v: string) => `"${(/^[=+\-@\t\r]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;
  const csv = ["correo,origen,producto,fecha", ...rows.map((r) => [r.email, r.source, r.productSlug, r.createdAt].map(cell).join(","))].join("\n");
  return new Response(`﻿${csv}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=suscriptores.csv", "Cache-Control": "no-store" },
  });
}
