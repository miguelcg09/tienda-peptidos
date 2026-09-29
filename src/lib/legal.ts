// Textos legales por defecto (términos, envíos y devoluciones, privacidad) y sus marcadores.
// Se editan en /admin/ajustes. Son borradores pensados para Chile: un abogado debe revisarlos
// antes de publicar. Formato: "## " inicia un título, una línea en blanco separa párrafos y
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

export const terminosDefault = `## 1. Quiénes somos y aceptación de estos términos
{{tienda}} es una tienda en línea operada por {{razon_social}}, RUT {{rut}}, con domicilio en {{domicilio}}, Chile (en adelante, "la Tienda"). Puedes contactarnos en {{correo}} o al WhatsApp {{whatsapp}}.

Al navegar en {{sitio}} y, especialmente, al realizar un pedido, aceptas íntegramente estos Términos y Condiciones, la Política de Envíos y Devoluciones y la Política de Privacidad. Si no estás de acuerdo con ellos, por favor no utilices el sitio.

## 2. Naturaleza de los productos: solo para investigación
Los productos ofrecidos son reactivos y materiales de laboratorio destinados exclusivamente a investigación científica in vitro. No son medicamentos, suplementos, cosméticos ni alimentos; no cuentan con registro sanitario y no han sido evaluados por autoridad sanitaria alguna para uso en seres humanos o animales.

En consecuencia, los productos no deben ser ingeridos, inyectados, inhalados ni aplicados de ninguna forma en personas o animales, ni utilizados con fines diagnósticos, terapéuticos, cosméticos o de mejora del rendimiento. Cualquier uso distinto de la investigación in vitro es contrario a estos términos y de exclusiva responsabilidad de quien lo realice.

## 3. Requisitos del comprador
Para comprar en la Tienda declaras y garantizas que:
- Eres mayor de 18 años y tienes capacidad legal para contratar.
- Adquieres los productos únicamente con fines de investigación, en tu calidad de investigador, laboratorio, institución académica o entidad afín, o bajo la supervisión de una de ellas.
- Cuentas con los conocimientos, el equipamiento y las medidas de seguridad necesarios para manipular, almacenar y eliminar reactivos de laboratorio.
- Los datos que entregas (nombre, RUT, dirección y contacto) son verdaderos y actuales.

La Tienda puede solicitar información adicional sobre el uso previsto y rechazar, suspender o cancelar cualquier pedido cuando existan indicios razonables de que los productos serán usados de forma contraria a estos términos, reembolsando lo pagado si corresponde.

## 4. Información de los productos
Las descripciones, mecanismos y referencias a la literatura científica que aparecen en el sitio tienen fines exclusivamente informativos y de divulgación científica. No constituyen indicación médica, recomendación de uso ni de dosis, ni afirmación alguna sobre efectos en seres humanos.

Cada lote se acompaña de un certificado de análisis (COA) que informa identidad y pureza medidas por métodos analíticos; la pureza indicada en el sitio es la declarada para el lote vigente. Las fotografías son referenciales y el envase o la presentación pueden variar sin alterar el contenido. La disponibilidad puede cambiar sin previo aviso.

## 5. Precios y pago
Los precios se expresan en pesos chilenos (CLP) e incluyen los impuestos que correspondan. El costo de envío se informa antes de confirmar la compra y depende del monto del pedido: los pedidos desde {{envio_gratis}} tienen envío gratis; bajo ese monto, el envío cuesta {{envio}}.

El pago se realiza a través de los medios habilitados en el proceso de compra. La Tienda no almacena datos de tarjetas: son procesados por la pasarela de pago correspondiente. El pedido queda confirmado solo una vez acreditado el pago; hasta entonces no se reserva stock.

Si por error se publicara un precio manifiestamente incorrecto, la Tienda podrá anular el pedido antes del despacho, informándote y reembolsando lo pagado en su totalidad.

## 6. Despacho y entrega
Despachamos a todo Chile mediante empresas de transporte con seguimiento. Los plazos son referenciales y se detallan en la Política de Envíos y Devoluciones. Al recibir el pedido revisa el embalaje y, en caso de daño visible, deja constancia ante el transportista e infórmanos dentro de 48 horas con fotografías.

Eres responsable de la exactitud de la dirección y del punto de entrega indicados en el mapa. Los reenvíos por datos incorrectos, o por no encontrarse nadie en la dirección tras los intentos del transportista, pueden tener un costo adicional.

## 7. Garantía legal y derecho a retracto
Garantía legal: si un producto llega con falla, dañado o no corresponde a lo comprado, tienes derecho, dentro de los 6 meses siguientes a la recepción, a la reposición del producto o a la devolución de lo pagado, conforme a la Ley 19.496 sobre Protección de los Derechos de los Consumidores. Escríbenos a {{correo}} con tu número de pedido y fotografías.

Retracto: en compras realizadas por medios electrónicos puedes retractarte dentro de los 10 días siguientes a la recepción del producto, siempre que este se encuentre sellado, sin uso y en su embalaje original. Por tratarse de reactivos sensibles a la temperatura y a la manipulación, no se aceptan devoluciones de productos abiertos, sin sello o reconstituidos, salvo falla imputable a la Tienda. Los costos de devolución por retracto son de cargo del comprador.

Los reembolsos se realizan por el mismo medio de pago dentro de los 10 días hábiles siguientes a la recepción del producto devuelto.

## 8. Responsabilidad
La Tienda responde por la identidad y calidad de los productos conforme a su certificado de análisis y por su despacho en las condiciones ofrecidas. No responde por el uso que se dé a los productos una vez entregados, ni por daños derivados de su manipulación, almacenamiento o uso contrario a estos términos, a la normativa aplicable o a las buenas prácticas de laboratorio.

El comprador asume toda responsabilidad por el cumplimiento de la normativa que le resulte aplicable en materia de investigación, manejo de sustancias y eliminación de residuos, y mantendrá indemne a la Tienda frente a reclamos de terceros derivados del uso de los productos.

Nada de lo dispuesto en estos términos limita los derechos irrenunciables que la Ley 19.496 reconoce a los consumidores.

## 9. Propiedad intelectual
Los textos, fotografías, marcas, logotipos y el diseño del sitio son de propiedad de la Tienda o de sus licenciantes y no pueden ser reproducidos ni utilizados sin autorización escrita, salvo para fines personales de consulta.

## 10. Datos personales
Los datos que nos entregas se tratan conforme a nuestra Política de Privacidad, disponible en el sitio, y a la Ley 19.628 sobre Protección de la Vida Privada y demás normas aplicables.

## 11. Modificaciones
La Tienda puede modificar estos términos en cualquier momento; los cambios rigen desde su publicación en el sitio y no afectan a los pedidos ya confirmados. La versión vigente estará siempre disponible en {{sitio}}/terminos.

## 12. Ley aplicable y solución de controversias
Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales competentes conforme a la Ley 19.496, sin perjuicio del derecho del consumidor a recurrir al Servicio Nacional del Consumidor (SERNAC). Antes de ello, te invitamos a escribirnos a {{correo}}: la mayoría de los problemas se resuelven rápidamente.`;

