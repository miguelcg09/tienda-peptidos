import "server-only";
import { query } from "./db";

// Reseñas de compradores verificados: solo se puede opinar de un producto de un pedido despachado,
// con el correo con que se compró, y cada reseña se publica recién cuando la aprueban en /admin/resenas.
export type ReviewStatus = "pendiente" | "publicada" | "oculta";
export type Review = {
  id: number;
  productSlug: string;
  orderId: string;
  name: string; // "Ana P." (nombre y apellido abreviado, tomado del pedido)
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

type Row = { id: number; product_slug: string; order_id: string; name: string; rating: number; body: string; status: string; created_at: string | Date };

const toReview = (r: Row): Review => ({
  id: Number(r.id),
  productSlug: r.product_slug,
  orderId: r.order_id,
  name: r.name,
  rating: Number(r.rating),
  body: r.body,
  status: (["pendiente", "publicada", "oculta"].includes(r.status) ? r.status : "pendiente") as ReviewStatus,
  createdAt: new Date(r.created_at).toISOString(),
});

// "Ana Pérez Soto" → "Ana P."
export function displayName(full: string) {
  const [first = "Cliente", second] = full.trim().split(/\s+/);
  return second ? `${first} ${second[0].toUpperCase()}.` : first;
}

// Devuelve null si ese pedido ya tenía reseña de ese producto.
export async function createReview(input: { productSlug: string; orderId: string; name: string; rating: number; body: string }) {
  const [row] = await query<Row>(
    `INSERT INTO reviews (product_slug, order_id, name, rating, body) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (order_id, product_slug) DO NOTHING RETURNING *`,
    [input.productSlug, input.orderId, input.name, input.rating, input.body],
  );
  return row ? toReview(row) : null;
}

export async function reviewedSlugs(orderId: string) {
  return (await query<{ product_slug: string }>("SELECT product_slug FROM reviews WHERE order_id = $1", [orderId])).map((r) => r.product_slug);
}

export async function listPublished(productSlug: string, limit = 20) {
  return (await query<Row>("SELECT * FROM reviews WHERE status = 'publicada' AND product_slug = $1 ORDER BY created_at DESC LIMIT $2", [productSlug, limit])).map(toReview);
}

export async function latestPublished(limit = 6) {
  return (await query<Row>("SELECT * FROM reviews WHERE status = 'publicada' AND length(body) >= 20 ORDER BY created_at DESC LIMIT $1", [limit])).map(toReview);
}

export async function listAllReviews() {
  return (await query<Row>("SELECT * FROM reviews ORDER BY (status = 'pendiente') DESC, created_at DESC LIMIT 300")).map(toReview);
}

export async function pendingReviewCount() {
  const [row] = await query<{ n: number }>("SELECT count(*)::int AS n FROM reviews WHERE status = 'pendiente'");
  return Number(row?.n ?? 0);
}

export async function setReviewStatus(id: number, status: ReviewStatus) {
  await query("UPDATE reviews SET status = $2 WHERE id = $1", [id, status]);
}

export async function deleteReview(id: number) {
  await query("DELETE FROM reviews WHERE id = $1", [id]);
}

// Promedio y cantidad de reseñas publicadas por producto (para las estrellas de tarjetas y fichas).
export async function ratingSummary(slug?: string): Promise<Record<string, { avg: number; count: number }>> {
  const rows = await query<{ product_slug: string; avg: number | string; n: number | string }>(
    `SELECT product_slug, AVG(rating)::float AS avg, count(*)::int AS n FROM reviews
     WHERE status = 'publicada' ${slug ? "AND product_slug = $1" : ""} GROUP BY product_slug`,
    slug ? [slug] : [],
  );
  return Object.fromEntries(rows.map((r) => [r.product_slug, { avg: Number(r.avg), count: Number(r.n) }]));
}
