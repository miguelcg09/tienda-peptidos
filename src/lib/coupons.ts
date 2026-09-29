import "server-only";
import { query } from "./db";
import { formatCLP } from "./products";

// Cupones de descuento: se crean en /admin/cupones y el cliente los escribe en el checkout.
export type Coupon = {
  code: string;
  kind: "porcentaje" | "monto";
  value: number; // % o CLP según el tipo
  minSubtotal: number; // compra mínima (CLP) para poder usarlo
  maxUses: number | null; // null = sin límite
  uses: number;
  expiresAt: string | null; // AAAA-MM-DD
  active: boolean;
  createdAt: string;
};

type Row = {
  code: string;
  kind: string;
  value: number;
  min_subtotal: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string | Date;
};

const toCoupon = (r: Row): Coupon => ({
  code: r.code,
  kind: r.kind === "monto" ? "monto" : "porcentaje",
  value: Number(r.value),
  minSubtotal: Number(r.min_subtotal),
  maxUses: r.max_uses == null ? null : Number(r.max_uses),
  uses: Number(r.uses),
  expiresAt: r.expires_at ?? null,
  active: Boolean(r.active),
  createdAt: new Date(r.created_at).toISOString(),
});

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
const todayInChile = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

export async function listCoupons() {
  return (await query<Row>("SELECT * FROM coupons ORDER BY created_at DESC")).map(toCoupon);
}

export async function getCoupon(code: string) {
  const [row] = await query<Row>("SELECT * FROM coupons WHERE code = $1", [normalizeCode(code)]);
  return row ? toCoupon(row) : null;
}

export async function saveCoupon(c: Omit<Coupon, "uses" | "createdAt">) {
  await query(
    `INSERT INTO coupons (code, kind, value, min_subtotal, max_uses, expires_at, active) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (code) DO UPDATE SET kind = EXCLUDED.kind, value = EXCLUDED.value, min_subtotal = EXCLUDED.min_subtotal,
       max_uses = EXCLUDED.max_uses, expires_at = EXCLUDED.expires_at, active = EXCLUDED.active`,
    [normalizeCode(c.code), c.kind, c.value, c.minSubtotal, c.maxUses, c.expiresAt, c.active],
  );
}

export async function setCouponActive(code: string, active: boolean) {
  await query("UPDATE coupons SET active = $2 WHERE code = $1", [normalizeCode(code), active]);
}

export async function deleteCoupon(code: string) {
  await query("DELETE FROM coupons WHERE code = $1", [normalizeCode(code)]);
}

export function discountFor(c: Coupon, subtotal: number) {
  return c.kind === "porcentaje" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
}

export function describeCoupon(c: Coupon) {
  return c.kind === "porcentaje" ? `${c.value}% de descuento` : `${formatCLP(c.value)} de descuento`;
}

// Valida un cupón contra el subtotal calculado en el servidor (nunca contra montos del navegador).
export async function applyCoupon(
  code: string,
  subtotal: number,
): Promise<{ ok: true; coupon: Coupon; discount: number } | { ok: false; reason: string }> {
  const c = await getCoupon(code);
  if (!c || !c.active) return { ok: false, reason: "Ese cupón no existe o ya no está activo." };
  if (c.expiresAt && c.expiresAt < todayInChile()) return { ok: false, reason: "Ese cupón ya venció." };
  if (c.maxUses != null && c.uses >= c.maxUses) return { ok: false, reason: "Ese cupón alcanzó su límite de usos." };
  if (subtotal < c.minSubtotal) return { ok: false, reason: `Este cupón requiere una compra mínima de ${formatCLP(c.minSubtotal)}.` };
  const discount = discountFor(c, subtotal);
  if (discount <= 0) return { ok: false, reason: "Ese cupón no aplica a este pedido." };
  return { ok: true, coupon: c, discount };
}

export async function redeemCoupon(code: string) {
  await query("UPDATE coupons SET uses = uses + 1 WHERE code = $1", [normalizeCode(code)]);
}
