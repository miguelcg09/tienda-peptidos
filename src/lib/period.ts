// Fechas y períodos de los reportes. Todo se calcula con la fecha de Chile (America/Santiago): una venta hecha a las
// 23:30 del 31 de octubre pertenece al 31 aunque en UTC ya sea 1 de noviembre. Módulo puro (sin servidor ni base
// de datos) para poder probarlo solo.

export const TZ = "America/Santiago";

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const stampFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export type DayKey = string; // "2026-10-21"

export const dayKey = (d: Date | string | number): DayKey => dayFmt.format(new Date(d));

// "2026-10-21 17:05" en hora de Chile.
export function stamp(d: Date | string | number) {
  const p = Object.fromEntries(stampFmt.formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

const parts = (k: DayKey) => {
  const [y, m, d] = k.split("-").map(Number);
  return { y, m, d };
};
const utc = (k: DayKey) => {
  const { y, m, d } = parts(k);
  return Date.UTC(y, m - 1, d);
};

export function isDayKey(k: unknown): k is DayKey {
  if (typeof k !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(k)) return false;
  const t = new Date(utc(k));
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === k;
}

export const addDays = (k: DayKey, n: number): DayKey => new Date(utc(k) + n * 86400_000).toISOString().slice(0, 10);
export const daysInclusive = (from: DayKey, to: DayKey) => Math.round((utc(to) - utc(from)) / 86400_000) + 1;
export const monthStart = (k: DayKey): DayKey => `${k.slice(0, 7)}-01`;
const addMonths = (k: DayKey, n: number): DayKey => {
  const { y, m } = parts(k);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return t.toISOString().slice(0, 10);
};
export const weekStart = (k: DayKey): DayKey => addDays(k, -((new Date(utc(k)).getUTCDay() + 6) % 7)); // lunes

// Primer instante del día en Chile. Hay días con un cambio de hora a medianoche (septiembre y abril), así que se
// prueban los dos desfases posibles (UTC-3 y UTC-4) y se elige el que cae justo al comenzar ese día.
export function startOfDay(k: DayKey): Date {
  const base = utc(k);
  for (const h of [3, 4]) {
    const t = base + h * 3600_000;
    if (dayKey(t) === k && dayKey(t - 1) !== k) return new Date(t);
  }
  return new Date(base + 4 * 3600_000);
}

export const fmtDay = (k: DayKey) => {
  const { m, d } = parts(k);
  return `${d} ${MONTHS[m - 1]}`;
};
export const fmtDayLong = (k: DayKey) => {
  const { y, m, d } = parts(k);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export type Group = "dia" | "semana" | "mes";
export const GROUPS: { id: Group; label: string }[] = [
  { id: "dia", label: "Por día" },
  { id: "semana", label: "Por semana" },
  { id: "mes", label: "Por mes" },
];

export const bucketOf = (k: DayKey, g: Group): DayKey => (g === "dia" ? k : g === "semana" ? weekStart(k) : monthStart(k));

// Todos los bloques entre dos fechas (también los vacíos), en orden.
export function bucketKeys(from: DayKey, to: DayKey, g: Group): DayKey[] {
  const out: DayKey[] = [];
  let cur = bucketOf(from, g);
  while (cur <= to) {
    out.push(cur);
    cur = g === "dia" ? addDays(cur, 1) : g === "semana" ? addDays(cur, 7) : addMonths(cur, 1);
  }
  return out;
}

// Etiqueta corta (eje del gráfico) y larga (tabla y descripciones).
export function bucketLabel(k: DayKey, g: Group) {
  const { y, m } = parts(k);
  if (g === "mes") return { short: `${MONTHS[m - 1]} ${String(y).slice(2)}`, long: `${MONTHS_LONG[m - 1]} ${y}` };
  if (g === "semana") return { short: fmtDay(k), long: `Semana del ${fmtDay(k)} al ${fmtDayLong(addDays(k, 6))}` };
  return { short: fmtDay(k), long: fmtDayLong(k) };
}

export type PresetId = "hoy" | "7d" | "30d" | "90d" | "mes" | "mes-pasado" | "anio" | "personalizado";
export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "90d", label: "90 días" },
  { id: "mes", label: "Este mes" },
  { id: "mes-pasado", label: "Mes pasado" },
  { id: "anio", label: "Este año" },
  { id: "personalizado", label: "Fechas" },
];

export const MAX_DAYS = 731;
export const MAX_DAILY_DAYS = 92; // más columnas diarias que esto no se leen

export type Period = {
  preset: PresetId;
  fromKey: DayKey; // primer día (incluido)
  toKey: DayKey; // último día (incluido)
  days: number;
  from: Date; // instante de inicio
  to: Date; // instante de término (excluido)
  prevFromKey: DayKey;
  prevToKey: DayKey;
  prevFrom: Date;
  group: Group;
  label: string;
  prevLabel: string;
  error?: string;
};

export type PeriodInput = { preset?: string; desde?: string; hasta?: string; agrupar?: string };

export function defaultGroup(days: number): Group {
  return days <= 31 ? "dia" : days <= 120 ? "semana" : "mes";
}

export function resolvePeriod(input: PeriodInput, now: Date = new Date()): Period {
  const today = dayKey(now);
  const known = PRESETS.some((p) => p.id === input.preset);
  let preset = (known ? input.preset : "30d") as PresetId;
  let error: string | undefined;
  let fromKey: DayKey = today;
  let toKey: DayKey = today;

  const range = (): void => {
    switch (preset) {
      case "hoy": break;
      case "7d": fromKey = addDays(today, -6); break;
      case "30d": fromKey = addDays(today, -29); break;
      case "90d": fromKey = addDays(today, -89); break;
      case "mes": fromKey = monthStart(today); break;
      case "mes-pasado": fromKey = addMonths(monthStart(today), -1); toKey = addDays(monthStart(today), -1); break;
      case "anio": fromKey = `${today.slice(0, 4)}-01-01`; break;
      case "personalizado": break;
    }
  };

  if (preset === "personalizado") {
    if (isDayKey(input.desde) && isDayKey(input.hasta)) {
      fromKey = input.desde;
      toKey = input.hasta > today ? today : input.hasta;
      if (fromKey > toKey) error = "La fecha de inicio es posterior a la de término.";
      else if (daysInclusive(fromKey, toKey) > MAX_DAYS) error = "El rango máximo es de dos años.";
    } else {
      error = "Escribe las dos fechas.";
    }
    if (error) {
      preset = "30d";
      toKey = today;
      range();
    }
  } else {
    range();
  }

  const days = daysInclusive(fromKey, toKey);
  const prevToKey = addDays(fromKey, -1);
  const prevFromKey = addDays(fromKey, -days);
  const asked = input.agrupar as Group | undefined;
  let group: Group = asked && GROUPS.some((g) => g.id === asked) ? asked : defaultGroup(days);
  if (group === "dia" && days > MAX_DAILY_DAYS) group = "semana";
  const lab = (a: DayKey, b: DayKey) => (a === b ? fmtDayLong(a) : `${fmtDayLong(a)} al ${fmtDayLong(b)}`);
  return {
    preset,
    fromKey,
    toKey,
    days,
    from: startOfDay(fromKey),
    to: startOfDay(addDays(toKey, 1)),
    prevFromKey,
    prevToKey,
    prevFrom: startOfDay(prevFromKey),
    group,
    label: lab(fromKey, toKey),
    prevLabel: lab(prevFromKey, prevToKey),
    error,
  };
}
