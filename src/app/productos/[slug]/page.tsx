import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, products } from "@/lib/products";
import { RESEARCH_DISCLAIMER } from "@/lib/config";
import { Vial } from "@/components/Vial";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "Producto", description: product?.short };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 animate-fade">
      <nav className="text-sm text-muted">
        <Link href="/productos" className="hover:text-accent">Productos</Link> / {product.name}
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[2rem] border bg-surface">
          <div className="bg-grid absolute inset-0" />
          <div className="absolute bottom-10 left-1/2 h-1/2 w-2/3 -translate-x-1/2 rounded-full opacity-50 blur-3xl" style={{ background: product.color }} />
          <Vial color={product.color} label={product.name} className="animate-float relative h-4/5" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted">{product.category}</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-muted">{product.description}</p>
          <div className="mt-6">
            <AddToCart product={product} />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border p-5 text-sm">
            <div><dt className="text-muted">Pureza</dt><dd className="font-medium">{product.purity}</dd></div>
            <div><dt className="text-muted">Formato</dt><dd className="font-medium">{product.form}</dd></div>
            {product.cas && <div><dt className="text-muted">CAS</dt><dd className="font-medium">{product.cas}</dd></div>}
            <div><dt className="text-muted">Almacenamiento</dt><dd className="font-medium">2–8 °C, protegido de la luz</dd></div>
          </dl>
          <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-200">
            <strong>Solo para investigación.</strong> {RESEARCH_DISCLAIMER}
          </p>
        </div>
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
