import Link from "next/link";
import { showCertificates } from "@/lib/features";
import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/Icon";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Guías",
  description: "Cómo comprar y cómo almacenar y manipular viales liofilizados.",
  alternates: { canonical: "/guias" },
};

const stepIcons: IconName[] = ["grid", "cart", "card", "truck"];
const coaIcons: IconName[] = ["tag", "flask", "ruler", "calendar"];
const storageIcons: IconName[] = ["snowflake", "drop", "flask"];

const steps = [
  ["Elige tu producto", "Explora el catálogo por línea de investigación y revisa formato y presentaciones."],
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
      <PageHead icon="book" label="Guías" title="Antes de comprar y al recibir">
        <p>Información práctica de compra, verificación y manipulación de laboratorio. Todos los productos son solo para investigación.</p>
      </PageHead>

      <section id="como-comprar" className="mt-12 scroll-mt-28">
        <h2 className="t-h2">Cómo comprar</h2>
        <ol className="mt-5 space-y-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="lift flex gap-4 rounded-[1.5rem] border bg-surface p-4 md:p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={stepIcons[i] ?? "check"} size={22} /></span>
              <div><p className="font-semibold"><span className="mr-2 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          <Link href="/productos" className="group/a inline-flex items-center gap-1.5 py-1 font-medium text-accent-2 hover:underline">Ver productos <Icon name="arrow" size={16} className="transition-transform group-hover/a:translate-x-1" /></Link>
          <span aria-hidden="true" className="mx-2 text-muted">·</span>
          <Link href="/envios" className="group/b inline-flex items-center gap-1.5 py-1 font-medium text-accent-2 hover:underline">Envíos y devoluciones <Icon name="arrow" size={16} className="transition-transform group-hover/b:translate-x-1" /></Link>
        </p>
      </section>

      {showCertificates() && (
      <section id="leer-un-coa" className="mt-14 scroll-mt-28">
        <h2 className="t-h2">Cómo leer un certificado de análisis</h2>
        <dl className="mt-5 grid gap-3">
          {coa.map(([t, d], i) => (
            <div key={t} className="lift rounded-[1.5rem] border bg-surface p-4 md:p-5">
              <dt className="flex items-center gap-4 font-semibold">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={coaIcons[i] ?? "doc"} size={22} /></span>
                {t}
              </dt>
              <dd className="mt-2 text-sm text-muted md:pl-[3.75rem]">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><Link href="/certificados" className="group/c inline-flex items-center gap-1.5 py-1 font-medium text-accent-2 hover:underline">Buscar el certificado de mi lote <Icon name="arrow" size={16} className="transition-transform group-hover/c:translate-x-1" /></Link></p>
      </section>
      )}

      <section id="almacenamiento" className="mt-14 scroll-mt-28">
        <h2 className="t-h2">Almacenamiento y manipulación</h2>
        <dl className="mt-5 grid gap-3">
          {storage.map(([t, d], i) => (
            <div key={t} className="lift rounded-[1.5rem] border bg-surface p-4 md:p-5">
              <dt className="flex items-center gap-4 font-semibold">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={storageIcons[i] ?? "flask"} size={22} /></span>
                {t}
              </dt>
              <dd className="mt-2 text-sm text-muted md:pl-[3.75rem]">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm"><Link href="/calculadora" className="group/d inline-flex items-center gap-1.5 py-1 font-medium text-accent-2 hover:underline"><Icon name="calc" size={18} />Calculadora de reconstitución <Icon name="arrow" size={16} className="transition-transform group-hover/d:translate-x-1" /></Link></p>
      </section>

      <p className="mt-14 flex gap-3 rounded-[1.5rem] border-l-4 border-accent bg-surface-2 p-4 text-sm">
        <Icon name="shield" size={20} className="mt-0.5 shrink-0 text-accent-2" />
        <span><strong>Solo para uso en investigación.</strong> Esta información es técnica y de manipulación de laboratorio; no describe usos, dosis ni efectos en personas o animales.</span>
      </p>
    </div>
  );
}
