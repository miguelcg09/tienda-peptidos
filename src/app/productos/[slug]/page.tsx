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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm text-slate-500">
        <Link href="/productos" className="hover:text-brand">Productos</Link> / {product.name}
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="grid aspect-square place-items-center rounded-3xl bg-mist">
          <Vial color={product.color} label={product.name} className="h-4/5" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{product.category}</p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-slate-600">{product.description}</p>
          <div className="mt-6">
            <AddToCart product={product} />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border p-5 text-sm">
            <div><dt className="text-slate-500">Pureza</dt><dd className="font-medium">{product.purity}</dd></div>
            <div><dt className="text-slate-500">Formato</dt><dd className="font-medium">{product.form}</dd></div>
            {product.cas && <div><dt className="text-slate-500">CAS</dt><dd className="font-medium">{product.cas}</dd></div>}
            <div><dt className="text-slate-500">Almacenamiento</dt><dd className="font-medium">2–8 °C, protegido de la luz</dd></div>
          </dl>
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
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
