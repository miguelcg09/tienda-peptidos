import { bucketKeys, bucketLabel, bucketOf, dayKey, stamp, type Group, type Period } from "./period";
import type { Cell } from "./csv";

// Cálculo de los reportes de ventas. Módulo puro: recibe pedidos ya leídos y devuelve números.
//
// Qué cuenta como venta: pedidos pagados o despachados, fechados el día en que se pagaron (si no hay fecha de pago,
// el día en que se crearon). No cuentan los pendientes (aún no hay dinero), los fallidos ni los pedidos del modo
// de prueba. Los pedidos anulados se eliminan del sistema, así que tampoco suman.

export type ReportOrder = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  coupon: string | null;
  paymentMethod: string;
  paymentRef: string | null;
  createdAt: string;
  paidAt: string | null;
  items: { name: string; qty: number; unitPrice: number }[];
  customer: { name: string; email: string; comuna: string; region: string };
};

export const isTest = (o: ReportOrder) => o.paymentRef === "modo-prueba";
export const isSale = (o: ReportOrder) => (o.status === "pagado" || o.status === "despachado") && !isTest(o);
export const saleAt = (o: ReportOrder) => o.paidAt ?? o.createdAt;
export const unitsOf = (o: ReportOrder) => o.items.reduce((n, i) => n + i.qty, 0);

export type Totals = { revenue: number; orders: number; units: number; discount: number; shipping: number; avgTicket: number };

export function totals(sales: ReportOrder[]): Totals {
  let revenue = 0, units = 0, discount = 0, shipping = 0;
  for (const o of sales) {
    revenue += o.total;
    units += unitsOf(o);
    discount += o.discount;
    shipping += o.shipping;
  }
  return { revenue, orders: sales.length, units, discount, shipping, avgTicket: sales.length ? Math.round(revenue / sales.length) : 0 };
}

// Variación porcentual contra el período anterior. null si no hay con qué comparar.
export function pctChange(cur: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export type SeriesPoint = { key: string; short: string; long: string; revenue: number; orders: number; units: number };
export type ProductRow = { name: string; units: number; orders: number; revenue: number };
export type PaymentRow = { method: string; orders: number; revenue: number };
export type CouponRow = { code: string; orders: number; discount: number };

export type Report = {
  period: Period;
  current: Totals;
  previous: Totals;
  series: SeriesPoint[];
  products: ProductRow[];
  payments: PaymentRow[];
  coupons: CouponRow[];
  pending: { orders: number; amount: number };
  testOrders: number;
  sales: ReportOrder[]; // ventas del período, la más reciente primero
};

const inRange = (k: string, from: string, to: string) => k >= from && k <= to;

export function buildReport(orders: ReportOrder[], period: Period): Report {
  const { fromKey, toKey, prevFromKey, prevToKey, group } = period;
  const sales = orders.filter(isSale);
  const cur = sales.filter((o) => inRange(dayKey(saleAt(o)), fromKey, toKey));
  const prev = sales.filter((o) => inRange(dayKey(saleAt(o)), prevFromKey, prevToKey));

  const byBucket = new Map<string, SeriesPoint>();
  for (const key of bucketKeys(fromKey, toKey, group)) {
    const l = bucketLabel(key, group);
    byBucket.set(key, { key, short: l.short, long: l.long, revenue: 0, orders: 0, units: 0 });
  }
  const products = new Map<string, ProductRow>();
  const payments = new Map<string, PaymentRow>();
  const coupons = new Map<string, CouponRow>();
  for (const o of cur) {
    const b = byBucket.get(bucketOf(dayKey(saleAt(o)), group));
    if (b) {
      b.revenue += o.total;
      b.orders += 1;
      b.units += unitsOf(o);
    }
    for (const i of o.items) {
      const p = products.get(i.name) ?? { name: i.name, units: 0, orders: 0, revenue: 0 };
      p.units += i.qty;
      p.revenue += i.qty * i.unitPrice;
      p.orders += 1;
      products.set(i.name, p);
    }
    const pay = payments.get(o.paymentMethod) ?? { method: o.paymentMethod, orders: 0, revenue: 0 };
    pay.orders += 1;
    pay.revenue += o.total;
    payments.set(o.paymentMethod, pay);
    if (o.coupon && o.discount > 0) {
      const c = coupons.get(o.coupon) ?? { code: o.coupon, orders: 0, discount: 0 };
      c.orders += 1;
      c.discount += o.discount;
      coupons.set(o.coupon, c);
    }
  }

  const pendingOrders = orders.filter((o) => o.status === "pendiente" && !isTest(o) && inRange(dayKey(o.createdAt), fromKey, toKey));
  return {
    period,
    current: totals(cur),
    previous: totals(prev),
    series: [...byBucket.values()],
    products: [...products.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue || a.name.localeCompare(b.name, "es")),
    payments: [...payments.values()].sort((a, b) => b.revenue - a.revenue),
    coupons: [...coupons.values()].sort((a, b) => b.discount - a.discount),
    pending: { orders: pendingOrders.length, amount: pendingOrders.reduce((n, o) => n + o.total, 0) },
    testOrders: orders.filter((o) => isTest(o) && (o.status === "pagado" || o.status === "despachado") && inRange(dayKey(saleAt(o)), fromKey, toKey)).length,
    sales: [...cur].sort((a, b) => saleAt(b).localeCompare(saleAt(a)) || b.id.localeCompare(a.id)),
  };
}

// ---- Tablas para descargar (la primera fila es el encabezado)

export const GROUP_COLUMN: Record<Group, string> = { dia: "Fecha", semana: "Semana (lunes)", mes: "Mes" };

export function seriesRows(r: Report): Cell[][] {
  return [
    [GROUP_COLUMN[r.period.group], "Pedidos", "Unidades", "Ingresos (CLP)", "Ticket promedio (CLP)"],
    ...r.series.map((s) => [s.key, s.orders, s.units, s.revenue, s.orders ? Math.round(s.revenue / s.orders) : 0]),
    ["Total", r.current.orders, r.current.units, r.current.revenue, r.current.avgTicket],
  ];
}

export function productRows(r: Report): Cell[][] {
  const units = r.current.units || 1;
  return [
    ["Producto", "Unidades", "Pedidos", "Ventas antes de descuentos (CLP)", "% de las unidades"],
    ...r.products.map((p) => [p.name, p.units, p.orders, p.revenue, Math.round((p.units / units) * 1000) / 10]),
  ];
}

export function orderRows(r: Report): Cell[][] {
  return [
    ["Pedido", "Fecha de pago", "Estado", "Cliente", "Correo", "Comuna", "Región", "Productos", "Unidades", "Subtotal (CLP)", "Descuento (CLP)", "Cupón", "Envío (CLP)", "Total (CLP)", "Medio de pago"],
    ...r.sales.map((o) => [
      o.id,
      stamp(saleAt(o)),
      o.status,
      o.customer.name,
      o.customer.email,
      o.customer.comuna,
      o.customer.region,
      o.items.map((i) => `${i.name} × ${i.qty}`).join(" | "),
      unitsOf(o),
      o.subtotal,
      o.discount,
      o.coupon ?? "",
      o.shipping,
      o.total,
      o.paymentMethod,
    ]),
  ];
}

// Para nombrar los archivos descargados.
export const fileStem = (kind: string, p: Period) => `helix-${kind}_${p.fromKey}_a_${p.toKey}`;
