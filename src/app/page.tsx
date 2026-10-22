import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CatalogTabs } from "@/components/CatalogTabs";
import { HomeHero, type HeroItem } from "@/components/HomeHero";
import { ProductCard } from "@/components/ProductCard";
import { CatalogCta } from "@/components/CatalogCta";
import { SectionHead } from "@/components/SectionHead";
import { ProductImage } from "@/components/ProductImage";
import { Stars } from "@/components/Stars";
import { faqs } from "@/lib/faqs";
import { latestPublished, ratingSummary } from "@/lib/reviews";
import { whatsappLink } from "@/lib/whatsapp";
import { publicUrl } from "@/lib/site";
import { formatCLP } from "@/lib/products";

// Con pocos productos se muestran todos juntos; con más, se agrega el filtro por línea de investigación.
const SHOW_ALL_UP_TO = 8;
const HERO_MAX = 6;

const words = ["Cero", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"];

const h2 = "mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1] tracking-[-0.04em]";
// Rejilla de tabla: filete de tinta arriba, filetes finos entre celdas (cada celda trae los suyos a la derecha y abajo).
const table = "grid border-l border-t border-l-rule border-t-fg";
const tcell = "border-b border-r border-rule";

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
    formats: p.variants.map((v) => v.label).join(" / "),
    cas: p.cas,
  }));
  const wa = whatsappLink(settings.whatsapp, "Hola, tengo una consulta sobre un producto.");
  const contactHref = wa || `mailto:${settings.email}`;
  // La línea de despacho sale de Ajustes: se muestra su primera frase y el envío gratis aparte.
  const dispatch = settings.shippingNote.split("·")[0].trim();
  const realEmail = settings.email && !settings.email.endsWith("@ejemplo.cl") ? settings.email : "";
  let sec = 0;
  const next = () => String(++sec).padStart(2, "0");
  const n = products.length;
  const countWord = words[n] ?? String(n);
  const proofs: { label: string; title: string; text: string; href: string; link: string }[] = [
    { label: "Envío", title: "Con seguimiento", text: "Cada pedido sale con número de seguimiento a todo Chile.", href: "/pedido", link: "Seguir mi pedido" },
    { label: "Pago", title: "En pesos", text: "Pagas en pesos chilenos, por transferencia bancaria.", href: "/guias#como-comprar", link: "Cómo comprar" },
    { label: "Despacho", title: "Mismo día hábil", text: `${dispatch}. Envío gratis sobre ${formatCLP(settings.freeShippingFrom)}.`, href: "/envios", link: "Envíos y devoluciones" },
    { label: "Si llega dañado", title: "48 horas", text: "Si tu pedido llega dañado, escríbenos dentro de 48 horas con tu número de pedido.", href: "/envios", link: "Envíos y devoluciones" },
  ];
  const steps: { title: string; text: string }[] = [
    { title: "Elige y agrega al carrito.", text: "No necesitas crear una cuenta. Pedimos nombre, RUT, contacto y dirección de despacho." },
    { title: "Paga en pesos.", text: "Por transferencia bancaria: te mostramos los datos al confirmar y guardamos tu pedido 48 horas mientras transfieres." },
    { title: "Recibe con seguimiento.", text: "Cuando despachamos, te enviamos el número de seguimiento por correo. También lo ves en “Seguir mi pedido”." },
  ];
  const facts = [
    ["Despacho", dispatch],
    ["Entrega", "1 a 3 días hábiles en la Región Metropolitana. 2 a 6 en regiones."],
    ["Costo", `${formatCLP(settings.shippingCost)}. Gratis sobre ${formatCLP(settings.freeShippingFrom)}.`],
    ["Embalaje", "Viales sellados, en un embalaje protector y discreto. Refrigéralos al recibir."],
  ];
  const closing = hero[0];
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

      <HomeHero items={items} />

      {/* Cuatro hechos de compra, cada uno con su enlace */}
      <section aria-labelledby="titulo-datos" className="border-b border-fg">
        <div className="wrap py-10 md:py-14">
          <SectionHead n={next()} label="Cómo compras" />
          <h2 id="titulo-datos" className="sr-only">Cómo compras</h2>
          <ul className={`${table} mt-8 sm:grid-cols-2 lg:grid-cols-4`}>
            {proofs.map((x) => (
              <li key={x.title} className={`${tcell} flex flex-col items-start gap-3 p-5 sm:p-6`}>
                <p className="label">{x.label}</p>
                <h3 className="font-display text-[1.75rem] font-medium leading-tight tracking-tight">{x.title}</h3>
                <p className="text-muted">{x.text}</p>
                <Link href={x.href} className="mt-auto inline-flex min-h-11 items-center pt-2 text-sm font-medium u-link">{x.link}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* La colección: todas las piezas juntas */}
      <section id="coleccion" aria-labelledby="titulo-coleccion" className="scroll-mt-4 border-b border-fg">
        <div className="wrap flex flex-col gap-10 py-14 md:py-20">
          <SectionHead n={next()} label="Catálogo" />
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <h2 id="titulo-coleccion" className={`${h2} mt-0 max-w-[22ch]`}>
              {n === 1 ? "Un compuesto de investigación" : `${countWord} compuestos de investigación`}, con su precio a la vista.
            </h2>
            <p className="max-w-[28ch] text-lg text-muted">Todos los precios incluyen IVA. Si algo se agota, lo marcamos.</p>
          </div>
          {products.length > SHOW_ALL_UP_TO ? (
            <CatalogTabs products={products} contactHref={contactHref} />
          ) : (
            <div className="cell-grid" data-testid="catalogo-portada">
              {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
              <CatalogCta href={contactHref} />
            </div>
          )}
          <Link href="/productos" className="self-start text-base font-medium u-link">Ver {n === 1 ? "el producto" : `los ${n} productos`}</Link>
        </div>
      </section>

      {/* Opiniones de compradores verificados: solo con al menos tres reseñas con comentario */}
      {reviews.length >= 3 && (
        <section id="opiniones" aria-labelledby="titulo-opiniones" className="border-b border-fg">
          <div className="wrap flex flex-col gap-10 py-14 md:py-20">
            <SectionHead n={next()} label="Opiniones" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="titulo-opiniones" className={`${h2} mt-0`}>Compradores verificados</h2>
                <p className="mt-4 text-lg text-muted">Solo opinan quienes recibieron su pedido.</p>
              </div>
              <p className="flex items-center gap-2 text-sm text-muted">
                <Stars value={avgReviews} className="text-lg" />
                <span><strong className="font-mono text-fg">{avgReviews.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong> de 5 · {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}</span>
              </p>
            </div>
            <div className={`${table} md:grid-cols-3`}>
              {reviews.slice(0, 3).map((r) => (
                <figure key={r.id} className={`${tcell} flex h-full flex-col bg-surface p-6`}>
                  <Stars value={r.rating} className="text-lg" />
                  <blockquote className="mt-3 grow text-base">“{r.body}”</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold">{r.name}</span> · {nameOf(r.productSlug)} · <span className="label">Compra verificada</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Después de comprar: qué pasa tras el pago */}
      <section id="despacho" aria-labelledby="titulo-despacho" className="scroll-mt-4 border-b border-fg">
        <div className="wrap flex flex-col gap-12 py-14 md:py-20">
          <SectionHead n={next()} label="Después de comprar" />
          <div className="flex flex-col gap-4">
            <h2 id="titulo-despacho" className={`${h2} mt-0`}>Qué pasa después de pagar</h2>
            <p className="text-lg text-muted">Tres pasos. Sin cuenta. Con seguimiento.</p>
          </div>

          <ol className={`${table} md:grid-cols-3`} data-testid="pasos-compra">
            {steps.map((st, i) => (
              <li key={st.title} className={`${tcell} flex flex-col gap-4 p-6 md:p-8`}>
                <p className="font-display text-6xl font-medium leading-none tracking-[-0.05em]"><span className="sr-only">Paso </span>{i + 1}</p>
                <h3 className="text-2xl font-medium leading-snug tracking-tight">{st.title}</h3>
                <p className="max-w-[44ch] text-muted">{st.text}</p>
              </li>
            ))}
          </ol>

          <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex min-w-0 flex-col gap-8">
              <dl className="border-t border-fg">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid gap-x-6 gap-y-1 border-b border-rule py-4 sm:grid-cols-[8rem_1fr]">
                    <dt className="label pt-1">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3 text-muted">
                <p>
                  <span className="font-medium text-fg">¿Llegó dañado?</span> Escríbenos dentro de 48 horas con tu número de pedido. Los reembolsos se hacen por el mismo medio de pago.{" "}
                  <Link href="/envios" className="text-fg u-link">Ver envíos y devoluciones</Link>
                </p>
                {(wa || realEmail) && (
                  <p>
                    ¿Dudas antes de pagar? Escríbenos por {wa ? <>WhatsApp al <a href={wa} className="text-fg u-link">{settings.whatsapp}</a></> : null}
                    {wa && realEmail ? " o a " : null}
                    {realEmail ? <a href={`mailto:${realEmail}`} className="text-fg u-link">{realEmail}</a> : null}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-8">
              <div className="w-full border border-fg bg-surface" role="group" aria-label="Ejemplo de seguimiento de un pedido">
                <div className="flex items-center justify-between gap-3 border-b border-fg px-5 py-3">
                  <span className="font-mono text-sm tracking-wider">PEDIDO HX-10482</span>
                  <span className="border border-fg px-2 py-0.5 font-mono text-xs tracking-widest">EJEMPLO</span>
                </div>
                <ol className="flex flex-col p-6 pb-7">
                  {tracking.map((t, i) => {
                    const last = i === tracking.length - 1;
                    const line = t.state === "done" ? "border-fg" : t.state === "now" ? "border-dashed border-line-2" : "border-transparent";
                    return (
                      <li key={t.label} className={`relative border-l-2 pl-6 ${last ? "" : "pb-7"} ${line}`} aria-current={t.state === "now" ? "step" : undefined}>
                        <span
                          aria-hidden="true"
                          className={`absolute ${
                            t.state === "now" ? "-left-[10px] top-0.5 h-[18px] w-[18px] border-2 border-fg bg-signal"
                            : t.state === "done" ? "-left-[7px] top-1 h-3 w-3 bg-fg"
                            : "-left-[7px] top-1 h-3 w-3 border-2 border-line-2"
                          }`}
                        />
                        <p className={`text-lg ${t.state === "now" ? "font-semibold" : "font-medium"} ${t.state === "next" ? "text-muted" : ""}`}>{t.label}</p>
                        {"note" in t && <p className="pt-1.5 font-mono text-xs text-muted">{t.note}</p>}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <form action="/pedido" method="get" className="flex flex-col gap-3" data-testid="seguir-pedido">
                <label htmlFor="seguir-orden" className="label">Número de pedido</label>
                <div className="flex flex-wrap gap-3">
                  <input
                    id="seguir-orden"
                    name="orden"
                    required
                    autoComplete="off"
                    placeholder="Ej.: HX-10482"
                    className="field mt-0 min-h-14 min-w-0 flex-1 basis-48 text-base"
                  />
                  <button className="btn-primary min-h-14 px-8 text-base">Seguir mi pedido</button>
                </div>
                <p className="text-sm text-muted">Con tu correo ves también el número de seguimiento del courier.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes: la primera abierta */}
      <section id="faq" aria-labelledby="titulo-faq" className="wrap scroll-mt-4 py-14 md:py-20">
        <SectionHead n={next()} label="Preguntas frecuentes" />
        <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 id="titulo-faq" className={`${h2} mt-0`}>Lo que más preguntan antes de comprar</h2>
            <p className="mt-4 text-lg text-muted">Respuestas cortas. Si falta la tuya, escríbenos.</p>
            <p className="mt-6 text-sm">
              <a href={contactHref} className="inline-flex min-h-11 items-center font-medium text-fg u-link">¿Otra duda? Escríbenos</a>
            </p>
          </div>
          <div className="self-start border-t border-fg" data-testid="faq-portada">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border-b border-rule px-1 py-5 transition-colors hover:bg-surface sm:px-4">
                <summary className="flex cursor-pointer list-none items-baseline gap-4 text-lg font-medium">
                  <span className="font-mono text-xs font-normal text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">{f.q}</span>
                  <span className="font-mono text-xl transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 pl-9 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre: un bloque de tinta con una acción para quien decidió y una salida suave para quien aún no compra */}
      <section aria-labelledby="titulo-cierre" data-field className="bg-[#111111] text-[#f6f6f4] dark:bg-surface-2 dark:text-fg">
        <div className="wrap grid items-center gap-x-16 gap-y-10 pb-12 pt-16 md:grid-cols-[1.2fr_0.8fr] md:pt-24">
          <div className="flex min-w-0 flex-col items-start gap-7">
            <p className="label flex items-center gap-2.5 text-[#f6f6f4] dark:text-fg"><span className="mark" aria-hidden="true" />{settings.name}</p>
            <h2 id="titulo-cierre" className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
              Péptidos de investigación, en pesos y con seguimiento a todo Chile.
            </h2>
            <p className="max-w-[44ch] text-xl">Elige tu compuesto, paga en pesos y sigue tu pedido con su número de seguimiento.</p>
            <a href="#coleccion" className="inline-flex min-h-14 items-center bg-signal px-8 text-base font-semibold text-[#111111] transition-colors hover:bg-[#f6f6f4]">
              Ver catálogo
            </a>
          </div>
          <div className="flex justify-center">
            <ProductImage product={closing} tone="field" className="h-[300px] w-auto max-w-full md:h-[400px]" />
          </div>
        </div>
        <div className="wrap">
          <p className="border-t border-current/30 py-8 pb-16 text-sm md:pb-20">
            ¿No ves el compuesto que buscas? <a href={contactHref} className="font-medium u-link">Escríbenos</a> y vemos si podemos incluirlo.
          </p>
        </div>
      </section>
    </>
  );
}
