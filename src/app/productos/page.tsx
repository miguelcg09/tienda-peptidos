import Link from "next/link";
import type { Metadata } from "next";
import { categories, products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Productos" };

export default async function Productos({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const list = categoria ? products.filter((p) => p.category === categoria) : products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Productos</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/productos" className={`rounded-full border px-4 py-1.5 text-sm ${!categoria ? "border-brand bg-brand text-white" : "hover:border-brand"}`}>
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/productos?categoria=${encodeURIComponent(c)}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${categoria === c ? "border-brand bg-brand text-white" : "hover:border-brand"}`}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  );
}
