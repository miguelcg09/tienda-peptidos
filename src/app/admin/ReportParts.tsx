import { formatCLP } from "@/lib/products";
import { pctChange, type Report } from "@/lib/report-calc";
import { SalesChart } from "./SalesChart";

const num = (n: number, max = 1) => n.toLocaleString("es-CL", { maximumFractionDigits: max });

// Montos compactos para el eje del gráfico.
export function compactCLP(n: number) {
  if (n >= 1_000_000) return `$${num(n / 1_000_000)} M`;
  if (n >= 1000) return `$${num(n / 1000)} mil`;
  return `$${num(n, 0)}`;
}

// Tope «redondo» para el eje: 1, 2, 4, 5 o 10 por una potencia de diez (la mitad también queda redonda).
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 4, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

function Delta({ cur, prev, prevLabel }: { cur: number; prev: number; prevLabel: string }) {
  const p = pctChange(cur, prev);
  if (p == null) return <p className="mt-1 text-xs text-muted">{cur > 0 ? "Sin ventas en el período anterior" : "Sin cambios"}</p>;
  const arrow = p > 0 ? "▲" : p < 0 ? "▼" : "=";
  return (
    <p className="mt-1 text-xs text-muted">
      <span className="font-semibold text-fg"><span aria-hidden="true">{arrow} </span>{p > 0 ? "+" : ""}{num(p)} %</span>{" "}
      <span className="sr-only">{p > 0 ? "más" : p < 0 ? "menos" : "igual"} </span>
      que el período anterior <span className="sr-only">({prevLabel})</span>
    </p>
  );
}

function Tile({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-sans text-2xl font-semibold tabular-nums">{value}</p>
      {children}
    </div>
  );
}

export function Kpis({ r }: { r: Report }) {
  const { current: c, previous: p } = r;
  const pl = r.period.prevLabel;
  return (
    <div>
      {/* La cifra principal de la vista: una sola */}
      <div className="rounded-2xl border bg-surface p-5">
        <p className="text-sm text-muted">Ingresos del período</p>
        <p className="mt-1 font-sans text-5xl font-semibold tracking-tight">{formatCLP(c.revenue)}</p>
        <Delta cur={c.revenue} prev={p.revenue} prevLabel={pl} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Tile label="Pedidos" value={num(c.orders, 0)}><Delta cur={c.orders} prev={p.orders} prevLabel={pl} /></Tile>
        <Tile label="Unidades vendidas" value={num(c.units, 0)}><Delta cur={c.units} prev={p.units} prevLabel={pl} /></Tile>
        <Tile label="Ticket promedio" value={formatCLP(c.avgTicket)}><Delta cur={c.avgTicket} prev={p.avgTicket} prevLabel={pl} /></Tile>
      </div>
    </div>
  );
}

const WHAT = { dia: "día", semana: "semana", mes: "mes" } as const;

export function RevenueChart({ r }: { r: Report }) {
  const { series, period } = r;
  const total = series.reduce((n, s) => n + s.revenue, 0);
  if (total === 0) return <p className="rounded-2xl border bg-surface p-6 text-sm text-muted">No hay ventas en este período.</p>;
  const max = niceMax(Math.max(...series.map((s) => s.revenue)));
  const ticks = [0, max / 2, max].map((value) => ({ value, label: compactCLP(value) }));
  const points = series.map((s) => ({
    short: s.short,
    long: s.long,
    value: s.revenue,
    valueText: formatCLP(s.revenue),
    sub: `${s.orders} ${s.orders === 1 ? "pedido" : "pedidos"} · ${s.units} ${s.units === 1 ? "unidad" : "unidades"}`,
  }));
  return (
    <section aria-labelledby="h-chart" className="rounded-2xl border bg-surface p-5">
      <h2 id="h-chart" className="font-display text-xl font-bold">Ingresos por {WHAT[period.group]}</h2>
      <p className="mb-4 text-sm text-muted">{period.label}</p>
      <SalesChart points={points} ticks={ticks} max={max} label={`Ingresos por ${WHAT[period.group]}, ${period.label}`} />
    </section>
  );
}

