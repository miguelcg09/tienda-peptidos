import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/Reveal";
import { CatalogTabs } from "@/components/CatalogTabs";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { HeroSearch } from "@/components/HeroSearch";
import { CertificateExplorer } from "@/components/CertificateExplorer";
import { Newsletter } from "@/components/Newsletter";
import { faqs } from "@/lib/faqs";
import { latestPublished, ratingSummary } from "@/lib/reviews";
import { Stars } from "@/components/Stars";
import { formatCLP } from "@/lib/products";
import { hasBankData } from "@/lib/config";
import { cardProviderName } from "@/lib/payments";
import { whatsappLink } from "@/lib/whatsapp";
import { publicUrl } from "@/lib/site";

// Con pocos productos se muestran todos juntos; con más, se agrega el filtro por línea de investigación.
const SHOW_ALL_UP_TO = 8;

const labSteps = [
  { title: "Se analiza el lote", text: "Pureza por HPLC e identidad por espectrometría de masas." },
  { title: "Se rotula con su número", text: "El mismo número de lote va impreso en cada vial." },
  { title: "El certificado viaja contigo", text: "Llega dentro del pedido, para que lo compares con tu etiqueta." },
];

const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-accent";
const h2 = "sweep mt-2 font-display text-3xl font-bold md:text-4xl";

