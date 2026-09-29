import "server-only";
import { query } from "./db";
import { seedProducts, type Category, type Product, type Variant } from "./products";

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  short: string;
  description: string;
  purity: string;
  form: string;
  cas: string | null;
  color: string;
  image_url: string | null;
  mechanism: string | null;
  storage: string | null;
  reconstitution: string | null;
  research: string | null;
  coa_url: string | null;
  featured: boolean;
  visible: boolean;
  sort: number;
};

type VariantRow = {
  id: string;
  product_slug: string;
  label: string;
  price: number;
  compare_at: number | null;
  stock: number | null;
  sort: number;
};

let seeded = false;

// La primera vez que la base está vacía se carga el catálogo de ejemplo.
async function ensureSeeded() {
  if (seeded) return;
  const [{ n }] = await query<{ n: number }>("SELECT count(*)::int AS n FROM products");
  if (Number(n) === 0) {
    for (const p of seedProducts) {
      await upsertProduct(p);
      await setVariants(p.slug, p.variants);
    }
  }
  seeded = true;
}

function toProduct(r: ProductRow, variants: VariantRow[]): Product {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category as Category,
    short: r.short,
    description: r.description,
    purity: r.purity,
    form: r.form,
    cas: r.cas ?? undefined,
    color: r.color,
    imageUrl: r.image_url ?? undefined,
    mechanism: r.mechanism ?? undefined,
    storage: r.storage ?? undefined,
    reconstitution: r.reconstitution ?? undefined,
    research: r.research ?? undefined,
    coaUrl: r.coa_url ?? undefined,
    featured: r.featured,
    visible: r.visible,
    sort: Number(r.sort),
    variants: variants
      .filter((v) => v.product_slug === r.slug)
      .sort((a, b) => a.sort - b.sort)
      .map((v) => ({
        id: v.id,
        label: v.label,
        price: Number(v.price),
        compareAt: v.compare_at == null ? null : Number(v.compare_at),
        stock: v.stock == null ? null : Number(v.stock),
      })),
  };
}

export async function getProducts(opts: { includeHidden?: boolean } = {}): Promise<Product[]> {
  await ensureSeeded();
  const rows = await query<ProductRow>(
    `SELECT * FROM products ${opts.includeHidden ? "" : "WHERE visible"} ORDER BY sort, name`,
  );
  const variants = await query<VariantRow>("SELECT * FROM variants");
  return rows.map((r) => toProduct(r, variants));
}

export async function getProduct(slug: string, opts: { includeHidden?: boolean } = {}) {
  await ensureSeeded();
  const [row] = await query<ProductRow>("SELECT * FROM products WHERE slug = $1", [slug]);
  if (!row || (!row.visible && !opts.includeHidden)) return null;
  const variants = await query<VariantRow>("SELECT * FROM variants WHERE product_slug = $1", [slug]);
  return toProduct(row, variants);
}

export async function findVariant(variantId: string) {
  await ensureSeeded();
  const [v] = await query<VariantRow>("SELECT * FROM variants WHERE id = $1", [variantId]);
  if (!v) return undefined;
  const product = await getProduct(v.product_slug);
  if (!product) return undefined;
  const variant = product.variants.find((x) => x.id === variantId)!;
  return { product, variant };
}

export async function upsertProduct(p: Omit<Product, "variants">) {
  await query(
    `INSERT INTO products (slug, name, category, short, description, purity, form, cas, color, image_url, featured, visible, sort,
                           mechanism, storage, reconstitution, research, coa_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name, category = EXCLUDED.category, short = EXCLUDED.short, description = EXCLUDED.description,
       purity = EXCLUDED.purity, form = EXCLUDED.form, cas = EXCLUDED.cas, color = EXCLUDED.color,
       image_url = EXCLUDED.image_url, featured = EXCLUDED.featured, visible = EXCLUDED.visible, sort = EXCLUDED.sort,
       mechanism = EXCLUDED.mechanism, storage = EXCLUDED.storage, reconstitution = EXCLUDED.reconstitution,
       research = EXCLUDED.research, coa_url = EXCLUDED.coa_url`,
    [
      p.slug, p.name, p.category, p.short, p.description, p.purity, p.form, p.cas ?? null, p.color, p.imageUrl ?? null,
      Boolean(p.featured), p.visible, p.sort,
      p.mechanism ?? null, p.storage ?? null, p.reconstitution ?? null, p.research ?? null, p.coaUrl ?? null,
    ],
  );
}

// Reemplaza las presentaciones del producto conservando los ids existentes (los carritos guardados siguen válidos).
export async function setVariants(slug: string, variants: Variant[]) {
  const ids = variants.map((v) => v.id);
  if (ids.length === 0) {
    await query("DELETE FROM variants WHERE product_slug = $1", [slug]);
    return;
  }
  await query(`DELETE FROM variants WHERE product_slug = $1 AND NOT (id = ANY($2::text[]))`, [slug, ids]);
  for (const [i, v] of variants.entries()) {
    await query(
      `INSERT INTO variants (id, product_slug, label, price, compare_at, stock, sort) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, price = EXCLUDED.price, compare_at = EXCLUDED.compare_at,
         stock = EXCLUDED.stock, sort = EXCLUDED.sort`,
      [v.id, slug, v.label, v.price, v.compareAt, v.stock, i],
    );
  }
}

export async function setProductVisible(slug: string, visible: boolean) {
  await query("UPDATE products SET visible = $2 WHERE slug = $1", [slug, visible]);
}

export async function deleteProduct(slug: string) {
  await query("DELETE FROM products WHERE slug = $1", [slug]);
}

// Descuenta stock de las presentaciones con control de stock (stock no nulo).
export async function decrementStock(items: { variantId: string; qty: number }[]) {
  for (const it of items) {
    await query("UPDATE variants SET stock = GREATEST(stock - $2, 0) WHERE id = $1 AND stock IS NOT NULL", [it.variantId, it.qty]);
  }
}
