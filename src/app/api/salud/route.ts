import { NextResponse } from "next/server";
import { databaseUrlVar, query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Diagnóstico rápido del despliegue. No expone valores, solo si cada pieza está configurada.
export async function GET() {
  let db: { ok: boolean; detail: string; pedidos?: number };
  try {
    const [row] = await query<{ n: string | number }>("SELECT count(*) AS n FROM orders");
    db = { ok: true, detail: `conectada vía ${databaseUrlVar() ?? "PGlite local"}`, pedidos: Number(row.n) };
  } catch (err) {
    db = { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
  return NextResponse.json({
    ok: db.ok,
    baseDeDatos: db,
    configurado: {
      DATABASE_URL: Boolean(databaseUrlVar()),
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      ORDERS_NOTIFY_EMAIL: Boolean(process.env.ORDERS_NOTIFY_EMAIL),
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER ?? "mock",
    },
  });
}
