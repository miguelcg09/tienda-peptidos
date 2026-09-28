import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Vial } from "@/components/Vial";

const features = [
  { title: "Pureza ≥ 98%", text: "Cada lote verificado por HPLC y espectrometría de masas." },
  { title: "Certificado de análisis", text: "COA disponible para cada lote que despachamos." },
  { title: "Despacho a todo Chile", text: "Envío en 24–72 h hábiles, embalaje con control de temperatura." },
  { title: "Pago seguro", text: "Webpay, tarjetas y transferencia a través de una pasarela certificada." },
];

const faqs = [
  { q: "¿Los productos son aptos para consumo humano?", a: "No. Todos los productos se venden exclusivamente para investigación in vitro y uso de laboratorio." },
  { q: "¿Cómo se despachan?", a: "En viales sellados y liofilizados, dentro de embalaje protector. Recomendamos refrigerar al recibir." },
  { q: "¿Qué medios de pago aceptan?", a: "Tarjetas de crédito y débito, Webpay y transferencia bancaria, en pesos chilenos." },
  { q: "¿Entregan certificado de análisis?", a: "Sí, cada producto cuenta con su COA por lote, disponible a solicitud." },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <section className="bg-gradient-to-b from-mist to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Grado investigación</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Péptidos de alta pureza para tu laboratorio
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Compuestos sintetizados bajo estándares estrictos, con certificado de análisis por lote y despacho a todo Chile.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">
                Ver catálogo
              </Link>
              <Link href="#calidad" className="rounded-full border border-slate-300 px-6 py-3 font-medium hover:border-brand">
                Nuestra calidad
              </Link>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {featured.slice(0, 3).map((p, i) => (
              <Vial key={p.slug} color={p.color} label={p.name} className={`h-64 md:h-80 ${i === 1 ? "-translate-y-6" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Más vendidos</h2>
          <Link href="/productos" className="text-sm font-medium text-brand">Ver todos →</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section id="calidad" className="bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">Por qué elegirnos</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6">
                <p className="font-semibold">{f.title}</p>
                <p className="mt-2 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y rounded-2xl border">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-3 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
