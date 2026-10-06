import { describeCoupon, listCoupons } from "@/lib/coupons";
import { formatCLP } from "@/lib/products";
import { removeCoupon, saveCouponAction, toggleCoupon } from "../actions";

export const dynamic = "force-dynamic";

export default async function Cupones({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const { guardado } = await searchParams;
  const coupons = await listCoupons();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Cupones</h1>
      <p className="mt-1 text-sm text-muted">
        Códigos que el cliente escribe en el checkout. Ideas: BIENVENIDA10 para la primera compra, uno distinto para Instagram
        y otro para laboratorios, así sabes de dónde llega cada venta.
      </p>
      {guardado && <p className="mt-4 rounded-lg bg-accent/10 p-3 text-sm text-accent">Cupón guardado.</p>}

      <form action={saveCouponAction} className="mt-8 grid gap-4 rounded-card border bg-surface p-5 sm:grid-cols-3">
        <label className="text-sm">Código<input name="code" required placeholder="BIENVENIDA10" className="field uppercase" /></label>
        <label className="text-sm">Tipo
          <select name="kind" className="field">
            <option value="porcentaje" className="bg-surface">Porcentaje (%)</option>
            <option value="monto" className="bg-surface">Monto fijo (CLP)</option>
          </select>
        </label>
        <label className="text-sm">Valor<input name="value" type="number" min={1} required placeholder="10" className="field" /></label>
        <label className="text-sm">Compra mínima (CLP)<input name="minSubtotal" type="number" min={0} defaultValue={0} className="field" /></label>
        <label className="text-sm">Usos máximos (vacío = sin límite)<input name="maxUses" type="number" min={1} className="field" /></label>
        <label className="text-sm">Vence el (opcional)<input name="expiresAt" type="date" className="field" /></label>
        <button className="btn-primary justify-self-start text-sm sm:col-span-3">Crear o actualizar cupón</button>
      </form>

      {coupons.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay cupones.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card border bg-surface">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>{["Código", "Descuento", "Mínimo", "Usos", "Vence", "Estado", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c) => {
                const expired = Boolean(c.expiresAt && c.expiresAt < today);
                const exhausted = c.maxUses != null && c.uses >= c.maxUses;
                return (
                  <tr key={c.code}>
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">{describeCoupon(c)}</td>
                    <td className="px-4 py-3">{c.minSubtotal ? formatCLP(c.minSubtotal) : "—"}</td>
                    <td className="px-4 py-3">{c.uses}{c.maxUses != null && ` / ${c.maxUses}`}</td>
                    <td className="px-4 py-3">{c.expiresAt ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${!c.active || expired || exhausted ? "bg-tint/10 text-muted" : "bg-accent/15 text-accent"}`}>
                        {!c.active ? "inactivo" : expired ? "vencido" : exhausted ? "agotado" : "activo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3 whitespace-nowrap text-xs">
                        <form action={toggleCoupon.bind(null, c.code, !c.active)}>
                          <button className="text-accent hover:underline">{c.active ? "Desactivar" : "Activar"}</button>
                        </form>
                        <form action={removeCoupon.bind(null, c.code)}>
                          <button className="text-red-500 hover:underline">Eliminar</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
