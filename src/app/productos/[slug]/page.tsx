import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { faqs } from "@/lib/faqs";
import { ProductStage } from "@/components/ProductStage";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Producto", description: product?.short };
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
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
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
    { id: "preguntas", label: "Preguntas" },
  ];

  return (
    <div className="animate-fade mx-auto max-w-6xl px-4 pb-24 pt-8">
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
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">{k}</dt>
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
          <p className="mt-4 text-xs text-muted">Información técnica de manipulación. No constituye indicación de uso ni de dosis.</p>
        </Section>

        <Section id="investigacion" n={4} title="Líneas de investigación">
          <Paragraphs text={product.research ?? "Consulta la literatura científica publicada sobre este compuesto. Con gusto te orientamos sobre referencias."} />
          <p className="mt-4 text-xs text-muted">Resumen informativo de la literatura preclínica. No describe efectos en seres humanos.</p>
        </Section>

        <Section id="preguntas" n={5} title="Preguntas frecuentes">
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