export default async function Home() {
  const [products, settings, reviews, ratings] = await Promise.all([getProducts(), getSettings(), latestPublished(6), ratingSummary()]);
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? "";
  const spotlight = products.find((p) => p.featured) ?? products[0];
  if (!spotlight) return <p className="p-12 text-center text-muted">Aún no hay productos publicados.</p>;

  const card = cardProviderName() !== null;
  const transfer = hasBankData(settings);
  const payLabel = card && transfer ? "Transferencia o tarjeta" : card ? "Tarjeta o Webpay" : transfer ? "Transferencia bancaria" : "Pedido por WhatsApp o correo";
  const wa = whatsappLink(settings.whatsapp, "Hola, tengo una consulta sobre un producto.");
  const contactHref = wa || `mailto:${settings.email}`;
  const totalReviews = Object.values(ratings).reduce((n, r) => n + r.count, 0);
  const avgReviews = totalReviews ? Object.values(ratings).reduce((n, r) => n + r.avg * r.count, 0) / totalReviews : 0;
  const fromPrice = Math.min(...spotlight.variants.map((v) => v.price));

  const trust = [
    { fig: "≥ 98%", label: "Pureza medida por HPLC", href: "/certificados" },
    { fig: "Cada lote", label: "Certificado de análisis propio", href: "/certificados" },
    { fig: "Todo Chile", label: `Despacho con seguimiento · Gratis sobre ${formatCLP(settings.freeShippingFrom)}`, href: "/envios" },
    { fig: "En pesos", label: payLabel, href: "/guias" },
  ];
  const buySteps = [
    { title: "Elige y paga en pesos", text: `${payLabel}, sin crear una cuenta.` },
    { title: "Despachamos con seguimiento", text: settings.shippingNote },
    { title: "Recibe el vial con su certificado", text: "Embalaje protector y el informe del lote. Si algo llega dañado, avísanos dentro de 48 horas y lo resolvemos." },
  ];

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

      {/* 1. Hero: quién es el público, qué se promete y qué hacer ahora */}
      <section className="hero-spot relative overflow-hidden border-b bg-surface-2" data-spot>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div>
            <Reveal>
              <p className={eyebrow}>Para quienes investigan</p>
            </Reveal>
            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.05] tracking-tight min-[420px]:text-4xl sm:text-5xl md:text-6xl">
              {"Péptidos de grado investigación, verificados lote por lote".split(" ").map((w, i) => (
                <span key={`${w}-${i}`}>
                  <span className="word-wrap">
                    <span className="word-in" style={{ animationDelay: `${100 + i * 70}ms` }}>{w}</span>
                  </span>{" "}
                </span>
              ))}
            </h1>
            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-lg text-muted">
                Pureza medida por HPLC, certificado de análisis con cada pedido y despacho con seguimiento a todo Chile.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#catalogo" className="btn-primary">Ver catálogo</Link>
                <Link href="/certificados" className="btn-ghost">Buscar un certificado por lote</Link>
              </div>
              <HeroSearch />
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs text-muted">
                <span className="pulse-dot" aria-hidden /> Solo para uso en investigación · Mayores de 18 años
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="relative mx-auto w-full max-w-md pb-8">
              <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[calc(var(--r-card)*1.5)] border bg-gradient-to-br from-surface to-surface-2 shadow-lg">
                <ProductImage product={spotlight} className="h-[78%] w-[78%]" />
              </div>
              <div className="absolute -bottom-0 -left-2 w-56 -rotate-3 rounded-card border bg-surface p-4 shadow-lg sm:-left-6" aria-hidden>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold">Certificado de análisis</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.8125rem] font-semibold text-accent">OK</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs">
                  <dt className="text-muted">Lote</dt><dd className="text-right font-medium">HX-2409-A</dd>
                  <dt className="text-muted">Pureza</dt><dd className="text-right font-medium text-accent">99,4%</dd>
                </dl>
              </div>
              <Link
                href={`/productos/${spotlight.slug}`}
                className="absolute right-0 top-3 rounded-full border bg-surface/90 px-3 py-1.5 text-xs font-medium shadow backdrop-blur transition hover:border-accent"
              >
                {spotlight.name} · desde {formatCLP(fromPrice)} →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Franja de pruebas: lo prometido, en hechos */}
      <section aria-label="Garantías" className="border-b bg-surface">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4" data-testid="franja-pruebas">
          {trust.map((t) => (
            <li key={t.fig} className="border-b border-r last:border-r-0 lg:border-b-0 [&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r">
              <Link href={t.href} className="block h-full px-4 py-5 transition hover:bg-surface-2 md:px-6">
                <span className="block font-display text-2xl font-bold">{t.fig}</span>
                <span className="mt-1 block text-sm text-muted">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Catálogo guiado: elegir sin salir de la portada */}
      <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrow}>Catálogo</p>
            <h2 className={h2}>Elige tu péptido</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            {products.length} {products.length === 1 ? "producto" : "productos"}, cada uno con su pureza, presentaciones y certificado de lote en la ficha.
          </p>
        </Reveal>
        <div className="mt-10">
          {products.length > SHOW_ALL_UP_TO ? (
            <CatalogTabs products={products} />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" data-testid="catalogo-portada">
              {products.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* 4. Prueba de calidad: el certificado como producto */}
      <section id="calidad" className="band relative scroll-mt-28 py-20">
        <div className="relative mx-auto grid max-w-6xl items-start gap-12 px-4 md:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <p className={eyebrow}>Cómo verificamos</p>
            <h2 className={h2}>El certificado de cada lote, a la vista</h2>
            <p className="mt-5 max-w-xl text-muted">
              Antes de despachar, cada lote se analiza. El informe lleva el mismo número que va impreso en tu vial, así puedes comprobar que corresponde a lo que recibiste.
            </p>
            <ol className="mt-6 space-y-3">
              {labSteps.map((st, i) => (
                <li key={st.title} className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-bold text-accent">{i + 1}</span>
                  <span><strong className="font-semibold">{st.title}.</strong> <span className="text-muted">{st.text}</span></span>
                </li>
              ))}
            </ol>
            <form action="/certificados" method="get" className="mt-8 max-w-md" data-testid="buscador-lote">
              <label htmlFor="lote-q" className="text-sm font-medium">¿Ya tienes un lote? Búscalo</label>
              <div className="mt-2 flex gap-2">
                <input id="lote-q" name="q" placeholder="Ej: HX-2409-A" className="field mt-0 flex-1" />
                <button className="btn-primary shrink-0 px-5">Buscar mi lote</button>
              </div>
            </form>
            <Link href="/guias#leer-un-coa" className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline">Cómo leer un certificado →</Link>
          </Reveal>
          <Reveal delay={120}>
            <CertificateExplorer product={spotlight.name} />
          </Reveal>
        </div>
      </section>

      {/* 5. Cómo funciona la compra */}
      <section id="compra" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <p className={eyebrow}>Después de elegir</p>
          <h2 className={h2}>Así es comprar y recibir</h2>
        </Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {buySteps.map((st, i) => (
            <Reveal key={st.title} delay={i * 90} className="h-full">
              <li className="flex h-full gap-4 rounded-card border bg-surface p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 font-display font-bold text-on-accent">{i + 1}</span>
                <div>
                  <p className="font-semibold">{st.title}</p>
                  <p className="mt-1 text-sm text-muted">{st.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-card border bg-surface-2 p-5">
            <p className="text-sm text-muted">
              Envío {formatCLP(settings.shippingCost)} · <strong className="text-fg">gratis sobre {formatCLP(settings.freeShippingFrom)}</strong>
            </p>
            <form action="/pedido" method="get" className="flex w-full max-w-md items-end gap-2" data-testid="seguir-pedido-portada">
              <label className="grow text-sm font-medium" htmlFor="orden-q">
                ¿Ya compraste? Sigue tu pedido
                <input id="orden-q" name="orden" placeholder="Número de pedido" className="field mt-1" />
              </label>
              <button className="btn-ghost shrink-0 px-5">Seguir</button>
            </form>
          </div>
        </Reveal>
      </section>

      {/* 6. Opiniones de compradores verificados: solo con al menos tres reseñas con comentario */}
      {reviews.length >= 3 && (
        <section className="mx-auto max-w-6xl px-4 pb-4" id="opiniones">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Opiniones</p>
              <h2 className={h2}>Compradores verificados</h2>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Stars value={avgReviews} className="text-lg" />
              <span><strong className="text-fg">{avgReviews.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong> de 5 · {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}</span>
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r, i) => (
              <Reveal key={r.id} delay={i * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-card border bg-surface p-5">
                  <Stars value={r.rating} className="text-lg" />
                  <blockquote className="mt-3 grow text-sm text-muted">“{r.body}”</blockquote>
                  <figcaption className="mt-4 text-xs">
                    <span className="font-semibold">{r.name}</span> · {nameOf(r.productSlug)} · <span className="text-accent">Compra verificada</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 7. Preguntas frecuentes: la primera abierta */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <p className={eyebrow}>Antes de comprar</p>
          <h2 className={h2}>Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-8 divide-y rounded-card border bg-surface" data-testid="faq-portada">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-accent transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          ¿Otra duda? <a href={contactHref} className="font-medium text-accent underline-offset-4 hover:underline">Escríbenos</a> y te respondemos.
        </p>
      </section>

      {/* 8. Cierre: una acción principal y una salida suave */}
      <section id="cierre" className="mx-auto max-w-6xl px-4 pb-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[calc(var(--r-card)*1.5)] bg-gradient-to-br from-accent to-[color-mix(in_oklab,var(--color-accent)_55%,#000)] px-6 py-12 text-on-accent md:flex md:items-center md:justify-between md:gap-10 md:px-12">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Verificado lote por lote, en pesos y desde Chile</h2>
              <p className="mt-3 opacity-90">Elige tu péptido y recíbelo con el certificado de su lote.</p>
              <Link href="#catalogo" className="btn-primary mt-7">Ver catálogo</Link>
            </div>
            <div className="mt-10 max-w-sm rounded-card bg-surface p-5 text-fg md:mt-0 md:w-[22rem]">
              <p className="font-semibold">Avísame de nuevos lotes</p>
              <p className="mt-1 text-sm text-muted">Un correo cuando haya lotes nuevos o cupones. Sin spam.</p>
              <div className="mt-3"><Newsletter source="boletin" cta="Avísame" done="Listo: te avisaremos de nuevos lotes." compact /></div>
              <p className="mt-4 border-t pt-3 text-sm text-muted">
                ¿No ves lo que buscas? <a href={contactHref} className="font-medium text-accent underline-offset-4 hover:underline">Escríbenos</a>, cotizamos a pedido.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
