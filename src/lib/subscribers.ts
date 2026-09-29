import "server-only";
import { query } from "./db";

// Correos que dejan los visitantes: boletín (pie de página) o "avísame cuando vuelva" (ficha agotada).
export type Subscriber = { id: number; email: string; source: string; productSlug: string; createdAt: string };
type Row = { id: number; email: string; source: string; product_slug: string; created_at: string | Date };

const toSub = (r: Row): Subscriber => ({
  id: Number(r.id),
  email: r.email,
  source: r.source,
  productSlug: r.product_slug,
  createdAt: new Date(r.created_at).toISOString(),
});

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

// Devuelve true si es un registro nuevo (false si ese correo ya estaba anotado para ese producto).
export async function addSubscriber(email: string, source: string, productSlug = "") {
  const rows = await query<Row>(
    `INSERT INTO subscribers (email, source, product_slug) VALUES ($1, $2, $3) ON CONFLICT (email, product_slug) DO NOTHING RETURNING *`,
    [email.trim().toLowerCase(), source, productSlug],
  );
  return rows.length > 0;
}

export async function listSubscribers() {
  return (await query<Row>("SELECT * FROM subscribers ORDER BY created_at DESC")).map(toSub);
}

export async function deleteSubscriber(id: number) {
  await query("DELETE FROM subscribers WHERE id = $1", [id]);
}

export async function stockWatchers(productSlug: string) {
  return (await query<Row>("SELECT * FROM subscribers WHERE source = 'stock' AND product_slug = $1", [productSlug])).map(toSub);
}

export async function clearStockWatchers(productSlug: string) {
  await query("DELETE FROM subscribers WHERE source = 'stock' AND product_slug = $1", [productSlug]);
}
