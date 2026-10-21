import "server-only";
import { query } from "./db";
import type { Period } from "./period";
import { buildReport, type ReportOrder } from "./report-calc";

type Row = {
  id: string;
  status: string;
  customer: { name?: string; email?: string; comuna?: string; region?: string } | string;
  items: { name: string; qty: number; unitPrice: number }[] | string;
  subtotal: number;
  discount: number | null;
  coupon: string | null;
  shipping: number;
  total: number;
  payment_method: string | null;
  payment_ref: string | null;
  created_at: string | Date;
  paid_at: string | Date | null;
};

const json = <T,>(v: T | string): T => (typeof v === "string" ? (JSON.parse(v) as T) : v);
const iso = (v: string | Date | null) => (v == null ? null : new Date(v).toISOString());

// Pedidos del período y del anterior (para comparar). El cálculo fino —qué cuenta como venta y a qué día pertenece—
// lo hace report-calc con la fecha de Chile; aquí solo se traen los pedidos de esa ventana.
export async function loadReport(period: Period) {
  const rows = await query<Row>(
    `SELECT id, status, customer, items, subtotal, discount, coupon, shipping, total, payment_method, payment_ref, created_at, paid_at
       FROM orders
      WHERE COALESCE(paid_at, created_at) >= $1 AND COALESCE(paid_at, created_at) < $2
      ORDER BY COALESCE(paid_at, created_at) DESC
      LIMIT 50000`,
    [period.prevFrom.toISOString(), period.to.toISOString()],
  );
  const orders: ReportOrder[] = rows.map((r) => {
    const c = json(r.customer);
    return {
      id: r.id,
      status: r.status,
      total: Number(r.total),
      subtotal: Number(r.subtotal),
      discount: Number(r.discount ?? 0),
      shipping: Number(r.shipping),
      coupon: r.coupon ?? null,
      paymentMethod: r.payment_method === "transferencia" ? "transferencia" : "tarjeta",
      paymentRef: r.payment_ref,
      createdAt: iso(r.created_at)!,
      paidAt: iso(r.paid_at),
      items: json(r.items).map((i) => ({ name: String(i.name), qty: Number(i.qty), unitPrice: Number(i.unitPrice) })),
      customer: { name: c.name ?? "", email: c.email ?? "", comuna: c.comuna ?? "", region: c.region ?? "" },
    };
  });
  return buildReport(orders, period);
}
