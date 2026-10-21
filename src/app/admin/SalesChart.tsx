"use client";

import { useEffect, useRef, useState } from "react";

export type ChartPoint = {
  short: string; // etiqueta del eje («12 oct»)
  long: string; // etiqueta completa («12 oct 2026»)
  value: number;
  valueText: string; // «$45.000»
  sub: string; // «3 pedidos · 5 unidades»
};
export type ChartTick = { value: number; label: string };

// Columnas de ingresos por día, semana o mes. Todo el texto llega ya formateado desde el servidor, así que
// aquí solo se dibuja y se maneja el puntero. Cada columna es una zona de toque que ocupa todo el alto; con el
// teclado se entra al gráfico y se recorre con las flechas. La misma información está en la tabla de abajo.
export function SalesChart({ points, ticks, max, label }: { points: ChartPoint[]; ticks: ChartTick[]; max: number; label: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(640); // ancho del área de columnas; sirve para decidir cuántas fechas caben en el eje
  const plot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const n = points.length;
  // Cada fecha necesita unos 72 px: se muestran de a `step` columnas, y la última siempre, sin pisar a la anterior.
  const step = Math.max(1, Math.ceil(72 / (width / n)));
  const labelled = points.map((_, i) => i).filter((i) => i === n - 1 || (i % step === 0 && n - 1 - i >= step));
  const cur = active == null ? null : points[active];

  const onKey = (e: React.KeyboardEvent) => {
    const go = (i: number) => {
      e.preventDefault();
      setActive(Math.max(0, Math.min(n - 1, i)));
    };
    if (e.key === "ArrowRight") go((active ?? -1) + 1);
    else if (e.key === "ArrowLeft") go((active ?? n) - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
    else if (e.key === "Escape") setActive(null);
  };

  return (
    <div>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${label}. Usa las flechas para recorrer cada columna; los mismos datos están en la tabla de abajo.`}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="mt-8 grid grid-cols-[auto_1fr] gap-x-2 rounded-md outline-offset-4"
      >
        <div className="relative h-52 w-14 text-right text-xs text-muted" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t.value} className="absolute right-0 -translate-y-1/2 tabular-nums" style={{ bottom: `${(t.value / max) * 100}%` }}>{t.label}</span>
          ))}
        </div>
        <div ref={plot} className="relative h-52" onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}>
          {ticks.map((t) => (
            <div key={t.value} className="absolute inset-x-0 border-t" style={{ bottom: `${(t.value / max) * 100}%` }} aria-hidden="true" />
          ))}
          <div className="absolute inset-0 flex items-stretch gap-[2px]">
            {points.map((p, i) => (
              <div
                key={i}
                className="relative flex min-w-0 flex-1 items-end justify-center"
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
              >
                <span
                  className="viz-bar block w-full max-w-6 rounded-t-[4px] transition-opacity"
                  style={{ height: `${Math.max(p.value > 0 ? 1.5 : 0, (p.value / max) * 100)}%`, opacity: active == null || active === i ? 1 : 0.5 }}
                />
              </div>
            ))}
          </div>
          {cur && active != null && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-max max-w-[11rem] rounded-md border bg-surface px-3 py-2 text-xs shadow-lg"
              style={{ left: `${((active + 0.5) / n) * 100}%`, transform: active / n > 0.55 ? "translateX(calc(-100% - 8px))" : "translateX(8px)" }}
            >
              <p className="text-sm font-semibold tabular-nums text-fg">{cur.valueText}</p>
              <p className="text-muted">{cur.long}</p>
              <p className="text-muted">{cur.sub}</p>
            </div>
          )}
        </div>
        <div />
        <div className="relative mt-1 h-5 text-xs text-muted" aria-hidden="true">
          {labelled.map((i) => (
            <span
              key={i}
              className="absolute top-0 whitespace-nowrap"
              style={{ left: `${((i + 0.5) / n) * 100}%`, transform: i === 0 ? "none" : i === n - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {points[i].short}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{cur ? `${cur.long}: ${cur.valueText}. ${cur.sub}` : ""}</p>
    </div>
  );
}
