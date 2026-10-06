import { listAllReviews } from "@/lib/reviews";
import { getProducts } from "@/lib/catalog";
import { Stars } from "@/components/Stars";
import { removeReview, setReviewStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const tone: Record<string, string> = {
  pendiente: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  publicada: "bg-accent/15 text-accent",
  oculta: "bg-tint/10 text-muted",
};

export default async function Resenas() {
  const [reviews, products] = await Promise.all([listAllReviews(), getProducts({ includeHidden: true })]);
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-CL", { timeZone: "America/Santiago", day: "numeric", month: "short", year: "numeric" });
  const pending = reviews.filter((r) => r.status === "pendiente").length;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Reseñas</h1>
      <p className="mt-1 text-sm text-muted">
        Solo dejan reseña los compradores con pedido despachado. {pending > 0 ? `${pending} esperan tu revisión.` : "No hay reseñas pendientes."}
      </p>
      <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-900 dark:text-amber-100">
        Antes de publicar, oculta cualquier reseña que hable de usos, dosis o efectos en personas o animales: puede contradecir el aviso de uso para investigación.
      </p>

      {reviews.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay reseñas. Se invita a dejarlas en el correo de despacho.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-surface p-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars value={r.rating} className="text-base" />
                <span className="font-semibold">{nameOf(r.productSlug)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone[r.status]}`}>{r.status}</span>
                <span className="ml-auto text-xs text-muted">{r.name} · pedido {r.orderId} · {fmtDate(r.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line">{r.body || <span className="text-muted">Sin comentario</span>}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                {r.status !== "publicada" && (
                  <form action={setReviewStatusAction.bind(null, r.id, "publicada")}><button className="font-medium text-accent hover:underline">Publicar</button></form>
                )}
                {r.status !== "oculta" && (
                  <form action={setReviewStatusAction.bind(null, r.id, "oculta")}><button className="text-muted hover:underline">Ocultar</button></form>
                )}
                <form action={removeReview.bind(null, r.id)}><button className="text-red-500 hover:underline">Eliminar</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
