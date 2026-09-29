import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatCLP } from "@/lib/products";
import { getProduct, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { ProductImage } from "@/components/ProductImage";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Producto", description: product?.short };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 animate-fade">
      <nav className="text-sm text-muted">
        <Link href="/productos" className="hover:text-accent">Productos</Link> / {product.name}
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_380px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-muted">{product.short}</p>

          <div className="relative mt-8 grid h-72 place-items-center overflow-hidden rounded-[2rem] border bg-surface-2 md:h-96">
            <ProductImage product={product} className="animate-float relative h-4/5 w-4/5" />
            <span className="absolute left-4 top-4 rounded-full border bg-surface/70 px-3 py-1 text-xs font-semibold text-lime backdrop-blur">
              {product.purity}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              ["Pureza", product.purity],
              ["Formato", product.form],
              ["CAS", product.cas ?? "—"],
              ["Almacenar", "2–8 °C, sin luz"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border bg-surface p-4">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-10 font-display text-xl font-bold">Descripción</h2>
          <p className="mt-3 text-muted">{product.description}</p>
        </div>

        <aside className="h-fit space-y-4 md:sticky md:top-32">
          <div className="glass rounded-3xl p-6">
            <AddToCart product={product} />
            <ul className="mt-5 space-y-2 border-t pt-4 text-xs text-muted">
              <li>✓ Envío a todo Chile, gratis sobre {formatCLP(settings.freeShippingFrom)}</li>
              <li>✓ Certificado de análisis del lote incluido</li>
              <li>✓ Pago con tarjeta, Webpay o transferencia</li>
            </ul>
          </div>
          <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-800 dark:text-amber-200">
            <strong>Solo para investigación.</strong> {settings.disclaimer}
          </p>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold">Productos relacionados</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
