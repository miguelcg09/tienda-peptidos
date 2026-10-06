import { listSubscribers } from "@/lib/subscribers";
import { getProducts } from "@/lib/catalog";
import { removeSubscriber } from "../actions";

export const dynamic = "force-dynamic";

export default async function Suscriptores() {
  const [subs, products] = await Promise.all([listSubscribers(), getProducts({ includeHidden: true })]);
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  const fmtDate = (iso: string) => new Date(iso).toLocaleString("es-CL", { timeZone: "America/Santiago", dateStyle: "medium", timeStyle: "short" });
  const boletin = subs.filter((s) => s.source === "boletin").length;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Suscriptores</h1>
          <p className="mt-1 text-sm text-muted">
            {boletin} en el boletín y {subs.length - boletin} esperando que vuelva un producto. A los de "avísame" se les escribe solo cuando repones stock.
          </p>
        </div>
        {subs.length > 0 && <a href="/admin/suscriptores/csv" className="btn-ghost text-sm">Descargar CSV</a>}
      </div>

      {subs.length === 0 ? (
        <p className="mt-10 text-muted">Todavía nadie ha dejado su correo.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-card border bg-surface">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>{["Correo", "Origen", "Fecha", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.source === "stock" ? `Avísame: ${nameOf(s.productSlug)}` : "Boletín"}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={removeSubscriber.bind(null, s.id)}>
                      <button className="text-xs text-red-500 hover:underline">Eliminar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
