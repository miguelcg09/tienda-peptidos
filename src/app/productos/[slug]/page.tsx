import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatCLP } from "@/lib/products";
import { getProduct, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { faqs } from "@/lib/faqs";
import { ProductImage } from "@/components/ProductImage";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductTabs } from "@/components/ProductTabs";
import { ProductCard } from "@/components/ProductCard";

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

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const isAccessory = product.category === "Accesorios";

  const specs = [
    ["Mecanismo", product.mechanism ?? product.category],
    ["Pureza", product.purity],
    ["Forma", product.form],
    ["CAS", product.cas ?? "—"],
    ["Almacenar", product.storage ?? "2–8 °C, sin luz"],
  ];

  const tabs = [
    {
      id: "resumen",
      label: "Resumen",
      content: (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Resumen</p>
          <p className="mt-3 text-lg leading-relaxed">{product.short}</p>
          <Paragraphs text={product.description} />
          <p className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-800 dark:text-amber-200">
            <strong>Solo para uso en investigación.</strong> {settings.disclaimer}
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted sm:grid-cols-3">
            <li className="rounded-xl border bg-surface p-3">✓ Envío a todo Chile, gratis sobre {formatCLP(settings.freeShippingFrom)}</li>
            <li className="rounded-xl border bg-surface p-3">✓ Certificado de análisis del lote incluido</li>
            <li className="rounded-xl border bg-surface p-3">✓ Pago con tarjeta, Webpay o transferencia</li>
          </ul>
        </div>
      ),
    },
    {
      id: "coa",
      label: "Certificado (COA)",
      content: (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Certificado de análisis</p>
          <p className="mt-3 leading-relaxed text-muted">
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
        </div>
      ),
    },
    {
      id: "reconstitucion",
      label: "Reconstitución",
      content: (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Preparación en laboratorio</p>
          {isAccessory && !product.reconstitution ? (
            <p className="mt-3 text-muted">Este producto se usa tal como viene; no requiere reconstitución.</p>
          ) : (
            <Paragraphs text={product.reconstitution ?? defaultReconstitution} />
          )}
          <p className="mt-4 text-xs text-muted">Información técnica de manipulación. No constituye indicación de uso ni de dosis.</p>
        </div>
      ),
    },
    {
      id: "faq",
      label: "Preguntas",
      content: (
        <div className="grid gap-3">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border bg-surface p-4">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "investigacion",
      label: "Investigación",
      content: (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Líneas de investigación</p>
          <Paragraphs text={product.research ?? "Consulta la literatura científica publicada sobre este compuesto. Con gusto te orientamos sobre referencias."} />
          <p className="mt-4 text-xs text-muted">Resumen informativo de la literatura preclínica. No describe efectos en seres humanos.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade mx-auto max-w-6xl px-4 pb-36 pt-10">
      <nav className="flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent">Inicio</Link>
        <span>›</span>
        <Link href={`/productos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-accent">{product.category}</Link>
        <span>›</span>
        <span className="text-fg">{product.name}</span>
      </nav>

      <div className="mt-6">
        <ProductPurchase product={product} settings={settings} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[360px_1fr]">
        <div className="min-w-0 space-y-4">
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[2rem] border bg-surface-2">
            <ProductImage product={product} className="relative h-4/5 w-4/5" />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-2xl border bg-surface p-4 first:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="min-w-0">
          <ProductTabs tabs={tabs} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">También en {product.category}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
