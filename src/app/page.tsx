import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CatalogTabs } from "@/components/CatalogTabs";
import { HomeHero, type HeroItem } from "@/components/HomeHero";
import { ProductCard } from "@/components/ProductCard";
import { Stars } from "@/components/Stars";
import { faqs } from "@/lib/faqs";
import { latestPublished, ratingSummary } from "@/lib/reviews";
import { whatsappLink } from "@/lib/whatsapp";
import { publicUrl } from "@/lib/site";

// Con pocos productos se muestran todos juntos; con más, se agrega el filtro por línea de investigación.
const SHOW_ALL_UP_TO = 8;
const HERO_MAX = 6;

const eyebrow = "font-mono text-xs uppercase tracking-[0.14em] text-muted";
const h2 = "mt-3 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-none tracking-[-0.03em]";

// Pasos del seguimiento que ve el comprador (ejemplo ilustrativo).
const tracking = [
  { label: "Pedido recibido", state: "done" },
  { label: "Preparando tu pedido", state: "done" },
  { label: "Despachado", state: "now", note: "Seguimiento con número del courier" },
  { label: "Entregado", state: "next" },
] as const;

export default async function Home() {
  const [products, settings, reviews, ratings] = await Promise.all([getProducts(), getSettings(), latestPublished(6), ratingSummary()]);
  if (!products.length) return <p className="p-12 text-center text-muted">Aún no hay productos publicados.</p>;

  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? "";
  // La portada muestra hasta seis piezas (las destacadas primero); la colección de abajo las trae todas.
  const hero = [...products].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, HERO_MAX);
  const items: HeroItem[] = hero.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    color: p.color,
    imageUrl: p.imageUrl,
    lot: p.lot,
    form: p.form,
    format: p.variants[0]?.label ?? "",
    from: Math.min(...p.variants.map((v) => v.price)),
    multi: p.variants.length > 1,
  }));
  const wa = whatsappLink(settings.whatsapp, "Hola, tengo una consulta sobre un producto.");
  const contactHref = wa || `mailto:${settings.email}`;
  const totalReviews = Object.values(ratings).reduce((n, r) => n + r.count, 0);
  const avgReviews = totalReviews ? Object.values(ratings).reduce((n, r) => n + r.avg * r.count, 0) / totalReviews : 0;

  const site = publicUrl();
  const orgLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.name,
        url: site,
        logo: `${site}/icons/icon-512.png`,
        description: settings.tagline,
        ...(settings.email && !settings.email.endsWith("@ejemplo.cl") ? { email: settings.email } : {}),
        ...(settings.instagram ? { sameAs: [settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`] } : {}),
      },
      {
        "@type": "WebSite",
        name: settings.name,
        url: site,
        inLanguage: "es-CL",
        potentialAction: { "@type": "SearchAction", target: `${site}/productos?q={search_term_string}`, "query-input": "required name=search_term_string" },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

      <HomeHero items={items} total={products.length} />

      {/* La colección: todas las piezas juntas */}
      <section id="coleccion" aria-labelledby="titulo-coleccion" className="scroll-mt-4">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-24 md:px-12 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h2 id="titulo-coleccion" className="font-display text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-none tracking-[-0.03em]">La colección</h2>
            <p className="max-w-[40ch] text-lg text-muted">
              {products.length === 1 ? "Una pieza" : `${products.length} piezas`}, cada una con su número de lote impreso en el vial.
            </p>
          </div>
          {products.length > SHOW_ALL_UP_TO ? (
            <CatalogTabs products={products} />
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-testid="catalogo-portada">
              {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Opiniones de compradores verificados: solo con al menos tres reseñas con comentario */}
      {reviews.length >= 3 && (
        <section id="opiniones" aria-labelledby="titulo-opiniones" className="mx-auto max-w-[1280px] px-4 pb-24 md:px-12 md:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Opiniones</p>
              <h2 id="titulo-opiniones" className={h2}>Compradores verificados</h2>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Stars value={avgReviews} className="text-lg" />
              <span><strong className="text-fg">{avgReviews.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong> de 5 · {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}</span>
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-card bg-surface p-6">
                <Stars value={r.rating} className="text-lg" />
                <blockquote className="mt-3 grow text-base text-muted">“{r.body}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span> · {nameOf(r.productSlug)} · <span className="font-mono text-xs uppercase tracking-wider text-muted">Compra verificada</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Después de comprar: el despacho */}
      <section id="despacho" aria-labelledby="titulo-despacho" className="scroll-mt-4 bg-[#0b0f10] text-[#f4f6f6] dark:border-y dark:border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-16 gap-y-14 px-4 py-24 md:px-12 md:py-28">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-7">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9aa7ab]">Después de comprar</p>
            <h2 id="titulo-despacho" className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-light leading-[0.98] tracking-[-0.035em]">
              Un vial. Un lote. Un despacho.
            </h2>
            <p className="max-w-[38ch] text-lg leading-relaxed text-[#c4ced1]">
              Cada pedido sale con número de seguimiento a todo Chile. Si algo llega dañado, avísanos dentro de 48 horas y lo resolvemos.
            </p>
            <p className="text-sm text-[#9aa7ab]">{settings.shippingNote}</p>
          </div>
          <div className="flex min-w-0 flex-[1_1_380px] justify-center">
            <div className="w-full max-w-[460px] rounded-card bg-[#151b1d] p-7 pb-8" aria-label="Ejemplo de seguimiento de un pedido">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm tracking-wider">PEDIDO HX-10482</span>
                <span className="rounded-[3px] bg-[#f4f6f6] px-2.5 py-1 font-mono text-[0.7rem] tracking-widest text-[#0b0f10]">EJEMPLO</span>
              </div>
              <ol className="mt-7 flex flex-col">
                {tracking.map((t, i) => {
                  const last = i === tracking.length - 1;
                  const line = t.state === "done" ? "border-[#f4f6f6]" : t.state === "now" ? "border-[#3a4548]" : "border-transparent";
                  return (
                    <li key={t.label} className={`relative border-l-2 pl-6 ${last ? "" : "pb-7"} ${line}`} aria-current={t.state === "now" ? "step" : undefined}>
                      <span
                        aria-hidden
                        className={`absolute rounded-full ${
                          t.state === "now" ? "-left-[9px] top-0.5 h-4 w-4 border-[3px] border-[#f4f6f6] bg-[#0b0f10]"
                          : t.state === "done" ? "-left-[7px] top-1 h-3 w-3 bg-[#f4f6f6]"
                          : "-left-[7px] top-1 h-3 w-3 border-2 border-[#5e6a6e]"
                        }`}
                      />
                      <p className={`text-lg ${t.state === "now" ? "font-semibold" : "font-medium"} ${t.state === "next" ? "text-[#7c898d]" : ""}`}>{t.label}</p>
                      {"note" in t && <p className="pt-1.5 font-mono text-xs text-[#c4ced1]">{t.note}</p>}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes: la primera abierta */}
      <section id="faq" aria-labelledby="titulo-faq" className="mx-auto max-w-3xl scroll-mt-4 px-4 py-24 md:py-28">
        <p className={eyebrow}>Antes de comprar</p>
        <h2 id="titulo-faq" className={h2}>Preguntas frecuentes</h2>
        <div className="mt-10 divide-y rounded-card bg-surface" data-testid="faq-portada">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {f.q}
                <span className="font-mono text-xl transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          ¿Otra duda? <a href={contactHref} className="font-medium text-fg underline underline-offset-4">Escríbenos</a> y te respondemos.
        </p>
      </section>
    </>
  );
}
