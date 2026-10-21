import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { categories, type Product } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";
import { saveProduct } from "../../actions";
import { requirePage } from "@/lib/admin";

export const dynamic = "force-dynamic";

const empty: Product = {
  slug: "",
  name: "",
  category: categories[0],
  short: "",
  description: "",
  purity: "≥ 99% (HPLC)",
  form: "Polvo liofilizado",
  color: "#34d399",
  variants: [],
  featured: false,
  visible: true,
  sort: 99,
};

export default async function EditarProducto({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; slug?: string }> }) {
  await requirePage();
  const { slug } = await params;
  const { error, slug: clash } = await searchParams;
  const isNew = slug === "nuevo";
  const product = isNew ? empty : await getProduct(slug, { includeHidden: true });
  if (!product) notFound();
  const canUpload = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const rows = [...product.variants, ...Array.from({ length: Math.max(1, 4 - product.variants.length) }, () => null)];

  return (
    <div className="max-w-3xl">
      <h1 className="break-words font-display text-3xl font-bold">{isNew ? "Nuevo producto" : `Editar ${product.name}`}</h1>
      {isNew && error === "existe" && clash && (
        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200">
          No se guardó: ya existe un producto con la dirección «{clash}». Cambia el nombre, o <Link href={`/admin/productos/${clash}`} className="font-medium underline">edita el que ya existe</Link>.
        </p>
      )}

      <form action={saveProduct} className="mt-8 space-y-8">
        {!isNew && <input type="hidden" name="originalSlug" value={product.slug} />}
        <input type="hidden" name="currentImageUrl" value={product.imageUrl ?? ""} />

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Datos principales</legend>
          <label className="text-sm">Nombre<input name="name" required defaultValue={product.name} className="field" /></label>
          <label className="text-sm">Categoría
            <select name="category" defaultValue={product.category} className="field">
              {categories.map((c) => <option key={c} className="bg-surface">{c}</option>)}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">Descripción corta (en la tarjeta)<input name="short" defaultValue={product.short} className="field" /></label>
          <label className="text-sm sm:col-span-2">Descripción completa<textarea name="description" rows={4} defaultValue={product.description} className="field" /></label>
          <label className="text-sm">Pureza<input name="purity" defaultValue={product.purity} className="field" /></label>
          <label className="text-sm">Formato<input name="form" defaultValue={product.form} className="field" /></label>
          <label className="text-sm">Número CAS (opcional)<input name="cas" defaultValue={product.cas ?? ""} className="field" /></label>
          <label className="text-sm">Mecanismo (una línea)<input name="mechanism" defaultValue={product.mechanism ?? ""} placeholder="Agonista del receptor GLP-1" className="field" /></label>
          <label className="text-sm">Almacenamiento<input name="storage" defaultValue={product.storage ?? ""} placeholder="2–8 °C, sin luz" className="field" /></label>
          <label className="text-sm">Orden en el catálogo<input name="sort" type="number" defaultValue={product.sort} className="field" /></label>
          {isNew && <label className="text-sm sm:col-span-2">Dirección (opcional, se genera del nombre)<input name="slug" placeholder="bpc-157" className="field" /></label>}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-semibold">Pestañas de la ficha</legend>
          <label className="text-sm">Investigación (en qué se estudia; solo con fines informativos)
            <textarea name="research" rows={3} defaultValue={product.research ?? ""} className="field" />
          </label>
          <label className="text-sm">Reconstitución (instrucciones de laboratorio)
            <textarea name="reconstitution" rows={3} defaultValue={product.reconstitution ?? ""} className="field" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Número de lote actual (el de la etiqueta)
              <input name="lot" defaultValue={product.lot ?? ""} placeholder="HX-2409-A" className="field" />
            </label>
            <label className="text-sm">Fecha del análisis del lote
              <input name="lotDate" type="date" defaultValue={product.lotDate ?? ""} className="field" />
            </label>
          </div>
          <label className="text-sm">Enlace al certificado de análisis del lote (PDF o imagen, opcional)
            <input name="coaUrl" defaultValue={product.coaUrl ?? ""} placeholder="https://…" className="field" />
          </label>
          <p className="-mt-2 text-xs text-muted">Con lote y enlace, el producto aparece en la página pública de Certificados, donde los clientes buscan por número de lote.</p>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <legend className="mb-2 font-semibold">Imagen</legend>
          <div className="grid h-40 w-full place-items-center rounded-2xl border bg-tint/5">
            <ProductImage product={product} className="h-4/5" />
          </div>
          <div className="space-y-3 text-sm">
            {canUpload ? (
              <label className="block">Subir foto (JPG, PNG o WebP)<input name="imagen" type="file" accept="image/*" className="field" /></label>
            ) : (
              <p className="rounded-lg bg-amber-400/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                Para subir fotos desde aquí, en Vercel ve a Storage &gt; Create Database &gt; Blob y vuelve a desplegar. Mientras tanto pega un enlace.
              </p>
            )}
            <label className="block">Enlace a la imagen<input name="imageUrl" defaultValue={product.imageUrl ?? ""} placeholder="https://…" className="field" /></label>
            <label className="flex items-center gap-2">Color de la etiqueta del vial (si no hay foto)<input name="color" type="color" defaultValue={product.color} className="h-8 w-12 rounded border" /></label>
            {product.imageUrl && <label className="flex items-center gap-2"><input type="checkbox" name="quitarImagen" /> Quitar la foto y volver al vial dibujado</label>}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Presentaciones y precios</legend>
          <p className="mb-3 text-xs text-muted">
            Deja el stock vacío para no controlarlo; con 0 aparece como agotado. Si pones un precio anterior mayor al precio, la ficha muestra el descuento.
          </p>
          <div className="space-y-2">
            <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_4.5rem] gap-2 text-xs text-muted sm:grid"><span>Presentación</span><span>Precio CLP</span><span>Precio anterior</span><span>Stock</span></div>
            {rows.map((v, i) => (
              <div key={v?.id ?? `n${i}`} className="grid grid-cols-3 gap-2 border-b pb-3 sm:grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_5rem] sm:border-0 sm:pb-0">
                <input type="hidden" name="v_id" value={v?.id ?? ""} />
                <input name="v_label" aria-label="Presentación" defaultValue={v?.label ?? ""} placeholder="Presentación (5 mg)" className="field mt-0 col-span-3 sm:col-span-1" />
                <input name="v_price" type="number" min={0} aria-label="Precio en pesos" defaultValue={v?.price ?? ""} placeholder="Precio" className="field mt-0" />
                <input name="v_compare" type="number" min={0} aria-label="Precio anterior" defaultValue={v?.compareAt ?? ""} placeholder="Antes" className="field mt-0" />
                <input name="v_stock" type="number" min={0} aria-label="Stock" defaultValue={v?.stock ?? ""} placeholder="Stock" className="field mt-0" />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-wrap gap-6 text-sm">
          <legend className="mb-2 font-semibold">Visibilidad</legend>
          <label className="flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={product.visible} /> Visible en la tienda</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Destacado en el inicio</label>
        </fieldset>

        <div className="flex gap-3">
          <button className="btn-primary">Guardar</button>
          <a href="/admin/productos" className="btn-ghost">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