export const enviosDefault = `## Cobertura y plazos
Despachamos a todo Chile con empresas de transporte que entregan número de seguimiento. Los pedidos pagados antes de las 16:00 de un día hábil se preparan y despachan el mismo día; los demás, el siguiente día hábil.

Plazos referenciales desde el despacho:
- Región Metropolitana: 1 a 2 días hábiles.
- Regiones (capitales y ciudades principales): 2 a 4 días hábiles.
- Zonas extremas, rurales e insulares: 4 a 8 días hábiles.

Los plazos dependen de la empresa de transporte y pueden extenderse en fechas de alta demanda o por contingencias. Te avisaremos por correo si un pedido se retrasa.

## Costo de envío
El costo del envío se muestra en el carrito antes de pagar. Los pedidos desde {{envio_gratis}} tienen envío gratis; bajo ese monto el envío cuesta {{envio}} a cualquier punto de Chile.

## Embalaje y conservación
Los viales viajan sellados, protegidos de la luz y de los golpes, dentro de un embalaje discreto sin referencias al contenido. Los péptidos liofilizados toleran el transporte a temperatura ambiente durante varios días; al recibirlos, guárdalos refrigerados (2 a 8 °C) y protegidos de la luz, según lo indicado en cada ficha.

## Seguimiento
Cuando el pedido sale, te enviamos un correo con el número de seguimiento. También puedes revisar el estado en cualquier momento en la página "Seguir mi pedido", con tu número de pedido y el correo de la compra.

## Dirección y punto de entrega
En el checkout puedes escribir tu dirección, elegir tu comuna y ajustar el marcador en el mapa hasta tu puerta; ese punto es el que recibe el transportista. Revisa que sea correcto: los reenvíos por direcciones erróneas o incompletas tienen un costo adicional equivalente a un nuevo envío.

Si necesitas cambiar la dirección, escríbenos con tu número de pedido antes del despacho. Una vez despachado, el cambio depende de la empresa de transporte.

## Entrega fallida
Si el transportista no encuentra a nadie, hará un segundo intento o dejará el paquete en su sucursal por un plazo limitado. Si el paquete vuelve a nosotros por no haber sido retirado, te contactaremos para coordinar un nuevo envío, cuyo costo es de cargo del comprador.

## Recepción y daños en el transporte
Revisa el paquete al recibirlo. Si el embalaje llega dañado o faltan productos, déjalo indicado al transportista e infórmanos dentro de 48 horas a {{correo}} con fotografías del embalaje y del contenido. Reemplazamos sin costo los productos dañados en el transporte.

## Devoluciones
Por tratarse de reactivos de laboratorio, solo aceptamos devoluciones de productos sellados, sin uso y en su embalaje original.
- Retracto: hasta 10 días desde la recepción, con el producto sellado; el envío de vuelta es de cargo del comprador.
- Garantía legal: hasta 6 meses desde la recepción, si el producto presenta falla, llegó dañado o no corresponde a lo comprado; en este caso la devolución no tiene costo para ti.

No se aceptan devoluciones de productos abiertos, sin sello o reconstituidos, salvo falla imputable a la Tienda.

Para iniciar una devolución escríbenos a {{correo}} con tu número de pedido, el motivo y fotografías; te indicaremos cómo enviarlo. Una vez recibido y revisado, el reembolso se hace por el mismo medio de pago dentro de 10 días hábiles.

## Cancelaciones
Puedes cancelar un pedido sin costo mientras no haya sido despachado, escribiéndonos con el número de pedido. Si ya fue despachado, aplica el procedimiento de retracto.`;

