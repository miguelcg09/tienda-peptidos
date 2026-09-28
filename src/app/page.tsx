import Link from "next/link";
import { categories, categoryMeta, products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Vial } from "@/components/Vial";
import { Reveal } from "@/components/Reveal";
import { VialCarousel } from "@/components/VialCarousel";

const stats = [
  { value: "≥ 98%", label: "Pureza por HPLC" },
  { value: "COA", label: "Por cada lote" },
  { value: "24–72 h", label: "Despacho a todo Chile" },
];

const steps = [
  { n: "01", title: "Síntesis", text: "Péptidos sintetizados en fase sólida y liofilizados en viales sellados." },
  { n: "02", title: "Análisis", text: "Cada lote se verifica por HPLC y espectrometría de masas." },
  { n: "03", title: "Certificado", text: "Publicamos el certificado de análisis (COA) del lote que recibes." },
  { n: "04", title: "Despacho", text: "Embalaje protector y envío rápido con seguimiento a todo Chile." },
];

const faqs = [
  { q: "¿Los productos son aptos para consumo humano?", a: "No. Todos los productos se venden exclusivamente para investigación in vitro y uso de laboratorio." },
  { q: "¿Cómo se despachan?", a: "En viales sellados y liofilizados, dentro de embalaje protector. Recomendamos refrigerar al recibir." },
  { q: "¿Qué medios de pago aceptan?", a: "Tarjetas de crédito y débito, Webpay y transferencia bancaria, en pesos chilenos." },
  { q: "¿Entregan certificado de análisis?", a: "Sí, cada producto cuenta con su COA por lote, disponible a solicitud." },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);
  const hero = featured.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0" />
        <div className="glow animate-pulse-glow -left-40 top-10 h-96 w-96 bg-accent/25" />
        <div className="glow animate-pulse-glow -right-32 top-40 h-[28rem] w-[28rem] bg-accent-2/25 [animation-delay:3s]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:py-28">
          <div>
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-fg/90">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                Grado investigación · Stock en Chile
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
                Péptidos <span className="text-gradient">premium</span> para tu laboratorio
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-lg text-lg text-muted">
                Alta pureza, certificado de análisis por lote y despacho rápido a todo Chile.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/productos" className="btn-primary">Ver catálogo →</Link>
                <Link href="#calidad" className="btn-ghost">Nuestra calidad</Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-display text-2xl font-bold">{s.value}</dt>
                    <dd className="mt-1 text-xs text-muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="relative flex h-[360px] items-end justify-center md:h-[480px]">
            <div className="absolute bottom-6 h-24 w-80 rounded-[100%] bg-accent/20 blur-3xl" />
            {hero.map((p, i) => (
              <div
                key={p.slug}
                className="animate-float relative -mx-3"
                style={{ animationDelay: `${i * 0.8}s`, zIndex: i === 1 ? 2 : 1 }}
              >
                <Vial color={p.color} label={p.name} className={i === 1 ? "h-80 md:h-[26rem]" : "h-60 md:h-80"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Explora</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Categorías</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c} delay={i * 60}>
              <Link
                href={`/productos?categoria=${encodeURIComponent(c)}`}
                className="shine group flex h-full flex-col rounded-2xl border bg-surface p-5 transition hover:-translate-y-1 hover:border-white/20"
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: `${categoryMeta[c].color}1f`, boxShadow: `inset 0 0 0 1px ${categoryMeta[c].color}40` }}
                >
                  {categoryMeta[c].icon}
                </span>
                <span className="mt-4 font-semibold">{c}</span>
                <span className="mt-1 text-xs text-muted">{categoryMeta[c].blurb}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Lo más pedido</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Más vendidos</h2>
          </div>
          <Link href="/productos" className="text-sm font-medium text-accent hover:underline">Ver todos →</Link>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="h-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carrusel 3D */}
      <section className="relative overflow-hidden py-16">
        <div className="glow left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 bg-accent-2/15" />
        <Reveal className="relative mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Catálogo</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Toda la línea en 360°</h2>
        </Reveal>
        <div className="relative mt-6">
          <VialCarousel items={products.slice(0, 8)} />
        </div>
      </section>

      {/* Calidad */}
      <section id="calidad" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Proceso</p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-bold md:text-4xl">
            Calidad verificable, <span className="text-gradient">lote a lote</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-3xl border bg-surface p-6 transition hover:border-accent/40">
                <div className="absolute -right-6 -top-6 font-display text-8xl font-bold text-white/[0.03] transition group-hover:text-accent/10">{s.n}</div>
                <p className="font-display text-sm text-accent">{s.n}</p>
                <p className="mt-3 text-lg font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-16">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group rounded-2xl border bg-surface px-5 py-4 transition open:border-accent/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border text-muted transition-transform duration-300 group-open:rotate-45 group-open:text-accent">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-accent/15 via-surface to-accent-2/15 px-6 py-14 text-center">
            <div className="bg-grid absolute inset-0 opacity-60" />
            <h2 className="relative font-display text-3xl font-bold md:text-5xl">¿Listo para tu próxima investigación?</h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted">Envío gratis sobre $80.000 a todo Chile.</p>
            <Link href="/productos" className="btn-primary relative mt-8">Comprar ahora →</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
