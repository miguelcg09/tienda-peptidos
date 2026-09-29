import { isAdmin } from "@/lib/admin";
import { listSubscribers } from "@/lib/subscribers";

// Descarga de suscriptores en CSV (para importar en una herramienta de correo).
export async function GET() {
  if (!(await isAdmin())) return new Response("No autorizado", { status: 401 });
  const rows = await listSubscribers();
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["correo,origen,producto,fecha", ...rows.map((r) => [r.email, r.source, r.productSlug, r.createdAt].map(cell).join(","))].join("\n");
  return new Response(`﻿${csv}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=suscriptores.csv" },
  });
}
