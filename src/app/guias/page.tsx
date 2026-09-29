import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guías",
  description: "Cómo comprar, cómo leer un certificado de análisis y cómo almacenar y manipular viales liofilizados.",
  alternates: { canonical: "/guias" },
};

const steps = [
  ["Elige tu producto", "Explora el catálogo por línea de investigación y revisa pureza, formato y presentaciones."],
  ["Agrega al carrito y completa tus datos", "No necesitas crear una cuenta. Pedimos nombre, RUT, contacto y una dirección de despacho."],
  ["Paga en pesos", "Por transferencia bancaria (te mostramos los datos al confirmar) o con tarjeta cuando esté disponible en el checkout. Si tienes un cupón, lo escribes ahí."],
  ["Recibe con seguimiento", "Despachamos con seguimiento a todo Chile y te avisamos por correo con el número cuando sale tu pedido."],
];

const coa = [
  ["Nombre y número de lote", "Deben coincidir con la etiqueta del vial que recibiste. Es la forma de saber que el certificado corresponde a tu lote y no a otro."],
  ["Pureza por HPLC", "Porcentaje del área del pico principal en el cromatograma. Buscamos ≥ 98%."],
  ["Identidad por espectrometría de masas", "La masa medida debe coincidir con la masa teórica del péptido."],
  ["Fecha y laboratorio", "Un certificado reciente y con el nombre de quien lo emitió es más confiable que uno sin fecha ni origen."],
];

const storage = [
  ["Vial liofilizado sellado", "Guárdalo refrigerado (2–8 °C) y protegido de la luz. Para periodos largos, congelado a −20 °C."],
  ["Después de reconstituir", "Refrigerado entre 2 y 8 °C y protegido de la luz. Evita congelar y descongelar repetidas veces: separa en alícuotas."],
  ["Manipulación", "Usa material estéril, agua bacteriostática o el diluyente adecuado, y no agites: gira suavemente para disolver."],
];

export default function Guias() {
  return (
    <div className="animate-fade mx-auto max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Guías</p>
      <h1 className="sweep mt-2 font-display text-4xl font-bold">Antes de comprar y al recibir</h1>
      <p className="mt-4 text-muted">Información práctica de compra, verificación y manipulación de laboratorio. Todos los productos son solo para investigación.</p>

      <section id="como-comprar" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold">Cómo comprar</h2>
        <ol className="mt-5 space-y-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-card border bg-surface p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 font-display font-bold text-on-accent">{i + 1}</span>
              <div><p className="font-semibold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          <Link href="/productos" className="text-accent hover:underline">Ver productos →</Link> · <Link href="/envios" className="text-accent hover:underline">Envíos y devoluciones →</Link>
        </p>
      </section>

      <section id="leer-un-coa" className="mt-14 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold">Cómo leer un certificado de análisis</h2>
        <dl className="mt-5 grid gap-3">
          {coa.map(([t, d]) => (
            <div key={t} className="rounded-card border bg-surface p-4"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-sm text-muted">{d}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><Link href="/certificados" className="text-accent hover:underline">Buscar el certificado de mi lote →</Link></p>
      </section>

      <section id="almacenamiento" className="mt-14 scroll-mt-28">
        <h2 className="font-display text-2xl font-bold">Almacenamiento y manipulación</h2>
        <dl className="mt-5 grid gap-3">
          {storage.map(([t, d]) => (
            <div key={t} className="rounded-card border bg-surface p-4"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-sm text-muted">{d}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><Link href="/calculadora" className="text-accent hover:underline">Calculadora de reconstitución →</Link></p>
      </section>

      <p className="mt-14 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Solo para uso en investigación.</strong> Esta información es técnica y de manipulación de laboratorio; no describe usos, dosis ni efectos en personas o animales.
      </p>
    </div>
  );
}