export function SeriesTable({ r }: { r: Report }) {
  return (
    <details className="rounded-2xl border bg-surface">
      <summary className="flex min-h-12 cursor-pointer items-center px-5 text-sm font-medium">Ver los datos del gráfico en tabla</summary>
      <div className="overflow-x-auto border-t" role="region" aria-label="Tabla de ingresos" tabIndex={0}>
        <table className="w-full text-sm">
          <caption className="sr-only">Ingresos por {WHAT[r.period.group]}</caption>
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">{r.period.group === "dia" ? "Día" : r.period.group === "semana" ? "Semana" : "Mes"}</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Pedidos</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Unidades</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Ingresos</th>
            </tr>
          </thead>
          <tbody className="divide-y tabular-nums">
            {r.series.map((s) => (
              <tr key={s.key}>
                <th scope="row" className="px-4 py-2 text-left font-normal">{s.long}</th>
                <td className="px-4 py-2 text-right">{s.orders}</td>
                <td className="px-4 py-2 text-right">{s.units}</td>
                <td className="px-4 py-2 text-right">{formatCLP(s.revenue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t font-semibold tabular-nums">
            <tr>
              <th scope="row" className="px-4 py-3 text-left">Total</th>
              <td className="px-4 py-3 text-right">{r.current.orders}</td>
              <td className="px-4 py-3 text-right">{r.current.units}</td>
              <td className="px-4 py-3 text-right">{formatCLP(r.current.revenue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  );
}

export function TopProducts({ r, limit = 8 }: { r: Report; limit?: number }) {
  const rows = r.products.slice(0, limit);
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((p) => p.units));
  return (
    <section aria-labelledby="h-top" className="rounded-2xl border bg-surface p-5">
      <h2 id="h-top" className="font-display text-xl font-bold">Productos más vendidos</h2>
      <p className="mb-4 text-sm text-muted">Por unidades. El monto es precio por unidades, antes de descuentos de cupón.</p>
      <ol className="space-y-3">
        {rows.map((p, i) => (
          <li key={p.name}>
            <div className="flex flex-wrap items-baseline gap-x-3 text-sm">
              <span className="w-5 text-muted tabular-nums">{i + 1}</span>
              <span className="min-w-0 flex-1 break-words font-medium">{p.name}</span>
              <span className="tabular-nums"><strong>{num(p.units, 0)}</strong> {p.units === 1 ? "unidad" : "unidades"}</span>
              <span className="w-24 text-right text-muted tabular-nums">{formatCLP(p.revenue)}</span>
            </div>
            <div className="ml-8 mt-1 h-1.5 rounded-full bg-tint/10" aria-hidden="true">
              <div className="viz-bar h-full rounded-full" style={{ width: `${Math.max(2, (p.units / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ol>
      {r.products.length > limit && <p className="mt-4 text-xs text-muted">Hay {r.products.length - limit} productos más; la lista completa está en Reportes.</p>}
    </section>
  );
}

// Aclaraciones que evitan malinterpretar las cifras.
export function Notes({ r }: { r: Report }) {
  const notes: string[] = [];
  if (r.pending.orders > 0) notes.push(`${r.pending.orders} ${r.pending.orders === 1 ? "pedido espera" : "pedidos esperan"} el pago (${formatCLP(r.pending.amount)}). Se suman a las ventas cuando se confirma.`);
  if (r.testOrders > 0) notes.push(`${r.testOrders} ${r.testOrders === 1 ? "pedido de prueba no se cuenta" : "pedidos de prueba no se cuentan"}.`);
  notes.push("Cuentan los pedidos pagados o despachados, en el día en que se pagaron (hora de Chile). Los ingresos incluyen envío y descuentos ya aplicados.");
  return (
    <ul className="space-y-1 text-xs text-muted">
      {notes.map((n) => <li key={n}>{n}</li>)}
    </ul>
  );
}
