import { listAllReviews } from "@/lib/reviews";
import { getProducts } from "@/lib/catalog";
import { Stars } from "@/components/Stars";
import { removeReview, setReviewStatusAction } from "../actions";
import { ConfirmButton } from "../ConfirmButton";
import { requirePage } from "@/lib/admin";

export const dynamic = "force-dynamic";

const tone: Record<string, string> = {
  pendiente: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  publicada: "bg-surface-2 text-accent-2",
  oculta: "bg-tint/10 text-muted",
};

export default async function Resenas() {
  await requirePage();
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
              <div className="mt-2 flex flex-wrap gap-1">
                {r.status !== "publicada" && (
                  <form action={setReviewStatusAction.bind(null, r.id, "publicada")}><button className="inline-flex min-h-10 items-center px-3 text-sm font-medium text-accent-2 hover:underline">Publicar</button></form>
                )}
                {r.status !== "oculta" && (
                  <form action={setReviewStatusAction.bind(null, r.id, "oculta")}><button className="inline-flex min-h-10 items-center px-3 text-sm text-muted hover:underline">Ocultar</button></form>
                )}
                <form action={removeReview.bind(null, r.id)}><ConfirmButton message="¿Eliminar esta reseña? No se puede deshacer. Si solo quieres sacarla de la tienda, usa «Ocultar»." className="inline-flex min-h-10 items-center px-3 text-sm text-red-700 hover:underline dark:text-red-300">Eliminar</ConfirmButton></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
