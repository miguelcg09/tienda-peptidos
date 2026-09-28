import type { Metadata } from "next";
import { RESEARCH_DISCLAIMER, store } from "@/lib/config";

export const metadata: Metadata = { title: "Términos y condiciones" };

// Texto base: debe revisarlo un abogado antes de publicar.
export default function Terminos() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-fg/80 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg [&_p]:mt-3">
      <h1 className="font-display text-3xl font-bold md:text-4xl text-fg">Términos y condiciones</h1>

      <h2>1. Uso exclusivo para investigación</h2>
      <p>{RESEARCH_DISCLAIMER}</p>
      <p>
        El comprador declara ser mayor de 18 años, contar con la formación necesaria para manipular compuestos de laboratorio
        y asume toda responsabilidad por el uso, almacenamiento y disposición de los productos adquiridos.
      </p>

      <h2>2. Información de los productos</h2>
      <p>
        Las descripciones tienen fines exclusivamente informativos y científicos. Nada de lo publicado en este sitio constituye
        indicación médica, recomendación de dosis ni afirmación sobre efectos en seres humanos.
      </p>

      <h2>3. Precios y pagos</h2>
      <p>
        Los precios están expresados en pesos chilenos (CLP) e incluyen IVA. Los pagos se procesan mediante una pasarela de pago
        externa; {store.name} no almacena datos de tarjetas.
      </p>

      <h2>4. Despacho</h2>
      <p>
        Realizamos envíos a todo Chile. El despacho es gratuito en compras sobre $80.000. Los plazos son referenciales y
        dependen de la empresa de transporte.
      </p>

      <h2>5. Cambios y devoluciones</h2>
      <p>
        Por tratarse de productos de laboratorio sellados, solo se aceptan devoluciones de productos con falla o error en el
        despacho, informados dentro de 10 días desde la recepción, sin perjuicio de los derechos que establece la Ley 19.496.
      </p>

      <h2>6. Contacto</h2>
      <p>Para consultas escríbenos a {store.email}.</p>
    </article>
  );
}
