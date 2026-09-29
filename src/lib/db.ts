import "server-only";

// Acceso a la base de datos con una sola función `query`.
// - Producción: Postgres (Neon, Supabase, Vercel Postgres…) vía DATABASE_URL.
// - Desarrollo: PGlite, un Postgres embebido que guarda los datos en .data/pglite.
// El SQL es el mismo en ambos casos.

type Row = Record<string, unknown>;
type Runner = (text: string, params: unknown[]) => Promise<Row[]>;

const globalForDb = globalThis as unknown as { __runner?: Promise<Runner> };

// Nombres que usan las integraciones de Vercel (Neon, Supabase, Vercel Postgres).
const URL_VARS = ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_PRISMA_URL"] as const;

export function databaseUrlVar() {
  return URL_VARS.find((k) => process.env[k]);
}

async function createRunner(): Promise<Runner> {
  const urlVar = databaseUrlVar();
  const url = urlVar && process.env[urlVar];
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: 5, prepare: false });
    return async (text, params) => (await sql.unsafe(text, params as never[])) as unknown as Row[];
  }
  if (process.env.VERCEL) {
    throw new Error("Falta DATABASE_URL: conecta una base Postgres (Storage > Neon) y vuelve a desplegar.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir);
  return async (text, params) => (await db.query<Row>(text, params)).rows;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'pendiente',
  customer      JSONB NOT NULL,
  items         JSONB NOT NULL,
  subtotal      INTEGER NOT NULL,
  shipping      INTEGER NOT NULL,
  total         INTEGER NOT NULL,
  payment_ref   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS orders_created_at ON orders (created_at DESC);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;
CREATE TABLE IF NOT EXISTS products (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  short       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  purity      TEXT NOT NULL DEFAULT '',
  form        TEXT NOT NULL DEFAULT '',
  cas         TEXT,
  color       TEXT NOT NULL DEFAULT '#34d399',
  image_url   TEXT,
  featured    BOOLEAN NOT NULL DEFAULT false,
  visible     BOOLEAN NOT NULL DEFAULT true,
  sort        INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS variants (
  id           TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  price        INTEGER NOT NULL,
  stock        INTEGER,
  sort         INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS mechanism TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reconstitution TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS research TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS coa_url TEXT;
ALTER TABLE variants ADD COLUMN IF NOT EXISTS compare_at INTEGER;
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'tarjeta';
ALTER TABLE products ADD COLUMN IF NOT EXISTS lot TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lot_date TEXT;
CREATE TABLE IF NOT EXISTS coupons (
  code         TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  value        INTEGER NOT NULL,
  min_subtotal INTEGER NOT NULL DEFAULT 0,
  max_uses     INTEGER,
  uses         INTEGER NOT NULL DEFAULT 0,
  expires_at   TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS subscribers (
  id           SERIAL PRIMARY KEY,
  email        TEXT NOT NULL,
  source       TEXT NOT NULL DEFAULT 'boletin',
  product_slug TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, product_slug)
);
`;

async function getRunner() {
  if (!globalForDb.__runner) {
    globalForDb.__runner = createRunner()
      .then(async (run) => {
        for (const stmt of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) await run(stmt, []);
        return run;
      })
      .catch((err) => {
        globalForDb.__runner = undefined;
        throw err;
      });
  }
  return globalForDb.__runner;
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const run = await getRunner();
  return (await run(text, params)) as T[];
}
