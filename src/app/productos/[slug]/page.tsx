import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { faqs } from "@/lib/faqs";
import { showCertificates } from "@/lib/features";
import { ProductStage } from "@/components/ProductStage";
import { ProductCard } from "@/components/ProductCard";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { Stars } from "@/components/Stars";
import { listPublished } from "@/lib/reviews";
import { publicUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Producto" };
  const description = `${product.short} ${product.form}. Solo para investigación.`;
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

// Ícono de cada dato técnico de la franja de arriba
const specIcon: Record<string, IconName> = { Mecanismo: "spark", Pureza: "shield", Forma: "flask", CAS: "tag", Almacenar: "snowflake" };

function Section({ id, n, icon, title, children }: { id: string; n: number; icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-32 rounded-[1.75rem] border border-line bg-surface p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={icon} size={22} /></span>
          <h2 className="t-h2">{title}</h2>
          <span className="ml-auto font-mono text-sm text-muted">{String(n).padStart(2, "0")}</span>
        </div>
        <div className="mt-5">{children}</div>
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

  // El certificado y la pureza se muestran solo con documentos reales (ver src/lib/features.ts)
  const certs = showCertificates();
  const hasCert = certs || !!product.coaUrl;
  const off = hasCert ? 0 : -1; // si no hay sección de certificado, las demás suben un número

  const specs = [
    ["Mecanismo", product.mechanism ?? product.category],
    ...(certs ? [["Pureza", product.purity]] : []),
    ["Forma", product.form],
    ["CAS", product.cas ?? "—"],
    ["Almacenar", product.storage ?? "2–8 °C, sin luz"],
  ];

  const index = [
    { id: "resumen", label: "Resumen" },
    ...(hasCert ? [{ id: "certificado", label: "Certificado" }] : []),
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
    <div className="animate-fade wrap pb-20 pt-6 md:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Ruta de navegación" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/" className="inline-block py-1 hover:text-fg">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/productos?categoria=${encodeURIComponent(product.category)}`} className="inline-block py-1 hover:text-fg">{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span className="min-w-0 text-fg [overflow-wrap:anywhere]" aria-current="page">{product.name}</span>
      </nav>

      <ProductStage product={product} settings={settings} index={index} showCertificates={certs}>
        {/* Franja de datos técnicos */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-[1.75rem] border border-line bg-surface p-6 text-sm sm:grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))]">
          {specs.map(([k, v], i) => (
            <div key={k} className={`min-w-0 ${i === 0 ? "col-span-full border-b border-line pb-5" : ""}`}>
              <dt className="flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-widest text-muted"><Icon name={specIcon[k] ?? "flask"} size={16} className="text-accent-2" />{k}</dt>
              <dd className={`mt-1 font-medium [overflow-wrap:anywhere] ${k === "CAS" && v.length <= 14 ? "whitespace-nowrap" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>

        <Section id="resumen" n={1} icon="doc" title="Resumen">
          <p className="text-lg leading-relaxed">{product.short}</p>
          <Paragraphs text={product.description} />
          {!hasCert && product.lot && (
            <p className="mt-4 text-sm"><strong>Lote actual:</strong> <span className="font-mono">{product.lot}</span></p>
          )}
          <p className="mt-6 flex gap-3 rounded-2xl border-l-4 border-accent bg-surface-2 p-4 text-sm">
            <Icon name="shield" size={20} className="mt-0.5 shrink-0 text-accent-2" />
            <span><strong>Solo para uso en investigación.</strong> {settings.disclaimer}</span>
          </p>
        </Section>

        {hasCert && <Section id="certificado" n={2} icon="shield" title="Certificado de análisis">
          <p className="leading-relaxed text-muted">
            Cada lote se analiza por HPLC (pureza) y espectrometría de masas (identidad). El número de lote va impreso en la
            etiqueta del vial y el certificado correspondiente viaja con el pedido.
          </p>
          {product.lot && (
            <p className="mt-4 text-sm">
              <strong>Lote actual:</strong> <span className="font-mono">{product.lot}</span>
              {product.lotDate && <> · analizado el {new Date(`${product.lotDate}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</>}
              {" "}· <Link href={`/certificados?q=${encodeURIComponent(product.lot)}`} className="font-medium text-accent-2 underline-offset-4 hover:underline">verificar en Certificados</Link>
            </p>
          )}
          {product.coaUrl ? (
            <a href={product.coaUrl} target="_blank" rel="noreferrer" className="btn-primary mt-5">Ver certificado del lote actual</a>
          ) : (
            <p className="mt-5 rounded-2xl bg-surface-2 p-4 text-sm">
              ¿Quieres verlo antes de comprar? Escríbenos a{" "}
              <a href={`mailto:${settings.email}?subject=COA ${product.name}`} className="font-medium text-accent-2">{settings.email}</a>{" "}
              indicando el producto y te lo enviamos.
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[["Método de pureza", "HPLC"], ["Identidad", "Espectrometría de masas"], ["Pureza declarada", product.purity]].map(([k, v]) => (
              <div key={k} className="min-w-0 rounded-2xl bg-surface-2 p-3.5"><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 font-medium [overflow-wrap:anywhere]">{v}</dd></div>
            ))}
          </dl>
        </Section>}

        <Section id="reconstitucion" n={3 + off} icon="flask" title="Reconstitución">
          {isAccessory && !product.reconstitution ? (
            <p className="text-muted">Este producto se usa tal como viene; no requiere reconstitución.</p>
          ) : (
            <Paragraphs text={product.reconstitution ?? defaultReconstitution} />
          )}
          {!isAccessory && <p className="mt-4 text-sm"><Link href="/calculadora" className="group/calc inline-flex items-center gap-2 py-1 font-medium text-accent-2 hover:underline"><Icon name="calc" size={18} />Calcular la concentración y el volumen <Icon name="arrow" size={16} className="transition-transform group-hover/calc:translate-x-1" /></Link></p>}
          <p className="mt-4 text-xs text-muted">Información técnica de manipulación. No constituye indicación de uso ni de dosis.</p>
        </Section>

        <Section id="investigacion" n={4 + off} icon="bulb" title="Líneas de investigación">
          <Paragraphs text={product.research ?? "Consulta la literatura científica publicada sobre este compuesto. Con gusto te orientamos sobre referencias."} />
          <p className="mt-4 text-xs text-muted">Resumen informativo de la literatura preclínica. No describe efectos en seres humanos.</p>
        </Section>

        <Section id="resenas" n={5 + off} icon="quote" title="Reseñas de compradores">
          {product.rating && reviews.length > 0 ? (
            <>
              <p className="flex items-center gap-3">
                <span className="font-display text-4xl font-semibold tracking-tight">{product.rating.avg.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <span>
                  <Stars value={product.rating.avg} className="text-xl" />
                  <span className="block text-xs text-muted">{product.rating.count} {product.rating.count === 1 ? "reseña verificada" : "reseñas verificadas"}</span>
                </span>
              </p>
              <ul className="mt-5 grid gap-3">
                {reviews.map((r) => (
                  <li key={r.id} className="lift rounded-2xl bg-surface-2 p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} className="text-base" />
                      <span className="font-semibold">{r.name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-[0.8125rem] font-medium text-accent-2"><Icon name="check" size={13} />Compra verificada</span>
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

        <Section id="preguntas" n={6 + off} icon="help" title="Preguntas frecuentes">
          <div className="grid gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-surface-2 px-5 py-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-muted transition group-open:rotate-45 group-open:bg-accent group-open:text-on-accent" aria-hidden><Icon name="plus" size={16} /></span>
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </ProductStage>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="t-h2">Seguir explorando</h2>
            <Link href="/productos" className="btn-ghost group/all min-h-11 gap-2 px-5 py-2 text-sm">Ver todo el catálogo <Icon name="arrow" size={16} className="transition-transform group-hover/all:translate-x-1" /></Link>
          </div>
          <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] md:mx-0 md:px-0">
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
