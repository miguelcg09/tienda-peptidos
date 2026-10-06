import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { formatCLP } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";
import { removeProduct, toggleProductVisible } from "../actions";

export const dynamic = "force-dynamic";

export default async function Productos() {
  const products = await getProducts({ includeHidden: true });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted">{products.length} productos. Los ocultos no se muestran en la tienda.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary text-sm">+ Nuevo producto</Link>
      </div>

      <div className="mt-8 space-y-3">
        {products.map((p) => (
          <div key={p.slug} className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-surface p-4 ${p.visible ? "" : "opacity-60"}`}>
            <div className="grid h-16 w-12 shrink-0 place-items-center rounded-lg bg-tint/5">
              <ProductImage product={p} className="h-full w-full" />
            </div>
            <div className="min-w-0 grow">
              <p className="font-semibold">
                {p.name}
                {p.featured && <span className="ml-2 rounded-full bg-accent-2/15 px-2 py-0.5 text-[0.8125rem] font-semibold uppercase text-accent-2">Destacado</span>}
                {!p.visible && <span className="ml-2 rounded-full bg-tint/10 px-2 py-0.5 text-[0.8125rem] font-semibold uppercase text-muted">Oculto</span>}
              </p>
              <p className="text-xs text-muted">{p.category} · orden {p.sort}</p>
              <p className="mt-1 text-sm text-muted">
                {p.variants.map((v) => `${v.label} ${formatCLP(v.price)}${v.stock != null ? ` (stock ${v.stock})` : ""}`).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/productos/${p.slug}`} className="btn-ghost text-sm">Editar</Link>
              <form action={toggleProductVisible.bind(null, p.slug, !p.visible)}>
                <button className="btn-ghost text-sm">{p.visible ? "Ocultar" : "Mostrar"}</button>
              </form>
              <form action={removeProduct.bind(null, p.slug)}>
                <button className="px-2 text-xs text-red-500 hover:underline">Borrar</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