export const privacidadDefault = `## 1. Responsable del tratamiento
El responsable del tratamiento de tus datos personales es {{razon_social}}, RUT {{rut}}, con domicilio en {{domicilio}}, Chile, que opera la tienda {{tienda}} en {{sitio}}. Para cualquier consulta sobre privacidad escribe a {{correo}}.

Esta política se rige por la Ley 19.628 sobre Protección de la Vida Privada y su reforma por la Ley 21.719, por la Ley 19.496 sobre Protección de los Derechos de los Consumidores y por las demás normas aplicables en Chile.

## 2. Qué datos recopilamos
- Datos de identificación y contacto que ingresas al comprar: nombre, RUT, correo electrónico y teléfono.
- Datos de entrega: dirección, comuna, región, referencia y coordenadas del punto de entrega que fijas en el mapa.
- Datos del pedido: productos, montos, estado del pago y del despacho, y las comunicaciones que intercambiamos contigo.
- Datos técnicos que genera tu navegación: dirección IP, tipo de navegador y dispositivo, páginas visitadas y fecha y hora, recogidos por la infraestructura del sitio con fines de seguridad y funcionamiento.

No recopilamos datos de tarjetas de pago: los ingresas directamente en la pasarela de pago, que los trata bajo sus propias políticas. Tampoco recopilamos datos de salud ni otros datos sensibles.

## 3. Para qué usamos tus datos
- Procesar tu pedido, cobrarlo, emitir el documento tributario y despacharlo.
- Comunicarte el estado del pedido y atender consultas, cambios y devoluciones.
- Cumplir obligaciones legales, tributarias y de protección al consumidor.
- Prevenir fraudes y usos contrarios a nuestros Términos y Condiciones.
- Mejorar el sitio a partir de información estadística agregada.

Solo te enviaremos comunicaciones comerciales si lo autorizas expresamente, y podrás desistir en cualquier momento.

## 4. Base de licitud
Tratamos tus datos porque son necesarios para ejecutar el contrato de compraventa que celebras con nosotros, para cumplir obligaciones legales y, cuando te lo pedimos, con tu consentimiento.

## 5. Con quién compartimos tus datos
Compartimos únicamente los datos necesarios con:
- Empresas de transporte, para entregar tu pedido (nombre, teléfono, dirección y punto de entrega).
- La pasarela de pago, para procesar el cobro y verificarlo.
- Proveedores de correo electrónico transaccional, para enviarte las confirmaciones.
- Proveedores de alojamiento y base de datos del sitio, que pueden estar ubicados fuera de Chile y operan bajo contratos que resguardan la confidencialidad y seguridad de la información.
- Autoridades públicas, cuando la ley lo exija.

No vendemos ni cedemos tus datos a terceros con fines publicitarios.

## 6. Cuánto tiempo conservamos tus datos
Conservamos los datos de tus pedidos mientras mantengamos relación comercial contigo y, después, por el plazo necesario para cumplir obligaciones legales (en materia tributaria, hasta 6 años) y atender eventuales reclamos. Los datos que ya no sean necesarios se eliminan o anonimizan.

## 7. Tus derechos
Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, oposición y portabilidad de tus datos, así como revocar el consentimiento que hayas otorgado, escribiendo a {{correo}} desde el correo asociado a tu compra o acreditando tu identidad. Responderemos dentro de los plazos legales. También puedes presentar un reclamo ante la autoridad de protección de datos personales, cuando se encuentre operativa, o ante el SERNAC en materias de consumo.

## 8. Cookies y almacenamiento en tu navegador
El sitio guarda en tu navegador (almacenamiento local) el contenido de tu carrito y la confirmación de que leíste el aviso de uso para investigación. No usamos cookies publicitarias ni de seguimiento de terceros. Puedes borrar esta información desde la configuración de tu navegador; al hacerlo se vaciará el carrito.

## 9. Seguridad
Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: conexiones cifradas (HTTPS), acceso restringido al panel de administración y proveedores con estándares de seguridad reconocidos. Ningún sistema es infalible; si detectamos un incidente que afecte tus datos, te informaremos conforme a la ley.

## 10. Menores de edad
El sitio está dirigido a mayores de 18 años. No vendemos a menores ni recopilamos sus datos a sabiendas; si detectamos una compra de un menor, la anularemos y eliminaremos sus datos.

## 11. Cambios a esta política
Podemos actualizar esta política para reflejar cambios legales u operativos. Publicaremos la versión vigente en {{sitio}}/privacidad indicando su fecha; los cambios relevantes se avisarán en el sitio.`;
