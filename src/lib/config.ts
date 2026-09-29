// Valores por defecto de la tienda. Los reales se editan en /admin/ajustes y se guardan en la base de datos.
export type Settings = {
  name: string;
  tagline: string;
  email: string;
  whatsapp: string;
  shippingCost: number; // CLP
  freeShippingFrom: number; // CLP
  shippingNote: string; // línea de despacho en la ficha (plazos, couriers)
  disclaimer: string;
  terminos: string; // texto plano; las líneas en blanco separan párrafos, "## " inicia un título
};

export const defaultSettings: Settings = {
  name: "Helix Research",
  tagline: "Péptidos de grado investigación en Chile",
  email: "contacto@ejemplo.cl",
  whatsapp: "+56 9 0000 0000",
  shippingCost: 4990,
  freeShippingFrom: 80000,
  shippingNote: "Despachamos el mismo día hábil si compras antes de las 16:00 · Envío con seguimiento a todo Chile",
  disclaimer:
    "Todos los productos se venden exclusivamente para investigación in vitro y uso de laboratorio. No aptos para consumo humano o animal, ni para uso diagnóstico o terapéutico.",
  terminos: `## 1. Uso exclusivo para investigación
Todos los productos se venden exclusivamente para investigación in vitro y uso de laboratorio. No aptos para consumo humano o animal, ni para uso diagnóstico o terapéutico.

El comprador declara ser mayor de 18 años, contar con la formación necesaria para manipular compuestos de laboratorio y asume toda responsabilidad por el uso, almacenamiento y disposición de los productos adquiridos.

## 2. Información de los productos
Las descripciones tienen fines exclusivamente informativos y científicos. Nada de lo publicado en este sitio constituye indicación médica, recomendación de dosis ni afirmación sobre efectos en seres humanos.

## 3. Precios y pagos
Los precios están expresados en pesos chilenos (CLP) e incluyen IVA. Los pagos se procesan mediante una pasarela de pago externa; la tienda no almacena datos de tarjetas.

## 4. Despacho
Realizamos envíos a todo Chile. Los plazos son referenciales y dependen de la empresa de transporte.

## 5. Cambios y devoluciones
Por tratarse de productos de laboratorio sellados, solo se aceptan devoluciones de productos con falla o error en el despacho, informados dentro de 10 días desde la recepción, sin perjuicio de los derechos que establece la Ley 19.496.`,
};

// Compatibilidad con código antiguo: usar getSettings() en el servidor o useStore().settings en el cliente.
export const store = defaultSettings;
export const RESEARCH_DISCLAIMER = defaultSettings.disclaimer;
