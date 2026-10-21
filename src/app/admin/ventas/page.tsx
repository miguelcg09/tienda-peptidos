import Link from "next/link";
import { requirePage } from "@/lib/admin";
import { resolvePeriod } from "@/lib/period";
import { loadReport } from "@/lib/reports";
import { formatCLP } from "@/lib/products";
import { Kpis, Notes, RevenueChart, SeriesTable, TopProducts } from "../ReportParts";
import { PeriodBar } from "../PeriodBar";

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Ventas({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePage();
  const sp = await searchParams;
  const period = resolvePeriod({ preset: one(sp.preset), desde: one(sp.desde), hasta: one(sp.hasta), agrupar: one(sp.agrupar) });
  const r = await loadReport(period);
  const q = new URLSearchParams({ preset: period.preset, agrupar: period.group });
  if (period.preset === "personalizado") {
    q.set("desde", period.fromKey);
    q.set("hasta", period.toKey);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Ventas</h1>
        <p className="mt-1 text-sm text-muted">{period.label}, comparado con {period.prevLabel}.</p>
      </div>
      {one(sp.bienvenida) && (
        <p role="status" className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
          Tu cuenta quedó creada y ya estás dentro. Crea las cuentas del resto del equipo en <Link href="/admin/usuarios" className="underline">Equipo</Link>.
        </p>
      )}
      <PeriodBar base="/admin/ventas" period={period} />
      <Kpis r={r} />
      <RevenueChart r={r} />
      {r.series.some((s) => s.orders > 0) && <SeriesTable r={r} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopProducts r={r} />
        <section aria-labelledby="h-extra" className="rounded-2xl border bg-surface p-5">
          <h2 id="h-extra" className="font-display text-xl font-bold">Cómo se pagó y descuentos</h2>
          {r.current.orders === 0 ? (
            <p className="mt-3 text-sm text-muted">Sin ventas en este período.</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              {r.payments.map((p) => (
                <div key={p.method} className="flex justify-between gap-4">
                  <dt><span className="capitalize">{p.method}</span> <span className="text-muted">({p.orders} {p.orders === 1 ? "pedido" : "pedidos"})</span></dt>
                  <dd className="tabular-nums">{formatCLP(p.revenue)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t pt-2">
                <dt>Descuentos por cupón</dt>
                <dd className="tabular-nums">{formatCLP(r.current.discount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Envíos cobrados</dt>
                <dd className="tabular-nums">{formatCLP(r.current.shipping)}</dd>
              </div>
            </dl>
          )}
        </section>
      </div>
      <Notes r={r} />
      <p className="text-sm">
        <Link href={`/admin/reportes?${q}`} className="text-accent hover:underline">Ver reportes completos y descargarlos (CSV para Excel)</Link>
      </p>
    </div>
  );
}
