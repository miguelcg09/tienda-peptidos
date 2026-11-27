// Textos fijos del sitio que se pueden cambiar desde /admin/textos sin tocar código.
// Cada texto tiene un valor por defecto; en la base solo se guardan los que alguien cambió (ajuste "textos").
// Las marcas {n}, {monto}, etc. se reemplazan al mostrar el texto.
import { faqs as faqsDefault } from "./faqs";
import { categories } from "./products";

// Nombre visible de cada categoría (el valor interno no cambia: lo usan la base y los enlaces).
export const CATEGORY_LABELS = ["Regeneración", "Metabólico", "Eje GH", "Enfoque", "Insumos"];

type Entry = { label: string; def: string; long?: boolean; hint?: string };
type Group = { id: string; title: string; note?: string; items: Record<string, Entry> };

export const COPY_GROUPS: Group[] = [
  {
    id: "barra",
    title: "Barra superior",
    items: {
      "barra.aviso": { label: "Aviso", def: "Solo para uso en investigación · Mayores de 18 años" },
      "barra.envio": { label: "Envío gratis", def: "Envío gratis sobre {monto}", hint: "{monto} = monto de envío gratis de Ajustes" },
    },
  },
  {
    id: "portada",
    title: "Portada",
    items: {
      "portada.antetitulo": { label: "Antetítulo", def: "Para quienes investigan por su cuenta" },
      "portada.titulo": { label: "Titular", def: "Péptidos de investigación." },
      "portada.bajada": { label: "Bajada del titular", def: "Pagas en pesos y" },
      "portada.bajadaDestacada": { label: "Parte destacada de la bajada", def: "sigues tu pedido." },
      "portada.texto": { label: "Texto", def: "Despachamos con seguimiento a todo Chile. No necesitas crear una cuenta.", long: true },
      "portada.boton": { label: "Botón", def: "Ver catálogo" },
      "portada.aviso": { label: "Aviso legal", def: "Solo para uso en investigación · Mayores de 18 años · No aptos para consumo humano ni animal", long: true },
      "portada.verFicha": { label: "Enlace a la ficha", def: "Ver ficha técnica" },
    },
  },
  {
    id: "categorias",
    title: "Categorías",
    note: "Nombre que se ve en las etiquetas de las fichas y en los filtros del catálogo.",
    items: Object.fromEntries(categories.map((c, i) => [`cat.${i + 1}`, { label: `Categoría ${i + 1} (${c})`, def: CATEGORY_LABELS[i] ?? c }])),
  },
  {
    id: "fichas",
    title: "Fichas de producto (tarjetas)",
    note: "El nombre, la descripción corta, la forma y los mg de cada producto se cambian en Productos.",
    items: {
      "ficha.desde": { label: "Antes del precio", def: "Desde" },
      "ficha.agregar": { label: "Botón agregar", def: "Agregar" },
      "ficha.agregado": { label: "Botón al agregar", def: "Agregado" },
      "ficha.elegir": { label: "Botón con varias presentaciones", def: "Elegir presentación" },
      "ficha.avisame": { label: "Botón si está agotado", def: "Avísame cuando vuelva" },
      "ficha.enStock": { label: "Con stock", def: "En stock" },
      "ficha.ultimas": { label: "Pocas unidades", def: "Últimas {n}", hint: "{n} = unidades que quedan" },
      "ficha.agotado": { label: "Sin stock", def: "Agotado" },
    },
  },
  {
    id: "inicio",
    title: "Secciones del inicio",
    items: {
      "inicio.p1.etiqueta": { label: "Dato 1 · etiqueta", def: "Envío" },
      "inicio.p1.titulo": { label: "Dato 1 · título", def: "Con seguimiento" },
      "inicio.p1.texto": { label: "Dato 1 · texto", def: "Cada pedido sale con número de seguimiento a todo Chile.", long: true },
      "inicio.p2.etiqueta": { label: "Dato 2 · etiqueta", def: "Pago" },
      "inicio.p2.titulo": { label: "Dato 2 · título", def: "En pesos" },
      "inicio.p2.texto": { label: "Dato 2 · texto", def: "Pagas en pesos chilenos, por transferencia bancaria.", long: true },
      "inicio.p3.etiqueta": { label: "Dato 3 · etiqueta", def: "Despacho" },
      "inicio.p3.titulo": { label: "Dato 3 · título", def: "Mismo día hábil" },
      "inicio.p3.texto": { label: "Dato 3 · texto", def: "{despacho}. Envío gratis sobre {monto}.", long: true, hint: "{despacho} = primera parte de la línea de despacho de Ajustes" },
      "inicio.p4.etiqueta": { label: "Dato 4 · etiqueta", def: "Si llega dañado" },
      "inicio.p4.titulo": { label: "Dato 4 · título", def: "48 horas" },
      "inicio.p4.texto": { label: "Dato 4 · texto", def: "Si tu pedido llega dañado, escríbenos dentro de 48 horas con tu número de pedido.", long: true },
      "inicio.catalogo.antetitulo": { label: "Catálogo · antetítulo", def: "Catálogo" },
      "inicio.catalogo.titulo": { label: "Catálogo · título", def: "{cantidad} compuestos de investigación, con su precio a la vista.", hint: "{cantidad} = número de productos en palabras" },
      "inicio.catalogo.texto": { label: "Catálogo · texto", def: "Todos los precios incluyen IVA. Si algo se agota, lo marcamos." },
      "inicio.pasos.antetitulo": { label: "Pasos · antetítulo", def: "Después de comprar" },
      "inicio.pasos.titulo": { label: "Pasos · título", def: "Qué pasa después de pagar" },
      "inicio.pasos.texto": { label: "Pasos · texto", def: "Tres pasos. Sin cuenta. Con seguimiento." },
      "inicio.paso1.titulo": { label: "Paso 1 · título", def: "Elige y agrega al carrito." },
      "inicio.paso1.texto": { label: "Paso 1 · texto", def: "No necesitas crear una cuenta. Pedimos nombre, RUT, contacto y dirección de despacho.", long: true },
      "inicio.paso2.titulo": { label: "Paso 2 · título", def: "Paga en pesos." },
      "inicio.paso2.texto": { label: "Paso 2 · texto", def: "Por transferencia bancaria: te mostramos los datos al confirmar y guardamos tu pedido 48 horas mientras transfieres.", long: true },
      "inicio.paso3.titulo": { label: "Paso 3 · título", def: "Recibe con seguimiento." },
      "inicio.paso3.texto": { label: "Paso 3 · texto", def: "Cuando despachamos, te enviamos el número de seguimiento por correo. También lo ves en “Seguir mi pedido”.", long: true },
      "inicio.faq.antetitulo": { label: "Preguntas · antetítulo", def: "Preguntas frecuentes" },
      "inicio.faq.titulo": { label: "Preguntas · título", def: "Lo que más preguntan antes de comprar" },
      "inicio.faq.texto": { label: "Preguntas · texto", def: "Respuestas cortas. Si falta la tuya, escríbenos." },
      "inicio.cierre.titulo": { label: "Cierre · título", def: "Péptidos de investigación, en pesos y con seguimiento a todo Chile.", long: true },
      "inicio.cierre.texto": { label: "Cierre · texto", def: "Elige tu compuesto, paga en pesos y sigue tu pedido con su número de seguimiento.", long: true },
    },
  },
  {
    id: "preguntas",
    title: "Preguntas frecuentes",
    note: "Se muestran en el inicio y en cada ficha. Escribe un guion (-) como pregunta para ocultarla.",
    items: Object.fromEntries(
      faqsDefault.flatMap((f, i) => [
        [`faq.${i + 1}.q`, { label: `Pregunta ${i + 1}`, def: f.q }],
        [`faq.${i + 1}.a`, { label: `Respuesta ${i + 1}`, def: f.a, long: true }],
      ]),
    ),
  },
];

