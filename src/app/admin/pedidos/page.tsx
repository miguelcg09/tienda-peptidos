import { listOrders } from "@/lib/orders";
import { formatCLP } from "@/lib/products";
import { confirmTransfer, removeOrder, saveOrderNote, shipOrder } from "../actions";

export const dynamic = "force-dynamic";

const tone: Record<string, string> = {
  pagado: "bg-accent/15 text-accent",
  despachado: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  pendiente: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  fallido: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const orders = await listOrders(200);
  const fmtDate = (iso: string) => new Date(iso).toLocaleString("es-CL", { timeZone: "America/Santiago" });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Pedidos</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} pedidos, del más reciente al más antiguo.</p>
      {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">La clave no es válida.</p>}
      {orders.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay pedidos.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => {
            const deletable = o.paymentRef === "modo-prueba" || o.status === "pendiente" || o.status === "fallido";
            return (
              <details key={o.id} className="rounded-2xl border bg-surface">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-sm">
                  <span className="font-mono font-semibold">{o.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone[o.status]}`}>{o.status}</span>
                  {o.paymentMethod === "transferencia" && <span className="text-xs text-muted">transferencia</span>}
                  <span className="text-muted">{fmtDate(o.createdAt)}</span>
                  <span className="grow">{o.customer.name}</span>
                  <span className="font-semibold">{formatCLP(o.total)}</span>
                </summary>
                <div className="grid gap-6 border-t px-5 py-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="font-semibold">Cliente</p>
                    <p className="mt-1 text-muted">
                      {o.customer.name} · RUT {o.customer.rut}<br />
                      {o.customer.email} · {o.customer.phone}<br />
                      {o.customer.address}, {o.customer.comuna}, {o.customer.region}
                      {o.customer.reference && <><br />Referencia: {o.customer.reference}</>}
                    </p>
                    {o.customer.lat != null && o.customer.lng != null && (
                      <a
                        href={`https://www.google.com/maps?q=${o.customer.lat},${o.customer.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-accent hover:underline"
                      >
                        📍 Ver punto de entrega en el mapa
                      </a>
                    )}
                    {o.paymentRef && <p className="mt-2 text-xs text-muted">Ref. pago: {o.paymentRef}</p>}
                    {o.status === "despachado" && (
                      <p className="mt-2 text-xs text-muted">
                        Despachado {o.shippedAt && fmtDate(o.shippedAt)} · Seguimiento: <strong className="text-fg">{o.tracking}</strong>
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Productos</p>
                    <ul className="mt-1 space-y-1 text-muted">
                      {o.items.map((i) => (
                        <li key={i.variantId} className="flex justify-between">
                          <span>{i.name} × {i.qty}</span><span>{formatCLP(i.unitPrice * i.qty)}</span>
                        </li>
                      ))}
                      {o.discount > 0 && <li className="flex justify-between"><span>Descuento{o.coupon && ` (${o.coupon})`}</span><span>-{formatCLP(o.discount)}</span></li>}
                      <li className="flex justify-between"><span>Envío</span><span>{o.shipping ? formatCLP(o.shipping) : "Gratis"}</span></li>
                      <li className="flex justify-between font-semibold text-fg"><span>Total</span><span>{formatCLP(o.total)}</span></li>
                    </ul>
                  </div>

                  {o.status === "pendiente" && o.paymentMethod === "transferencia" && (
                    <form action={confirmTransfer} className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 md:col-span-2">
                      <input type="hidden" name="id" value={o.id} />
                      <p className="grow text-xs text-amber-900 dark:text-amber-100">
                        Pendiente de transferencia, con el stock reservado. Cuando veas el abono de <strong>{formatCLP(o.total)}</strong> en tu cuenta, confírmalo aquí y el cliente recibe la confirmación. Si no paga, anula el pedido y el stock vuelve.
                      </p>
                      <button className="btn-primary text-sm">Confirmar pago recibido</button>
                    </form>
                  )}

                  {o.status === "pagado" && (
                    <form action={shipOrder} className="flex flex-wrap items-end gap-2 rounded-xl border p-3 md:col-span-2">
                      <input type="hidden" name="id" value={o.id} />
                      <label className="grow text-xs text-muted">
                        Número de seguimiento (Chilexpress, Starken, Blue…)
                        <input name="tracking" required placeholder="Ej: 123456789" className="field" />
                      </label>
                      <button className="btn-primary text-sm">Marcar despachado y avisar al cliente</button>
                    </form>
                  )}

                  <form action={saveOrderNote} className="flex flex-wrap items-end gap-2 md:col-span-2">
                    <input type="hidden" name="id" value={o.id} />
                    <label className="grow text-xs text-muted">
                      Nota interna
                      <input name="note" defaultValue={o.note ?? ""} placeholder="Solo la ves tú" className="field" />
                    </label>
                    <button className="btn-ghost text-sm">Guardar nota</button>
                    {deletable && (
                      <button formAction={removeOrder.bind(null, o.id)} className="ml-auto text-xs text-red-500 hover:underline">
                        {o.status === "pendiente" && o.stockHeld ? "Anular pedido y liberar stock" : "Eliminar pedido"}
                      </button>
                    )}
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
