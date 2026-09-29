import Link from "next/link";
import { formatCLP } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { ProductImage } from "@/components/ProductImage";
import { Reveal } from "@/components/Reveal";
import { VialCarousel } from "@/components/VialCarousel";
import { CatalogTabs } from "@/components/CatalogTabs";

const buySteps = [
  { title: "Elige tu péptido", text: "Filtra por categoría y compara presentaciones en la misma página." },
  { title: "Paga en pesos", text: "Tarjeta, Webpay o transferencia. Sin cuentas ni registros previos." },
  { title: "Recíbelo con su COA", text: "Vial sellado, embalaje protector y el certificado del lote." },
];

const checks = [
  "Identidad confirmada por espectrometría de masas",
  "Pureza cuantificada por HPLC en cada lote",
  "Liofilizado y sellado bajo atmósfera inerte",
  "Trazabilidad: número de lote en cada vial",
];

const faqs = [
  { q: "¿Son aptos para consumo humano?", a: "No. Se venden exclusivamente para investigación in vitro y uso de laboratorio." },
  { q: "¿Cómo llegan?", a: "En viales sellados y liofilizados, dentro de embalaje protector. Recomendamos refrigerar al recibir." },
  { q: "¿Qué medios de pago aceptan?", a: "Tarjetas de crédito y débito, Webpay y transferencia bancaria, en pesos chilenos." },
  { q: "¿Puedo ver el certificado antes de comprar?", a: "Sí, escríbenos con el producto que te interesa y te enviamos el COA del lote disponible." },
  { q: "¿Hacen envíos a regiones?", a: "A todo Chile, con seguimiento. Sobre el mínimo que se indica en el carrito, el envío es gratis." },
  { q: "¿Tienen stock permanente?", a: "Los productos publicados están en stock en Chile; si algo se agota, lo retiramos del catálogo." },
];

export default async function Home() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const spotlight = products.find((p) => p.featured) ?? products[0];
  if (!spotlight) return <p className="p-12 text-center text-muted">Aún no hay productos publicados.</p>;
  const spotlightFrom = Math.min(...spotlight.variants.map((v) => v.price));

  return (
    <>
      {/* Portada: titular centrado y producto destacado debajo */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="glow animate-pulse-glow left-1/2 top-0 h-80 w-[50rem] -translate-x-1/2 bg-accent/20" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 text-center md:pt-24">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Laboratorio · Chile</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
              Reactivos peptídicos con <span className="text-gradient">certificado por lote</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
              Compra en pesos, recibe en 24–72 h y revisa el análisis del lote exacto que llega a tu mesa de trabajo.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="#catalogo" className="btn-primary">Explorar catálogo</Link>
              <Link href="#garantia" className="btn-ghost">Cómo verificamos</Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={320} className="relative mx-auto max-w-5xl px-4 pb-16">
          <div className="glass grid items-center gap-6 rounded-[2rem] p-6 md:grid-cols-[200px_1fr_auto] md:p-8">
            <div className="relative mx-auto grid h-52 w-40 place-items-center">
              <div className="absolute bottom-4 h-16 w-32 rounded-full opacity-60 blur-2xl" style={{ background: spotlight.color }} />
              <ProductImage product={spotlight} className="animate-float relative h-full w-full" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-2">Destacado de la semana</p>
              <h2 className="mt-2 font-display text-3xl font-bold">{spotlight.name}</h2>
              <p className="mt-2 text-muted">{spotlight.short}</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2 text-xs md:justify-start">
                <li className="rounded-full border px-3 py-1">{spotlight.purity}</li>
                <li className="rounded-full border px-3 py-1">{spotlight.form}</li>
                {spotlight.variants.map((v) => (
                  <li key={v.id} className="rounded-full border px-3 py-1">{v.label}</li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-muted">Desde</p>
              <p className="font-display text-3xl font-bold">{formatCLP(spotlightFrom)}</p>
              <Link href={`/productos/${spotlight.slug}`} className="btn-primary mt-3 w-full md:w-auto">Ver producto</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Cómo comprar: tres pasos en línea */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <ol className="grid gap-4 md:grid-cols-3">
          {buySteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <li className="flex gap-4 rounded-2xl border bg-surface p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 font-display font-bold text-on-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Catálogo con pestañas */}
      <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Catálogo</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Elige por línea de investigación</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            {products.length} productos en stock en Chile. Cada ficha incluye pureza, formato y presentaciones disponibles.
          </p>
        </Reveal>
        <div className="mt-10">
          <CatalogTabs products={products} />
        </div>
      </section>

      {/* Garantía: texto largo a la izquierda, certificado ilustrado a la derecha */}
      <section id="garantia" className="relative overflow-hidden scroll-mt-28 py-20">
        <div className="glow -left-40 top-1/2 h-96 w-96 -translate-y-1/2 bg-accent-2/15" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Garantía de análisis</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              El certificado viaja <span className="text-gradient">con el vial</span>
            </h2>
            <p className="mt-5 text-muted">
              No publicamos promedios ni fichas genéricas. Cada lote que despachamos tiene su propio informe, con la
              fecha del análisis y el número que aparece impreso en la etiqueta.
            </p>
            <ul className="mt-6 space-y-3">
              {checks.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            {/* Ilustración de un certificado de análisis (reemplazar por uno real) */}
            <div className="glass rotate-2 rounded-2xl p-6 shadow-2xl transition-transform duration-500 hover:rotate-0">
              <div className="flex items-center justify-between border-b pb-3">
                <p className="font-display font-bold">Certificado de análisis</p>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Aprobado</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-muted">Producto</dt><dd className="text-right font-medium">{spotlight.name}</dd>
                <dt className="text-muted">Lote</dt><dd className="text-right font-medium">HX-2409-A</dd>
                <dt className="text-muted">Pureza (HPLC)</dt><dd className="text-right font-medium text-accent">99,4%</dd>
                <dt className="text-muted">Masa (MS)</dt><dd className="text-right font-medium">Conforme</dd>
                <dt className="text-muted">Aspecto</dt><dd className="text-right font-medium">Polvo blanco</dd>
              </dl>
              <div className="mt-5 h-16 rounded-lg bg-gradient-to-r from-accent/20 via-accent-2/20 to-transparent" aria-hidden />
              <p className="mt-3 text-[10px] text-muted">Ejemplo ilustrativo. El COA real se entrega con cada pedido.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vitrina 3D */}
      <section className="relative overflow-hidden py-12">
        <Reveal className="relative mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Vitrina</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Gira la línea completa</h2>
        </Reveal>
        <div className="relative mt-2">
          <VialCarousel items={products.slice(0, 8)} />
        </div>
      </section>

      {/* Preguntas: dos columnas de tarjetas */}
      <section id="faq" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Antes de comprar</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Lo que más nos preguntan</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 50} className="h-full">
              <div className="h-full rounded-2xl border bg-surface p-5">
                <p className="font-semibold">{f.q}</p>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="mx-auto max-w-6xl px-4 pt-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border bg-surface px-6 py-12 md:flex md:items-center md:justify-between md:px-12">
            <div className="glow -right-20 -top-20 h-64 w-64 bg-accent/20" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold md:text-3xl">¿Necesitas un péptido que no ves aquí?</h2>
              <p className="mt-2 max-w-md text-muted">Cotizamos síntesis a pedido y compras por volumen para laboratorios.</p>
            </div>
            <a href={`mailto:${settings.email}`} className="btn-primary relative mt-6 md:mt-0">Escríbenos</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