export const COPY: Record<string, Entry> = Object.fromEntries(COPY_GROUPS.flatMap((g) => Object.entries(g.items)));
export type Textos = Record<string, string>;

// Texto final: el guardado si existe y no está vacío, si no el de fábrica; luego reemplaza {marcas}.
export function tx(textos: Textos | undefined, key: string, vars?: Record<string, string | number>) {
  const saved = textos?.[key];
  let s = saved !== undefined && saved.trim() !== "" ? saved : (COPY[key]?.def ?? key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

// Preguntas frecuentes con los cambios guardados. Una pregunta guardada como "-" se oculta.
export function faqsFrom(textos: Textos | undefined) {
  return faqsDefault
    .map((_, i) => ({ q: tx(textos, `faq.${i + 1}.q`), a: tx(textos, `faq.${i + 1}.a`) }))
    .filter((f) => f.q.trim() !== "-");
}

// Limpia lo que llega del formulario: solo claves conocidas, sin espacios sobrantes, y solo lo que difiere del de fábrica.
export function cleanTextos(input: Record<string, string>): Textos {
  const out: Textos = {};
  for (const [k, v] of Object.entries(input)) {
    const e = COPY[k];
    if (!e) continue;
    const t = v.replace(/\r\n/g, "\n").trim().slice(0, 2000);
    if (t && t !== e.def) out[k] = t;
  }
  return out;
}

// Nombre visible de una categoría.
export function catLabel(textos: Textos | undefined, category: string) {
  const i = (categories as readonly string[]).indexOf(category);
  return i < 0 ? category : tx(textos, `cat.${i + 1}`);
}
