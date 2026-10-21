import Link from "next/link";
import { dayKey, GROUPS, MAX_DAILY_DAYS, PRESETS, type Period } from "@/lib/period";

// Selector de período: un solo renglón sobre el contenido (atajos, fechas propias y agrupación). Son enlaces y un
// formulario GET: funciona sin JavaScript y la dirección de la página se puede guardar o compartir con el equipo.
export function PeriodBar({ base, period, extra }: { base: string; period: Period; extra?: Record<string, string> }) {
  const href = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...extra, ...p })) if (v) q.set(k, v);
    return `${base}?${q}`;
  };
  const pill = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full border px-4 text-sm ${active ? "border-accent bg-accent text-on-accent" : "hover:border-accent"}`;
  const today = dayKey(new Date());

  return (
    <div className="space-y-3">
      <nav aria-label="Período" className="flex flex-wrap gap-2">
        {PRESETS.filter((p) => p.id !== "personalizado").map((p) => (
          <Link key={p.id} href={href({ preset: p.id })} aria-current={period.preset === p.id ? "true" : undefined} className={pill(period.preset === p.id)}>
            {p.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <form method="get" action={base} className="flex flex-wrap items-end gap-2">
          {Object.entries(extra ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input type="hidden" name="preset" value="personalizado" />
          <input type="hidden" name="agrupar" value={period.group} />
          <label className="text-sm">Desde<input type="date" name="desde" defaultValue={period.fromKey} max={today} required className="field" /></label>
          <label className="text-sm">Hasta<input type="date" name="hasta" defaultValue={period.toKey} max={today} required className="field" /></label>
          <button className="btn-ghost text-sm">Ver fechas</button>
        </form>
        <nav aria-label="Agrupar por" className="flex flex-wrap gap-2">
          {GROUPS.filter((g) => g.id !== "dia" || period.days <= MAX_DAILY_DAYS).map((g) => (
            <Link
              key={g.id}
              href={href({ preset: period.preset, agrupar: g.id, desde: period.preset === "personalizado" ? period.fromKey : undefined, hasta: period.preset === "personalizado" ? period.toKey : undefined })}
              aria-current={period.group === g.id ? "true" : undefined}
              className={pill(period.group === g.id)}
            >
              {g.label}
            </Link>
          ))}
        </nav>
      </div>
      {period.error && <p role="alert" className="rounded-lg bg-amber-400/15 p-3 text-sm text-amber-700 dark:text-amber-300">{period.error} Te muestro los últimos 30 días.</p>}
    </div>
  );
}
