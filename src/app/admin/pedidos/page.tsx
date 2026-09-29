import type { Metadata } from "next";
import { cookies } from "next/headers";
import { listOrders } from "@/lib/orders";
import { formatCLP } from "@/lib/products";

export const metadata: Metadata = { title: "Pedidos", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Vista privada de pedidos: /admin/pedidos pide la clave (ADMIN_PASSWORD) y la recuerda 30 días.
export default async function Pedidos({ searchParams }: { searchParams: Promise<{ clave?: string; error?: string }> }) {
  const { clave, error } = await searchParams;
  const password = process.env.ADMIN_PASSWORD;
  const cookie = (await cookies()).get("admin")?.value;
  const allowed = Boolean(password) && (cookie === password || clave === password);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Acceso privado</h1>
        <p className="mt-3 text-sm text-muted">
          {!password
            ? "Configura ADMIN_PASSWORD para habilitar esta página."
            : error || clave
              ? "La clave no es válida."
              : "Escribe la clave de administrador para ver los pedidos."}
        </p>
        <form method="post" action="/admin/pedidos/entrar" className="mt-6 flex gap-2">
          <input name="clave" type="password" placeholder="Clave" autoFocus className="field mt-0" />
          <button className="btn-primary text-sm">Entrar</button>
        </form>
      </div>
    );
  }

  const orders = await listOrders(200);
  const tone: Record<string, string> = {
    pagado: "bg-accent/15 text-accent",
    pendiente: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
    fallido: "bg-red-500/15 text-red-600 dark:text-red-300",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Pedidos</h1>
          <p className="mt-1 text-sm text-muted">{orders.length} pedidos, del más reciente al más antiguo.</p>
        </div>
        <form method="post" action="/admin/pedidos/salir">
          <button className="btn-ghost text-sm">Salir</button>
        </form>
      </div>
      {orders.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay pedidos.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <details key={o.id} className="rounded-2xl border bg-surface">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-sm">
                <span className="font-mono font-semibold">{o.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone[o.status]}`}>{o.status}</span>
                <span className="text-muted">{new Date(o.createdAt).toLocaleString("es-CL", { timeZone: "America/Santiago" })}</span>
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
                  </p>
                  {o.paymentRef && <p className="mt-2 text-xs text-muted">Ref. pago: {o.paymentRef}</p>}
                </div>
                <div>
                  <p className="font-semibold">Productos</p>
                  <ul className="mt-1 space-y-1 text-muted">
                    {o.items.map((i) => (
                      <li key={i.variantId} className="flex justify-between">
                        <span>{i.name} × {i.qty}</span><span>{formatCLP(i.unitPrice * i.qty)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between"><span>Envío</span><span>{o.shipping ? formatCLP(o.shipping) : "Gratis"}</span></li>
                    <li className="flex justify-between font-semibold text-fg"><span>Total</span><span>{formatCLP(o.total)}</span></li>
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
