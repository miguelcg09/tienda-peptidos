import Link from "next/link";
import { categories, categoryMeta } from "@/lib/products";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Spotlight } from "@/components/Spotlight";
import { RotatingWord } from "@/components/RotatingWord";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { VialCarousel } from "@/components/VialCarousel";
import { CatalogTabs } from "@/components/CatalogTabs";
import { faqs } from "@/lib/faqs";

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


export default async function Home() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const spotlight = featured[0] ?? products[0];
  if (!spotlight) return <p className="p-12 text-center text-muted">Aún no hay productos publicados.</p>;
  if (featured.length === 0) featured.push(spotlight);
  const present = categories.filter((c) => products.some((p) => p.category === c));
  const lines = present.map((c) => c.toLowerCase());

  return (
    <>
      {/* Portada: titular a la izquierda con palabra que rota, destacados rotativos a la derecha */}
      <section className="relative overflow-hidden border-b bg-surface-2">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Laboratorio · Chile</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-tight md:text-7xl">
                Péptidos para investigar
                <br />
                <RotatingWord words={lines} className="text-accent" />
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-lg text-muted">
                Reactivos de grado investigación con certificado de análisis por lote. Compra en pesos y recibe en Chile en 24–72 h.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#catalogo" className="btn-primary">Explorar catálogo</Link>
                <Link href="#garantia" className="btn-ghost">Cómo verificamos</Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t pt-6">
                {[
                  { v: <CountUp value={98} prefix="≥ " suffix="%" />, l: "pureza mínima por HPLC" },
                  { v: <CountUp value={products.length} />, l: "productos en stock" },
                  { v: <CountUp value={100} suffix="%" />, l: "lotes con certificado" },
                ].map((st, i) => (
                  <div key={i}>
                    <dd className="font-display text-3xl font-bold text-fg">{st.v}</dd>
                    <dt className="mt-1 text-xs text-muted">{st.l}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <Spotlight items={featured} />
          </Reveal>
        </div>
      </section>

      {/* Líneas de investigación: una tarjeta por categoría */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {present.map((c, i) => (
            <Reveal key={c} delay={i * 70}>
              <Link
                href={`/productos?categoria=${encodeURIComponent(c)}`}
                className="group flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `${categoryMeta[c].color}26` }}>
                  {categoryMeta[c].icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c}</span>
                  <span className="block text-xs text-muted">{products.filter((p) => p.category === c).length} productos · {categoryMeta[c].blurb}</span>
                </span>
                <span className="ml-auto text-muted transition group-hover:translate-x-1 group-hover:text-accent">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
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
      <section id="garantia" className="band relative scroll-mt-28 py-20">
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
            <div className="rotate-2 rounded-2xl border bg-surface p-6 shadow-lg transition-transform duration-500 hover:rotate-0">
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
              <div className="mt-5 h-16 rounded-lg border border-dashed" aria-hidden />
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
          <div className="relative rounded-[2rem] border bg-surface-2 px-6 py-12 md:flex md:items-center md:justify-between md:px-12">
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
