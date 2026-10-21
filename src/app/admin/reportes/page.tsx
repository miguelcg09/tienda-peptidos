import { requirePage } from "@/lib/admin";
import { resolvePeriod, stamp, type Period } from "@/lib/period";
import { loadReport } from "@/lib/reports";
import { formatCLP } from "@/lib/products";
import { saleAt, unitsOf } from "@/lib/report-calc";
import { Notes, SeriesTable } from "../ReportParts";
import { PeriodBar } from "../PeriodBar";

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const SHOWN_ORDERS = 50;

function downloadHref(kind: string, p: Period) {
  const q = new URLSearchParams({ tipo: kind, preset: p.preset, agrupar: p.group });
  if (p.preset === "personalizado") {
    q.set("desde", p.fromKey);
    q.set("hasta", p.toKey);
  }
  return `/admin/reportes/csv?${q}`;
}

function Download({ kind, p, children }: { kind: string; p: Period; children: React.ReactNode }) {
  return (
    <a href={downloadHref(kind, p)} className="btn-ghost inline-flex min-h-10 items-center text-sm">
      {children}
    </a>
  );
}

export default async function Reportes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePage();
  const sp = await searchParams;
  const period = resolvePeriod({ preset: one(sp.preset), desde: one(sp.desde), hasta: one(sp.hasta), agrupar: one(sp.agrupar) });
  const r = await loadReport(period);
  const empty = r.current.orders === 0;
  const unit = { dia: "día", semana: "semana", mes: "mes" }[period.group];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Reportes</h1>
        <p className="mt-1 text-sm text-muted">
          {period.label}. Cada reporte se ve aquí y se descarga como archivo CSV, que se abre directo en Excel. Las descargas quedan anotadas en Auditoría.
        </p>
      </div>
      <PeriodBar base="/admin/reportes" period={period} />

      <section aria-labelledby="h-r1" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="h-r1" className="font-display text-xl font-bold">Ventas por {unit}</h2>
          <Download kind="ventas" p={period}>Descargar CSV</Download>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Ingresos", formatCLP(r.current.revenue)],
            ["Pedidos", String(r.current.orders)],
            ["Unidades", String(r.current.units)],
            ["Ticket promedio", formatCLP(r.current.avgTicket)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border bg-surface p-4">
              <p className="text-sm text-muted">{k}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        <SeriesTable r={r} />
      </section>

      <section aria-labelledby="h-r2" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="h-r2" className="font-display text-xl font-bold">Productos vendidos</h2>
          <Download kind="productos" p={period}>Descargar CSV</Download>
        </div>
        {r.products.length === 0 ? (
          <p className="rounded-2xl border bg-surface p-5 text-sm text-muted">No hay ventas en este período.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-surface" role="region" aria-label="Tabla de productos vendidos" tabIndex={0}>
            <table className="w-full text-sm">
              <caption className="sr-only">Productos vendidos, de más a menos unidades</caption>
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Producto</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Unidades</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-medium sm:table-cell">Pedidos</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Ventas</th>
                </tr>
              </thead>
              <tbody className="divide-y tabular-nums">
                {r.products.map((p) => (
                  <tr key={p.name}>
                    <th scope="row" className="px-4 py-2 text-left font-normal">{p.name}</th>
                    <td className="px-4 py-2 text-right">{p.units}</td>
                    <td className="hidden px-4 py-2 text-right sm:table-cell">{p.orders}</td>
                    <td className="px-4 py-2 text-right">{formatCLP(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-muted">Ventas = precio por unidades, antes de descuentos de cupón.</p>
      </section>

      <section aria-labelledby="h-r3" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="h-r3" className="font-display text-xl font-bold">Pedidos del período</h2>
          <Download kind="pedidos" p={period}>Descargar CSV</Download>
        </div>
        {empty ? (
          <p className="rounded-2xl border bg-surface p-5 text-sm text-muted">No hay ventas en este período.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border bg-surface" role="region" aria-label="Tabla de pedidos del período" tabIndex={0}>
              <table className="w-full text-sm">
                <caption className="sr-only">Pedidos pagados del período, del más reciente al más antiguo</caption>
                <thead className="text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    {["Pedido", "Pagado el", "Cliente", "Unidades", "Medio", "Total"].map((h, i) => (
                      <th key={h} scope="col" className={`px-4 py-3 font-medium ${i === 3 || i === 5 ? "text-right" : ""} ${i === 3 || i === 4 ? "hidden sm:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y tabular-nums">
                  {r.sales.slice(0, SHOWN_ORDERS).map((o) => (
                    <tr key={o.id}>
                      <th scope="row" className="whitespace-nowrap px-4 py-2 text-left font-mono font-normal">{o.id}</th>
                      <td className="whitespace-nowrap px-4 py-2">{stamp(saleAt(o))}</td>
                      <td className="px-4 py-2">{o.customer.name}</td>
                      <td className="hidden px-4 py-2 text-right sm:table-cell">{unitsOf(o)}</td>
                      <td className="hidden px-4 py-2 capitalize sm:table-cell">{o.paymentMethod}</td>
                      <td className="px-4 py-2 text-right">{formatCLP(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.sales.length > SHOWN_ORDERS && <p className="text-xs text-muted">Se muestran los {SHOWN_ORDERS} más recientes de {r.sales.length}; el archivo CSV trae todos.</p>}
          </>
        )}
        <p className="text-xs text-muted">El archivo de pedidos trae nombre, correo, comuna y región del cliente. No incluye RUT, teléfono ni dirección.</p>
      </section>

      {r.coupons.length > 0 && (
        <section aria-labelledby="h-r4" className="space-y-3">
          <h2 id="h-r4" className="font-display text-xl font-bold">Cupones usados</h2>
          <div className="overflow-x-auto rounded-2xl border bg-surface" role="region" aria-label="Tabla de cupones usados" tabIndex={0}>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Cupón</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Pedidos</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Descuento dado</th>
                </tr>
              </thead>
              <tbody className="divide-y tabular-nums">
                {r.coupons.map((c) => (
                  <tr key={c.code}>
                    <th scope="row" className="px-4 py-2 text-left font-mono font-normal">{c.code}</th>
                    <td className="px-4 py-2 text-right">{c.orders}</td>
                    <td className="px-4 py-2 text-right">{formatCLP(c.discount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <Notes r={r} />
    </div>
  );
}
