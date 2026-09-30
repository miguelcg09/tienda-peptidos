import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { faqs } from "@/lib/faqs";
import { ProductStage } from "@/components/ProductStage";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Stars } from "@/components/Stars";
import { listPublished } from "@/lib/reviews";
import { publicUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Producto" };
  const description = `${product.short} ${product.purity}, ${product.form.toLowerCase()}. Certificado de análisis por lote. Solo para investigación.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: { type: "website", title: product.name, description, ...(product.imageUrl ? { images: [product.imageUrl] } : {}) },
  };
}

const defaultReconstitution =
  "Deja el vial a temperatura ambiente unos minutos. Agrega el diluyente lentamente por la pared del vial, sin apuntar al polvo, y gira suavemente hasta disolver; no agites. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className="mt-3 leading-relaxed text-muted first:mt-0">{p}</p>
      ))}
    </>
  );
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-32 border-t py-10 first:border-t-0 first:pt-0">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-accent">{String(n).padStart(2, "0")}</span>
          <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        </div>
        <div className="mt-5 md:pl-10">{children}</div>
      </section>
    </Reveal>
  );
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [products, settings, reviews] = await Promise.all([getProducts(), getSettings(), listPublished(product.slug)]);
  const related = products.filter((p) => p.slug !== product.slug).sort((a, b) => (a.category === product.category ? -1 : 1) - (b.category === product.category ? -1 : 1)).slice(0, 6);
  const isAccessory = product.category === "Accesorios";

  const specs = [
    ["Mecanismo", product.mechanism ?? product.category],
    ["Pureza", product.purity],
    ["Forma", product.form],
    ["CAS", product.cas ?? "—"],
    ["Almacenar", product.storage ?? "2–8 °C, sin luz"],
  ];

  const index = [
    { id: "resumen", label: "Resumen" },
    { id: "certificado", label: "Certificado" },
    { id: "reconstitucion", label: "Reconstitución" },
    { id: "investigacion", label: "Investigación" },
    { id: "resenas", label: "Reseñas" },
    { id: "preguntas", label: "Preguntas" },
  ];

  // Datos estructurados para Google (ficha de producto con precios por presentación)
  const siteUrl = publicUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short,
    category: product.category,
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    brand: { "@type": "Brand", name: settings.name },
    ...(product.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.rating.avg.toFixed(1)), reviewCount: product.rating.count } } : {}),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: `${product.name} ${v.label}`,
      sku: v.id,
      price: v.price,
      priceCurrency: "CLP",
      availability: v.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/productos/${product.slug}`,
    })),
  };

  return (
    <div className="animate-fade mx-auto max-w-6xl px-4 pb-24 pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-5 flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Inicio</Link>
        <span>/</span>
        <Link href={`/productos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-accent">{product.category}</Link>
        <span>/</span>
        <span className="text-fg">{product.name}</span>
      </nav>

      <ProductStage product={product} settings={settings} index={index}>
        {/* Franja de datos técnicos */}
        <dl className="mb-10 grid grid-cols-2 gap-y-4 rounded-2xl border bg-surface p-5 text-sm sm:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] sm:divide-x sm:gap-y-0">
          {specs.map(([k, v]) => (
            <div key={k} className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
              <dt className="text-[0.8125rem] font-semibold uppercase tracking-widest text-muted">{k}</dt>
              <dd className="mt-1 font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <Section id="resumen" n={1} title="Resumen">
          <p className="text-lg leading-relaxed">{product.short}</p>
          <Paragraphs text={product.description} />
          <p className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-800 dark:text-amber-200">
            <strong>Solo para uso en investigación.</strong> {settings.disclaimer}
          </p>
        </Section>

        <Section id="certificado" n={2} title="Certificado de análisis">
          <p className="leading-relaxed text-muted">
            Cada lote se analiza por HPLC (pureza) y espectrometría de masas (identidad). El número de lote va impreso en la
            etiqueta del vial y el certificado correspondiente viaja con el pedido.
          </p>
          {product.lot && (
            <p className="mt-4 text-sm">
              <strong>Lote actual:</strong> <span className="font-mono">{product.lot}</span>
              {product.lotDate && <> · analizado el {new Date(`${product.lotDate}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</>}
              {" "}· <Link href={`/certificados?q=${encodeURIComponent(product.lot)}`} className="text-accent hover:underline">verificar en Certificados</Link>
            </p>
          )}
          {product.coaUrl ? (
            <a href={product.coaUrl} target="_blank" rel="noreferrer" className="btn-primary mt-5">Ver certificado del lote actual</a>
          ) : (
            <p className="mt-5 rounded-2xl border bg-surface p-4 text-sm">
              ¿Quieres verlo antes de comprar? Escríbenos a{" "}
              <a href={`mailto:${settings.email}?subject=COA ${product.name}`} className="font-medium text-accent">{settings.email}</a>{" "}
              indicando el producto y te lo enviamos.
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[["Método de pureza", "HPLC"], ["Identidad", "Espectrometría de masas"], ["Pureza declarada", product.purity]].map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-surface p-3"><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
            ))}
          </dl>
        </Section>

        <Section id="reconstitucion" n={3} title="Reconstitución">
          {isAccessory && !product.reconstitution ? (
            <p className="text-muted">Este producto se usa tal como viene; no requiere reconstitución.</p>
          ) : (
            <Paragraphs text={product.reconstitution ?? defaultReconstitution} />
          )}
          {!isAccessory && <p className="mt-4 text-sm"><Link href="/calculadora" className="text-accent hover:underline">Calcular la concentración y el volumen →</Link></p>}
          <p className="mt-4 text-xs text-muted">Información técnica de manipulación. No constituye indicación de uso ni de dosis.</p>
        </Section>

        <Section id="investigacion" n={4} title="Líneas de investigación">
          <Paragraphs text={product.research ?? "Consulta la literatura científica publicada sobre este compuesto. Con gusto te orientamos sobre referencias."} />
          <p className="mt-4 text-xs text-muted">Resumen informativo de la literatura preclínica. No describe efectos en seres humanos.</p>
        </Section>

        <Section id="resenas" n={5} title="Reseñas de compradores">
          {product.rating && reviews.length > 0 ? (
            <>
              <p className="flex items-center gap-3">
                <span className="font-display text-4xl font-bold">{product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span>
                  <Stars value={product.rating.avg} className="text-xl" />
                  <span className="block text-xs text-muted">{product.rating.count} {product.rating.count === 1 ? "reseña verificada" : "reseñas verificadas"}</span>
                </span>
              </p>
              <ul className="mt-5 grid gap-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border bg-surface p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} className="text-base" />
                      <span className="font-semibold">{r.name}</span>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[0.8125rem] font-medium text-accent">Compra verificada</span>
                      <span className="ml-auto text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("es-CL", { timeZone: "America/Santiago", day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    {r.body && <p className="mt-2 whitespace-pre-line text-muted">{r.body}</p>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted">Aún no hay reseñas de este producto.</p>
          )}
          <p className="mt-4 text-xs text-muted">
            Solo dejan reseña quienes compraron: te invitamos por correo cuando tu pedido sale despachado. Revisamos cada reseña antes de publicarla.
          </p>
        </Section>

        <Section id="preguntas" n={6} title="Preguntas frecuentes">
          <div className="grid gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border bg-surface p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {f.q}
                  <span className="text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </ProductStage>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Seguir explorando</h2>
            <Link href="/productos" className="text-sm text-accent hover:underline">Ver todo el catálogo →</Link>
          </div>
          <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {related.map((p) => (
              <div key={p.slug} className="w-[240px] shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
