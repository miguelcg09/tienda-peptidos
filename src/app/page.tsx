import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CatalogTabs } from "@/components/CatalogTabs";
import { HomeHero, type HeroItem } from "@/components/HomeHero";
import { Newsletter } from "@/components/Newsletter";
import { onColor } from "@/lib/colors";
import { ProductCard } from "@/components/ProductCard";
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
  // La línea de despacho sale de Ajustes: se muestra su primera frase y el envío gratis aparte.
  const dispatch = settings.shippingNote.split("·")[0].trim();
  const realEmail = settings.email && !settings.email.endsWith("@ejemplo.cl") ? settings.email : "";
  const n = products.length;
  const countWord = words[n] ?? String(n);
  const proofs = [
    { title: "Con seguimiento", text: "Cada pedido sale con número de seguimiento a todo Chile.", href: "/pedido", link: "Seguir mi pedido" },
    { title: "En pesos", text: "Pagas en pesos chilenos, por transferencia bancaria.", href: "/guias#como-comprar", link: "Cómo comprar" },
    { title: "Mismo día hábil", text: `${dispatch}. Envío gratis sobre ${formatCLP(settings.freeShippingFrom)}.`, href: "/envios", link: "Envíos y devoluciones" },
    { title: "48 horas", text: "Si tu pedido llega dañado, escríbenos dentro de 48 horas con tu número de pedido.", href: "/envios", link: "Envíos y devoluciones" },
  ];
  const steps = [
    ["Elige y agrega al carrito.", "No necesitas crear una cuenta. Pedimos nombre, RUT, contacto y dirección de despacho."],
    ["Paga en pesos.", "Por transferencia bancaria: te mostramos los datos al confirmar y guardamos tu pedido 48 horas mientras transfieres."],
    ["Recibe con seguimiento.", "Cuando despachamos, te enviamos el número de seguimiento por correo. También lo ves en “Seguir mi pedido”."],
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
      <section aria-label="Cómo compras" className="border-b border-fg/15">
        <ul className="mx-auto grid max-w-[1280px] px-4 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
          {proofs.map((x, i) => (
            <li key={x.title} className={`flex flex-col items-start gap-3 py-10 lg:py-12 ${i > 0 ? "lg:border-l lg:border-fg/15 lg:pl-8" : ""} ${i < 3 ? "lg:pr-8" : ""} ${i % 2 === 1 ? "sm:pl-8 lg:pl-8" : "sm:pr-8"}`}>
              <p className="font-display text-3xl font-medium tracking-tight">{x.title}</p>
              <p className="text-muted">{x.text}</p>
              <Link href={x.href} className="mt-auto text-sm font-medium underline underline-offset-[5px]">{x.link}</Link>
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
              <h2 id="titulo-coleccion" className="mt-3 max-w-[22ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
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
          <Link href="/productos" className="self-start text-base font-medium underline underline-offset-[6px]">Ver {n === 1 ? "el producto" : `los ${n} productos`}</Link>
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
                  <span className="font-semibold">{r.name}</span> · {nameOf(r.productSlug)} · <span className="font-mono text-xs uppercase tracking-wider text-muted">Compra verificada</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Después de comprar: qué pasa tras el pago */}
      <section id="despacho" aria-labelledby="titulo-despacho" className="scroll-mt-4 bg-[#0b0f10] text-[#f4f6f6] dark:border-y dark:border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-start gap-x-16 gap-y-14 px-4 py-24 md:px-12 md:py-28">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-10">
            <div className="flex flex-col gap-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9aa7ab]">Después de comprar</p>
              <h2 id="titulo-despacho" className="font-display text-[clamp(2.5rem,5.5vw,4.75rem)] font-light leading-[0.98] tracking-[-0.035em]">
                Qué pasa después de pagar
              </h2>
              <p className="text-lg text-[#c4ced1]">Tres pasos. Sin cuenta. Con seguimiento.</p>
            </div>
            <ol className="flex flex-col gap-6">
              {steps.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-3">
                  <span className="pt-1 font-mono text-sm text-[#9aa7ab]">{i + 1}</span>
                  <div>
                    <p className="text-xl font-medium">{t}</p>
                    <p className="mt-1 max-w-[52ch] text-[#c4ced1]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <dl className="border-t border-[#2a3336]">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-x-6 gap-y-1 border-b border-[#2a3336] py-4 sm:grid-cols-[8rem_1fr]">
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-[#9aa7ab]">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-3 text-[#c4ced1]">
              <p>
                <span className="font-medium text-[#f4f6f6]">¿Llegó dañado?</span> Escríbenos dentro de 48 horas con tu número de pedido. Los reembolsos se hacen por el mismo medio de pago.{" "}
                <Link href="/envios" className="text-[#f4f6f6] underline underline-offset-4">Ver envíos y devoluciones</Link>
              </p>
              {(wa || realEmail) && (
                <p>
                  ¿Dudas antes de pagar? Escríbenos por {wa ? <>WhatsApp al <a href={wa} className="text-[#f4f6f6] underline underline-offset-4">{settings.whatsapp}</a></> : null}
                  {wa && realEmail ? " o a " : null}
                  {realEmail ? <a href={`mailto:${realEmail}`} className="text-[#f4f6f6] underline underline-offset-4">{realEmail}</a> : null}.
                </p>
              )}
            </div>
            <Link href="/pedido" className="inline-flex min-h-14 items-center self-start rounded-btn bg-[#f4f6f6] px-8 text-base font-semibold text-[#0b0f10]">Seguir mi pedido</Link>
          </div>
          <div className="flex min-w-0 flex-[1_1_380px] justify-center lg:pt-24">
            <div className="w-full max-w-[460px] rounded-card bg-[#151b1d] p-7 pb-8" aria-label="Ejemplo de seguimiento de un pedido">
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
        <p className={eyebrow}>Preguntas frecuentes</p>
        <h2 id="titulo-faq" className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">Lo que más preguntan antes de comprar</h2>
        <p className="mt-4 text-lg text-muted">Respuestas cortas. Si falta la tuya, escríbenos.</p>
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
        <p className="mt-6 text-sm">
          <a href={contactHref} className="font-medium text-fg underline underline-offset-4">¿Otra duda? Escríbenos</a>
        </p>
      </section>

      {/* Cierre: una acción para quien decidió y una salida suave para quien aún no compra */}
      <section aria-labelledby="titulo-cierre" className="-mb-28" style={{ backgroundColor: closing.color, color: onColor(closing.color) }}>
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-16 gap-y-12 px-4 py-24 md:px-12 md:py-28">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col items-start gap-7">
            <h2 id="titulo-cierre" className="font-display text-[clamp(2.25rem,4.6vw,4rem)] font-light leading-[1.02] tracking-[-0.03em]">
              Péptidos de investigación, en pesos y con seguimiento a todo Chile.
            </h2>
            <p className="max-w-[44ch] text-xl opacity-90">Elige tu compuesto, paga en pesos y sigue tu pedido con su número de seguimiento.</p>
            <a href="#coleccion" className="inline-flex min-h-14 items-center rounded-btn px-8 text-base font-semibold" style={{ backgroundColor: onColor(closing.color), color: closing.color }}>
              Ver catálogo
            </a>
          </div>
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6 rounded-card bg-surface p-7 text-fg">
            <div>
              <p className="font-display text-2xl font-medium">¿No compras hoy?</p>
              <div className="mt-4"><Newsletter testId="suscribir-cierre" cta="Avísame de nuevos lotes" compact /></div>
              <p className="mt-2 text-sm text-muted">Máximo un correo al mes.</p>
            </div>
            <p className="border-t pt-5 text-sm text-muted">
              ¿No ves el compuesto que buscas? <a href={contactHref} className="font-medium text-fg underline underline-offset-4">Escríbenos</a> y vemos si podemos incluirlo.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
