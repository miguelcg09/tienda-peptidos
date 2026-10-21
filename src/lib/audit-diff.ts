import { formatCLP, type Product, type Variant } from "./products";
import { SETTING_HIDDEN, SETTING_LABELS } from "./audit-labels";
import type { Settings } from "./config";

// Resúmenes legibles de lo que cambió, para el registro de auditoría. Sin acceso a la base de datos.

const short = (v: unknown, n = 60) => {
  const s = String(v ?? "").replace(/\s+/g, " ").trim();
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
};
const stockText = (n: number | null) => (n == null ? "sin control" : String(n));
const yesNo = (b: boolean) => (b ? "sí" : "no");

type Field = Exclude<keyof Product, "variants" | "rating">;
const TEXT_FIELDS: [Field, string][] = [
  ["name", "Nombre"],
  ["category", "Categoría"],
  ["short", "Descripción corta"],
  ["purity", "Pureza"],
  ["form", "Formato"],
  ["cas", "CAS"],
  ["color", "Color"],
  ["lot", "Lote"],
  ["lotDate", "Fecha del lote"],
  ["coaUrl", "Enlace al certificado"],
];
const LONG_FIELDS: [Field, string][] = [
  ["description", "Descripción"],
  ["mechanism", "Mecanismo"],
  ["storage", "Almacenamiento"],
  ["reconstitution", "Reconstitución"],
  ["research", "Investigación"],
];

// Cambios entre un producto guardado y el que se está guardando. Con `before` nulo es un producto nuevo.
export function diffProduct(before: Product | null, next: Omit<Product, "variants">, variants: Variant[]): string[] {
  const out: string[] = [];
  if (!before) {
    out.push(`Producto nuevo con ${variants.length} ${variants.length === 1 ? "presentación" : "presentaciones"}`);
    for (const v of variants) out.push(`Presentación ${v.label}: ${formatCLP(v.price)}, stock ${stockText(v.stock)}`);
    return out;
  }
  for (const [k, label] of TEXT_FIELDS) {
    const a = String(before[k] ?? "");
    const b = String(next[k] ?? "");
    if (a !== b) out.push(`${label}: «${short(a)}» → «${short(b)}»`);
  }
  for (const [k, label] of LONG_FIELDS) {
    if (String(before[k] ?? "") !== String(next[k] ?? "")) out.push(`${label}: texto modificado`);
  }
  if ((before.imageUrl ?? "") !== (next.imageUrl ?? "")) out.push(next.imageUrl ? "Foto cambiada" : "Foto quitada");
  if (Boolean(before.featured) !== Boolean(next.featured)) out.push(`Destacado: ${yesNo(Boolean(before.featured))} → ${yesNo(Boolean(next.featured))}`);
  if (Boolean(before.visible) !== Boolean(next.visible)) out.push(`Visible en la tienda: ${yesNo(Boolean(before.visible))} → ${yesNo(Boolean(next.visible))}`);
  if (Number(before.sort ?? 0) !== Number(next.sort ?? 0)) out.push(`Orden: ${before.sort ?? 0} → ${next.sort ?? 0}`);

  const old = new Map(before.variants.map((v) => [v.id, v]));
  const seen = new Set<string>();
  for (const v of variants) {
    seen.add(v.id);
    const o = old.get(v.id);
    if (!o) {
      out.push(`Presentación nueva ${v.label}: ${formatCLP(v.price)}, stock ${stockText(v.stock)}`);
      continue;
    }
    if (o.label !== v.label) out.push(`Presentación «${o.label}» renombrada a «${v.label}»`);
    if (o.price !== v.price) out.push(`Precio ${v.label}: ${formatCLP(o.price)} → ${formatCLP(v.price)}`);
    if ((o.compareAt ?? null) !== (v.compareAt ?? null)) out.push(`Precio anterior ${v.label}: ${o.compareAt ? formatCLP(o.compareAt) : "sin"} → ${v.compareAt ? formatCLP(v.compareAt) : "sin"}`);
    if ((o.stock ?? null) !== (v.stock ?? null)) out.push(`Stock ${v.label}: ${stockText(o.stock ?? null)} → ${stockText(v.stock ?? null)}`);
  }
  for (const o of before.variants) if (!seen.has(o.id)) out.push(`Presentación eliminada ${o.label}`);
  return out;
}

// Cambios en Ajustes. Los datos bancarios y los textos largos se anotan sin mostrar su contenido.
export function diffSettings(before: Settings, next: Settings): string[] {
  const out: string[] = [];
  for (const key of Object.keys(SETTING_LABELS) as (keyof Settings)[]) {
    const a = before[key];
    const b = next[key];
    if (String(a ?? "") === String(b ?? "")) continue;
    const label = SETTING_LABELS[key];
    out.push(SETTING_HIDDEN.has(key) ? `${label}: modificado` : `${label}: «${short(a)}» → «${short(b)}»`);
  }
  return out;
}

// Resumen corto para la tabla: las primeras líneas y cuántas más hay.
export function summarizeChanges(changes: string[], fallback: string, max = 3) {
  if (changes.length === 0) return fallback;
  const head = changes.slice(0, max).join("; ");
  return changes.length > max ? `${head} (y ${changes.length - max} más)` : head;
}

export function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!d) return email.slice(0, 2) + "***";
  return `${u.slice(0, 2)}***@${d}`;
}
