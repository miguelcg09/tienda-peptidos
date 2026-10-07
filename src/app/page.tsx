import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CatalogTabs } from "@/components/CatalogTabs";
import { HomeHero, type HeroItem } from "@/components/HomeHero";
import { field, onColor } from "@/lib/colors";
import { ProductCard } from "@/components/ProductCard";
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

const eyebrow = "text-sm font-medium text-muted";
const h2 = "mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]";

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
  // La línea de despacho sale de Ajustes: se muestra su primera frase y el envío gratis aparte.
  const dispatch = settings.shippingNote.split("·")[0].trim();
  const realEmail = settings.email && !settings.email.endsWith("@ejemplo.cl") ? settings.email : "";
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
  const closingColor = field(closing.color);
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
      <section aria-labelledby="titulo-datos" className="border-b border-fg/15">
        <h2 id="titulo-datos" className="sr-only">Cómo compras</h2>
        <ul className="mx-auto grid max-w-[1280px] px-4 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
          {proofs.map((x, i) => (
            <li key={x.title} className={`flex flex-col items-start gap-3 py-10 lg:py-12 ${i > 0 ? "lg:border-l lg:border-fg/15 lg:pl-8" : ""} ${i < 3 ? "lg:pr-8" : ""} ${i % 2 === 1 ? "sm:pl-8 lg:pl-8" : "sm:pr-8"}`}>
              <p className="text-sm font-medium text-muted">{x.label}</p>
              <h3 className="font-display text-3xl font-medium tracking-tight">{x.title}</h3>
              <p className="text-muted">{x.text}</p>
              <Link href={x.href} className="mt-auto inline-flex min-h-11 items-center text-sm font-medium u-link">{x.link}</Link>
            </li>
          ))}
        </ul>
      </section>

      {/* La colección: todas las piezas juntas */}
      <section id="coleccion" aria-labelledby="titulo-coleccion" className="scroll-mt-4">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-4 py-24 md:px-12 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className={eyebrow}>Catálogo</p>
              <h2 id="titulo-coleccion" className={`${h2} max-w-[22ch]`}>
                {n === 1 ? "Un compuesto de investigación" : `${countWord} compuestos de investigación`}, con su precio a la vista.
              </h2>
            </div>
            <p className="max-w-[34ch] text-lg text-muted">Todos los precios incluyen IVA. Si algo se agota, lo marcamos.</p>
          </div>
          {products.length > SHOW_ALL_UP_TO ? (
            <CatalogTabs products={products} />
          ) : (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" data-testid="catalogo-portada">
              {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
            </div>
          )}
          <Link href="/productos" className="self-start text-base font-medium u-link">Ver {n === 1 ? "el producto" : `los ${n} productos`}</Link>
        </div>
      </section>

      {/* Opiniones de compradores verificados: solo con al menos tres reseñas con comentario */}
      {reviews.length >= 3 && (
        <section id="opiniones" aria-labelledby="titulo-opiniones" className="mx-auto max-w-[1280px] px-4 pb-24 md:px-12 md:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Opiniones</p>
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
              <figure key={r.id} className="flex h-full flex-col rounded-card bg-surface p-6">
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
      <section id="despacho" data-field aria-labelledby="titulo-despacho" className="scroll-mt-4 bg-[#0b0f10] text-[#f4f6f6] dark:border-y dark:border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-4 py-24 md:px-12 md:py-28">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium text-[#9aa7ab]">Después de comprar</p>
            <h2 id="titulo-despacho" className="font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
              Qué pasa después de pagar
            </h2>
            <p className="text-lg text-[#c4ced1]">Tres pasos. Sin cuenta. Con seguimiento.</p>
          </div>

          <ol className="grid gap-10 md:grid-cols-3 md:gap-8" data-testid="pasos-compra">
            {steps.map((st, i) => (
              <li key={st.title} className="relative flex flex-col gap-4 border-t border-[#2a3336] pt-7">
                <span aria-hidden="true" className="absolute -top-px left-0 h-0.5 w-14 bg-[#f4f6f6]" />
                <p className="font-display text-5xl font-light leading-none tracking-tight"><span className="sr-only">Paso </span>{i + 1}</p>
                <h3 className="text-2xl font-medium leading-snug tracking-tight">{st.title}</h3>
                <p className="max-w-[44ch] text-[#c4ced1]">{st.text}</p>
              </li>
            ))}
          </ol>

          <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex min-w-0 flex-col gap-8">
              <dl className="border-t border-[#2a3336]">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid gap-x-6 gap-y-1 border-b border-[#2a3336] py-4 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-sm font-medium text-[#9aa7ab]">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3 text-[#c4ced1]">
                <p>
                  <span className="font-medium text-[#f4f6f6]">¿Llegó dañado?</span> Escríbenos dentro de 48 horas con tu número de pedido. Los reembolsos se hacen por el mismo medio de pago.{" "}
                  <Link href="/envios" className="text-[#f4f6f6] u-link">Ver envíos y devoluciones</Link>
                </p>
                {(wa || realEmail) && (
                  <p>
                    ¿Dudas antes de pagar? Escríbenos por {wa ? <>WhatsApp al <a href={wa} className="text-[#f4f6f6] u-link">{settings.whatsapp}</a></> : null}
                    {wa && realEmail ? " o a " : null}
                    {realEmail ? <a href={`mailto:${realEmail}`} className="text-[#f4f6f6] u-link">{realEmail}</a> : null}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-8">
              <div className="w-full rounded-card bg-[#151b1d] p-7 pb-8" role="group" aria-label="Ejemplo de seguimiento de un pedido">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm tracking-wider">PEDIDO HX-10482</span>
                  <span className="rounded-[3px] bg-[#f4f6f6] px-2.5 py-1 font-mono text-xs tracking-widest text-[#0b0f10]">EJEMPLO</span>
                </div>
                <ol className="mt-7 flex flex-col">
                  {tracking.map((t, i) => {
                    const last = i === tracking.length - 1;
                    const line = t.state === "done" ? "border-[#f4f6f6]" : t.state === "now" ? "border-[#3a4548]" : "border-transparent";
                    return (
                      <li key={t.label} className={`relative border-l-2 pl-6 ${last ? "" : "pb-7"} ${line}`} aria-current={t.state === "now" ? "step" : undefined}>
                        <span
                          aria-hidden="true"
                          className={`absolute rounded-full ${
                            t.state === "now" ? "-left-[9px] top-0.5 h-4 w-4 border-[3px] border-[#f4f6f6] bg-[#0b0f10]"
                            : t.state === "done" ? "-left-[7px] top-1 h-3 w-3 bg-[#f4f6f6]"
                            : "-left-[7px] top-1 h-3 w-3 border-2 border-[#5e6a6e]"
                          }`}
                        />
                        <p className={`text-lg ${t.state === "now" ? "font-semibold" : "font-medium"} ${t.state === "next" ? "text-[#9aa7ab]" : ""}`}>{t.label}</p>
                        {"note" in t && <p className="pt-1.5 font-mono text-xs text-[#c4ced1]">{t.note}</p>}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <form action="/pedido" method="get" className="flex flex-col gap-3" data-testid="seguir-pedido">
                <label htmlFor="seguir-orden" className="text-sm font-medium text-[#9aa7ab]">Número de pedido</label>
                <div className="flex flex-wrap gap-3">
                  <input
                    id="seguir-orden"
                    name="orden"
                    required
                    autoComplete="off"
                    placeholder="Ej.: HX-10482"
                    className="min-h-14 min-w-0 flex-1 basis-48 rounded-btn border border-[#3a4548] bg-[#151b1d] px-4 text-base text-[#f4f6f6] placeholder:text-[#9aa7ab]"
                  />
                  <button className="inline-flex min-h-14 items-center rounded-btn bg-[#f4f6f6] px-8 text-base font-semibold text-[#0b0f10] transition-opacity hover:opacity-90">Seguir mi pedido</button>
                </div>
                <p className="text-sm text-[#c4ced1]">Con tu correo ves también el número de seguimiento del courier.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes: la primera abierta */}
      <section id="faq" aria-labelledby="titulo-faq" className="wrap grid scroll-mt-4 gap-x-16 gap-y-10 py-24 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className={eyebrow}>Preguntas frecuentes</p>
          <h2 id="titulo-faq" className={h2}>Lo que más preguntan antes de comprar</h2>
          <p className="mt-4 text-lg text-muted">Respuestas cortas. Si falta la tuya, escríbenos.</p>
          <p className="mt-6 text-sm">
            <a href={contactHref} className="font-medium text-fg u-link">¿Otra duda? Escríbenos</a>
          </p>
        </div>
        <div className="divide-y self-start rounded-card bg-surface" data-testid="faq-portada">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group px-6 py-5 transition-colors hover:bg-surface-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {f.q}
                <span className="font-mono text-xl transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre: una acción para quien decidió y una salida suave para quien aún no compra */}
      <section aria-labelledby="titulo-cierre" data-field style={{ backgroundColor: closingColor, color: onColor(closingColor) }}>
        <div className="mx-auto grid max-w-[1280px] items-center gap-x-16 gap-y-10 px-4 pb-14 pt-24 md:grid-cols-[1.2fr_0.8fr] md:px-12 md:pt-28">
          <div className="flex min-w-0 flex-col items-start gap-7">
            <h2 id="titulo-cierre" className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-light leading-[1.02] tracking-[-0.03em]">
              Péptidos de investigación, en pesos y con seguimiento a todo Chile.
            </h2>
            <p className="max-w-[44ch] text-xl">Elige tu compuesto, paga en pesos y sigue tu pedido con su número de seguimiento.</p>
            <a href="#coleccion" className="inline-flex min-h-14 items-center rounded-btn px-8 text-base font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: onColor(closingColor), color: closingColor }}>
              Ver catálogo
            </a>
          </div>
          <div className="flex justify-center">
            <ProductImage product={closing} tone="field" className="h-[300px] w-auto max-w-full md:h-[400px]" />
          </div>
        </div>
        <div className="wrap">
          <p className="border-t border-current/30 py-8 pb-24 text-sm md:pb-28">
            ¿No ves el compuesto que buscas? <a href={contactHref} className="font-medium u-link">Escríbenos</a> y vemos si podemos incluirlo.
          </p>
        </div>
      </section>
    </>
  );
}
