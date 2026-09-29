// Textos legales por defecto (términos, envíos y devoluciones, privacidad) y sus marcadores.
// Se editan en /admin/ajustes. Son versiones breves y generales, pensadas para Chile, con solo
// los datos necesarios; un abogado debe revisarlas antes de publicar. Formato: "## " inicia un título, una línea en blanco separa párrafos y
// las líneas que empiezan con "- " forman una lista.

export const legalPlaceholders: [string, string][] = [
  ["{{tienda}}", "nombre de la tienda"],
  ["{{razon_social}}", "razón social o nombre del vendedor"],
  ["{{rut}}", "RUT del vendedor"],
  ["{{domicilio}}", "domicilio comercial"],
  ["{{correo}}", "correo de contacto"],
  ["{{whatsapp}}", "WhatsApp"],
  ["{{envio}}", "costo de envío"],
  ["{{envio_gratis}}", "monto desde el que el envío es gratis"],
  ["{{sitio}}", "dirección del sitio"],
];

type LegalValues = {
  name: string; email: string; whatsapp: string; shippingCost: number; freeShippingFrom: number;
  legalName: string; legalRut: string; legalAddress: string;
};

const clp = (n: number) => `$${Math.round(n).toLocaleString("es-CL")}`;

// Reemplaza los marcadores; si un dato legal aún no está, lo deja visible entre corchetes.
export function renderLegal(text: string, s: LegalValues, siteUrl: string) {
  const values: Record<string, string> = {
    "{{tienda}}": s.name,
    "{{razon_social}}": s.legalName || "[razón social por completar]",
    "{{rut}}": s.legalRut || "[RUT por completar]",
    "{{domicilio}}": s.legalAddress || "[domicilio por completar]",
    "{{correo}}": s.email,
    "{{whatsapp}}": s.whatsapp,
    "{{envio}}": clp(s.shippingCost),
    "{{envio_gratis}}": clp(s.freeShippingFrom),
    "{{sitio}}": siteUrl.replace(/^https?:\/\//, ""),
  };
  return text.replace(/\{\{[a-z_]+\}\}/g, (m) => values[m] ?? m);
}

export const legalUpdatedDefault = "29 de septiembre de 2026";

export const terminosDefault = `## Uso exclusivo para investigación
Los productos de {{tienda}} se venden únicamente para investigación in vitro y uso de laboratorio. No son medicamentos ni suplementos, no cuentan con registro sanitario y no están destinados al consumo humano o animal ni a fines diagnósticos o terapéuticos.

Al comprar declaras ser mayor de 18 años, adquirir los productos con fines de investigación y contar con los conocimientos necesarios para manipularlos. Nos reservamos el derecho de rechazar pedidos cuando existan indicios de un uso distinto.

## Información de los productos
Las descripciones tienen fines informativos y científicos; no constituyen recomendaciones de uso ni de dosis. Cada lote cuenta con certificado de análisis. Las imágenes son referenciales y el stock puede variar sin previo aviso.

## Precios y pago
Los precios se expresan en pesos chilenos e incluyen impuestos. El costo de envío se informa antes de pagar. Los pagos se procesan a través de plataformas externas certificadas; no almacenamos datos de tarjetas. El pedido se confirma una vez acreditado el pago.

## Despacho
Despachamos a todo Chile con seguimiento. Los plazos son referenciales y dependen de la empresa de transporte. El comprador es responsable de la exactitud de la dirección entregada.

## Cambios y devoluciones
Por tratarse de productos de laboratorio, solo se aceptan devoluciones de productos sellados y sin uso, o con falla o error en el despacho, dentro de los plazos que establece la Ley 19.496. Escríbenos a {{correo}} para gestionarlo.

## Responsabilidad
{{tienda}} responde por la identidad y calidad de los productos según su certificado de análisis. No se hace responsable del uso que se les dé una vez entregados ni de daños derivados de un uso contrario a estos términos.

## Modificaciones y contacto
Podemos actualizar estos términos en cualquier momento; la versión vigente es la publicada en este sitio. Se rigen por las leyes de Chile. Consultas a {{correo}} o al WhatsApp {{whatsapp}}.`;

export const enviosDefault = `## Cobertura y plazos
Enviamos a todo Chile mediante empresas de transporte con seguimiento. Los pedidos pagados antes de las 16:00 de un día hábil se despachan el mismo día. Los plazos habituales son de 1 a 3 días hábiles en la Región Metropolitana y de 2 a 6 días hábiles en regiones; son referenciales y dependen del transportista.

## Costo
El costo de envío se muestra en el carrito antes de pagar. Los pedidos desde {{envio_gratis}} tienen envío gratis.

## Embalaje
Los productos viajan sellados y protegidos, en un embalaje discreto. Al recibirlos, recomendamos refrigerarlos según lo indicado en cada ficha.

## Seguimiento
Al despachar tu pedido te enviamos el número de seguimiento por correo. También puedes consultar el estado en "Seguir mi pedido".

## Dirección de entrega
Revisa que la dirección y el punto en el mapa sean correctos. Los reenvíos por datos incorrectos o entregas fallidas pueden tener un costo adicional.

## Devoluciones
Solo aceptamos devoluciones de productos sellados y sin uso, o con falla o daño de transporte. Si el paquete llega dañado, infórmanos dentro de 48 horas. Para iniciar una devolución escríbenos a {{correo}} con tu número de pedido; los reembolsos se realizan por el mismo medio de pago.`;

export const privacidadDefault = `## Responsable del tratamiento
{{tienda}}, con domicilio en Chile, es responsable del tratamiento de los datos personales que entregas en este sitio, conforme a la Ley 19.628 sobre Protección de la Vida Privada.

## Datos que recopilamos
Recopilamos los datos necesarios para procesar tu compra: nombre, RUT, correo electrónico, teléfono y dirección de entrega. Los datos de pago se ingresan directamente en la plataforma de pago; no almacenamos datos de tarjetas.

## Finalidad
Tus datos se utilizan para procesar pedidos, gestionar envíos, emitir documentos de venta, responder consultas y cumplir obligaciones legales. No los usamos con fines publicitarios sin tu autorización.

## Terceros
Compartimos solo la información necesaria con la empresa de transporte que entrega tu pedido, la plataforma de pago y los proveedores tecnológicos que sostienen el sitio. No vendemos tus datos.

## Derechos del titular
Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos escribiendo a {{correo}}.

## Cookies y almacenamiento
El sitio usa solo el almacenamiento necesario para su funcionamiento, como el contenido del carrito. Puedes borrarlo desde tu navegador, aunque esto puede afectar la experiencia de compra.

## Contacto
Consultas sobre privacidad: {{correo}} · WhatsApp {{whatsapp}}.`;
