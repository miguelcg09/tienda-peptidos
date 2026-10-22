import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CatalogTabs } from "@/components/CatalogTabs";
import { HomeHero, type HeroItem } from "@/components/HomeHero";
import { Icon, type IconName } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { Reveal } from "@/components/Reveal";
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

const h2 = "mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.035em]";

// Pasos del seguimiento que ve el comprador (ejemplo ilustrativo).
const tracking = [
  { label: "Pedido recibido", short: "Recibido", state: "done" },
  { label: "Preparando tu pedido", short: "Preparando", state: "done" },
  { label: "Despachado", short: "Despachado", state: "now", note: "Seguimiento con número del courier" },
  { label: "Entregado", short: "Entregado", state: "next" },
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
  // La línea de despacho sale de Ajustes: se muestra su primera frase y el envío gratis aparte.
  const dispatch = settings.shippingNote.split("·")[0].trim();
  const realEmail = settings.email && !settings.email.endsWith("@ejemplo.cl") ? settings.email : "";
  const n = products.length;
  const countWord = words[n] ?? String(n);
  const proofs: { icon: IconName; label: string; title: string; text: string; href: string; link: string }[] = [
    { icon: "route", label: "Envío", title: "Con seguimiento", text: "Cada pedido sale con número de seguimiento a todo Chile.", href: "/pedido", link: "Seguir mi pedido" },
    { icon: "peso", label: "Pago", title: "En pesos", text: "Pagas en pesos chilenos, por transferencia bancaria.", href: "/guias#como-comprar", link: "Cómo comprar" },
    { icon: "clock", label: "Despacho", title: "Mismo día hábil", text: `${dispatch}. Envío gratis sobre ${formatCLP(settings.freeShippingFrom)}.`, href: "/envios", link: "Envíos y devoluciones" },
    { icon: "box", label: "Si llega dañado", title: "48 horas", text: "Si tu pedido llega dañado, escríbenos dentro de 48 horas con tu número de pedido.", href: "/envios", link: "Envíos y devoluciones" },
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

      {/* Cuatro hechos de compra en una rejilla de celdas de distinto tamaño */}
      <section aria-labelledby="titulo-datos" className="wrap py-8 md:py-12">
        <h2 id="titulo-datos" className="sr-only">Cómo compras</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {proofs.map((x, i) => {
            const big = i === 0;
            const wide = i === 3;
            return (
              <li key={x.title} className={big ? "sm:col-span-2 lg:row-span-2" : wide ? "sm:col-span-2" : ""}>
                <Reveal delay={i * 60} className="h-full">
                  <div
                    className={`flex h-full flex-col gap-4 rounded-[1.75rem] p-6 md:rounded-[2rem] ${
                      big ? "min-h-[18rem] bg-accent p-7 text-on-accent md:p-10 lg:min-h-[26rem]" : "border border-line bg-surface md:p-7"
                    } ${wide ? "sm:flex-row sm:items-center sm:gap-8" : ""}`}
                    data-field={big ? "" : undefined}
                  >
                    <div className={`flex flex-col gap-4 ${wide ? "sm:w-44 sm:shrink-0" : ""}`}>
                      <span className={`grid h-12 w-12 place-items-center rounded-full ${big ? "bg-on-accent/15" : "bg-surface-2 text-accent-2"}`}>
                        <Icon name={x.icon} size={24} />
                      </span>
                      <p className={`text-sm font-semibold ${big ? "" : "text-muted"}`}>{x.label}</p>
                    </div>
                    <div className={`flex flex-1 flex-col gap-3 ${big ? "lg:justify-end" : ""}`}>
                      <h3 className={`font-display font-semibold tracking-[-0.035em] ${big ? "text-[clamp(2.4rem,4.6vw,4rem)] leading-[0.98]" : "text-3xl leading-[1.05]"}`}>{x.title}</h3>
                      <p className={big ? "max-w-[34ch] text-lg" : "text-muted"}>{x.text}</p>
                      {big && (
                        <ol aria-hidden="true" className="mt-auto grid grid-cols-4 gap-2 pt-8">
                          {tracking.map((t) => (
                            <li key={t.label} className="flex flex-col gap-2">
                              <span className={`h-1.5 rounded-full bg-on-accent ${t.state === "next" ? "opacity-30" : ""}`} />
                              <span className={`text-[0.8125rem] leading-tight ${t.state === "now" ? "font-semibold" : "opacity-90"}`}>{t.short}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      <Link
                        href={x.href}
                        className={`${big ? "mt-4" : "mt-auto"} inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold ${big ? "rounded-full bg-on-accent px-5 text-accent transition-opacity hover:opacity-90" : "u-link text-accent-2"}`}
                      >
                        {x.link}
                        {big && <Icon name="arrow" size={16} />}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      {/* La colección: todas las piezas juntas */}
      <section id="coleccion" aria-labelledby="titulo-coleccion" className="scroll-mt-4">
        <div className="wrap flex flex-col gap-10 py-14 md:gap-12 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="chip">Catálogo</p>
              <h2 id="titulo-coleccion" className={`${h2} max-w-[22ch]`}>
                {n === 1 ? "Un compuesto de investigación" : `${countWord} compuestos de investigación`}, con su precio a la vista.
              </h2>
            </div>
            <p className="max-w-[34ch] text-lg text-muted">Todos los precios incluyen IVA. Si algo se agota, lo marcamos.</p>
          </div>
          {products.length > SHOW_ALL_UP_TO ? (
            <CatalogTabs products={products} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3" data-testid="catalogo-portada">
              {products.map((p, i) => <Reveal key={p.slug} className="h-full" delay={(i % 3) * 60}><ProductCard product={p} index={i} /></Reveal>)}
            </div>
          )}
          <Link href="/productos" className="btn-ghost self-start">Ver {n === 1 ? "el producto" : `los ${n} productos`}</Link>
        </div>
      </section>

      {/* Opiniones de compradores verificados: solo con al menos tres reseñas con comentario */}
      {reviews.length >= 3 && (
        <section id="opiniones" aria-labelledby="titulo-opiniones" className="wrap pb-14 md:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="chip">Opiniones</p>
              <h2 id="titulo-opiniones" className={h2}>Compradores verificados</h2>
              <p className="mt-4 text-lg text-muted">Solo opinan quienes recibieron su pedido.</p>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Stars value={avgReviews} className="text-lg" />
              <span><strong className="text-fg">{avgReviews.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong> de 5 · {totalReviews} {totalReviews === 1 ? "reseña" : "reseñas"}</span>
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-[1.75rem] border border-line bg-surface p-6">
                <Stars value={r.rating} className="text-lg" />
                <blockquote className="mt-3 grow text-base text-muted">“{r.body}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span> · {nameOf(r.productSlug)} · <span className="text-xs font-medium text-muted">Compra verificada</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Después de comprar: qué pasa tras el pago */}
      <section id="despacho" aria-labelledby="titulo-despacho" className="wrap scroll-mt-4 py-6 md:py-10">
        <div className="rounded-[2.25rem] bg-surface-2 p-5 sm:p-8 md:rounded-[3rem] md:p-14">
          <div className="max-w-2xl">
            <p className="chip bg-surface">Después de comprar</p>
            <h2 id="titulo-despacho" className={h2}>Qué pasa después de pagar</h2>
            <p className="mt-4 text-lg text-muted">Tres pasos. Sin cuenta. Con seguimiento.</p>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4" data-testid="pasos-compra">
            {steps.map((st, i) => (
              <li key={st.title} className="flex flex-col gap-3 rounded-[1.75rem] bg-surface p-6 md:p-7">
                <p className="font-display text-7xl font-semibold leading-none tracking-[-0.05em] text-accent"><span className="sr-only">Paso </span>{i + 1}</p>
                <h3 className="text-2xl font-semibold leading-snug tracking-tight">{st.title}</h3>
                <p className="max-w-[44ch] text-muted">{st.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-3 grid gap-3 md:mt-4 md:gap-4 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex min-w-0 flex-col gap-6 rounded-[1.75rem] bg-surface p-6 md:p-7">
              <dl>
                {facts.map(([k, v], i) => (
                  <div key={k} className={`grid gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[7rem_1fr] ${i > 0 ? "border-t border-line" : "pt-0"}`}>
                    <dt className="text-sm font-medium text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3 text-muted">
                <p>
                  <span className="font-semibold text-fg">¿Llegó dañado?</span> Escríbenos dentro de 48 horas con tu número de pedido. Los reembolsos se hacen por el mismo medio de pago.{" "}
                  <Link href="/envios" className="font-medium text-accent-2 u-link">Ver envíos y devoluciones</Link>
                </p>
                {(wa || realEmail) && (
                  <p>
                    ¿Dudas antes de pagar? Escríbenos por {wa ? <>WhatsApp al <a href={wa} className="font-medium text-accent-2 u-link">{settings.whatsapp}</a></> : null}
                    {wa && realEmail ? " o a " : null}
                    {realEmail ? <a href={`mailto:${realEmail}`} className="font-medium text-accent-2 u-link">{realEmail}</a> : null}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6 rounded-[1.75rem] bg-surface p-6 md:p-7">
              <div className="w-full rounded-[1.25rem] bg-surface-2 p-5" role="group" aria-label="Ejemplo de seguimiento de un pedido">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <span className="whitespace-nowrap font-mono text-sm tracking-wider">PEDIDO HX-10482</span>
                  <span className="rounded-full bg-accent px-3 py-1 font-mono text-xs tracking-widest text-on-accent">EJEMPLO</span>
                </div>
                <ol className="mt-6 flex flex-col">
                  {tracking.map((t, i) => {
                    const last = i === tracking.length - 1;
                    const line = t.state === "done" ? "border-accent" : t.state === "now" ? "border-control" : "border-transparent";
                    return (
                      <li key={t.label} className={`relative border-l-2 pl-6 ${last ? "" : "pb-6"} ${line}`} aria-current={t.state === "now" ? "step" : undefined}>
                        <span
                          aria-hidden="true"
                          className={`absolute rounded-full ${
                            t.state === "now" ? "-left-[9px] top-0.5 h-4 w-4 border-[3px] border-accent bg-surface-2"
                            : t.state === "done" ? "-left-[7px] top-1 h-3 w-3 bg-accent"
                            : "-left-[7px] top-1 h-3 w-3 border-2 border-control"
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
                <label htmlFor="seguir-orden" className="text-sm font-medium text-muted">Número de pedido</label>
                <div className="flex flex-wrap gap-3">
                  <input
                    id="seguir-orden"
                    name="orden"
                    required
                    autoComplete="off"
                    placeholder="Ej.: HX-10482"
                    className="field mt-0 min-h-14 min-w-0 flex-1 basis-48 rounded-full px-5 text-base placeholder:text-muted"
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
      <section id="faq" aria-labelledby="titulo-faq" className="wrap grid scroll-mt-4 gap-x-16 gap-y-10 py-14 md:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="chip">Preguntas frecuentes</p>
          <h2 id="titulo-faq" className={h2}>Lo que más preguntan antes de comprar</h2>
          <p className="mt-4 text-lg text-muted">Respuestas cortas. Si falta la tuya, escríbenos.</p>
          <p className="mt-6">
            <a href={contactHref} className="btn-ghost text-sm">¿Otra duda? Escríbenos</a>
          </p>
        </div>
        <div className="flex flex-col gap-3 self-start" data-testid="faq-portada">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group rounded-[1.5rem] border border-line bg-surface px-5 py-4 transition-colors hover:border-control sm:px-6">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {f.q}
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xl transition group-open:rotate-45 group-open:bg-accent group-open:text-on-accent" aria-hidden>+</span>
              </summary>
              <p className="mt-2 pr-10 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre: una acción para quien decidió y una salida suave para quien aún no compra */}
      <section aria-labelledby="titulo-cierre" className="wrap pb-14 pt-4 md:pb-20">
        <div data-field className="overflow-hidden rounded-[2.25rem] bg-accent text-on-accent md:rounded-[3rem]">
          <div className="grid items-center gap-x-12 gap-y-8 px-6 pb-8 pt-12 md:grid-cols-[1.2fr_0.8fr] md:px-14 md:pt-16">
            <div className="flex min-w-0 flex-col items-start gap-6">
              <h2 id="titulo-cierre" className="font-display text-[clamp(2.1rem,4.4vw,3.75rem)] font-semibold leading-[1] tracking-[-0.04em]">
                Péptidos de investigación, en pesos y con seguimiento a todo Chile.
              </h2>
              <p className="max-w-[44ch] text-lg md:text-xl">Elige tu compuesto, paga en pesos y sigue tu pedido con su número de seguimiento.</p>
              <a href="#coleccion" className="inline-flex min-h-14 items-center rounded-full bg-on-accent px-8 text-base font-semibold text-accent transition-opacity hover:opacity-90">
                Ver catálogo
              </a>
            </div>
            <div className="flex justify-center">
              <div className="animate-float">
                <ProductImage product={closing} tone="field" className="h-[280px] w-auto max-w-full md:h-[360px]" />
              </div>
            </div>
          </div>
          <p className="border-t border-current/25 px-6 py-6 text-sm md:px-14">
            ¿No ves el compuesto que buscas? <a href={contactHref} className="font-semibold u-link">Escríbenos</a> y vemos si podemos incluirlo.
          </p>
        </div>
      </section>
    </>
  );
}
