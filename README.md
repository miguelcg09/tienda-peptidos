# Tienda de péptidos de investigación

Tienda online en Next.js con catálogo, carrito y checkout en CLP, pensada para el mercado chileno.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000.

## Qué incluye

- Diseño "Vitrina moderna" (versión 3, rama `version-3`): la portada es un campo plano del color de la pieza elegida (texto blanco o tinta según contraste, `src/lib/colors.ts`), con el vial ilustrado, una ficha de la pieza y un selector numerado 01 a 06 (`src/components/HomeHero.tsx`; muestra hasta 6 piezas, las destacadas primero). Debajo: la colección (todas las piezas con tarjeta de tono claro del color de cada producto; sobre 8 aparece el filtro por línea), cómo se despacha (sección oscura con un seguimiento de ejemplo), opiniones (solo con 3 o más reseñas) y preguntas frecuentes. Tipografías Funnel Display (títulos), Funnel Sans (texto) y Geist Mono (datos) con `next/font`; sin degradados, vidrio esmerilado, grano ni animaciones decorativas. El aviso de "solo investigación, mayores de 18" está siempre arriba. Los certificados y la calculadora siguen en `/certificados` y `/calculadora`, enlazados desde el pie. Las versiones anteriores del inicio siguen en las ramas `version-1` y `version-2`.
- Inicio, catálogo con filtro por categoría y ficha de producto con selector de presentación, insignias de stock, pestañas (resumen, COA, reconstitución, preguntas, investigación) y barra de compra fija.
- Carrito lateral y página de carrito (se guarda en el navegador).
- Checkout con validación de RUT, región/comuna y aceptación de uso para investigación.
- Dirección de despacho: región y comuna se eligen de la lista oficial (`src/lib/comunas.ts`, 346 comunas). Mientras el cliente escribe la calle, `/api/geo` sugiere direcciones con Photon (OpenStreetMap, gratis y sin clave), filtradas por la comuna elegida; la comuna solo se completa si coincide con una oficial. Como en Chile OpenStreetMap tiene pocos números de casa, si solo aparece la calle se conserva el número escrito. No hace falta elegir una sugerencia: al salir del campo (o con "Ver en el mapa") se ubica lo escrito y aparece un mapa (Leaflet + OpenStreetMap) con un marcador arrastrable; si la calle no está en el mapa, el marcador parte en el centro de la comuna. Botón "Usar mi ubicación" (GPS). El pedido guarda referencia (depto., casa) y coordenadas; en `/admin/pedidos` hay un enlace al punto en el mapa. `GEO_PROVIDER=mock` devuelve resultados fijos para probar sin red.
- Aviso de ingreso (+18 y solo investigación), rótulos en fichas y documentos legales breves en `/terminos`, `/envios` y `/privacidad` (versiones generales para Chile en `src/lib/legal.ts`, editables desde el panel, con marcadores como `{{razon_social}}` o `{{envio}}` que se reemplazan con los datos de Ajustes). Deben ser revisados por un abogado antes de vender.
- Medios de pago en el checkout (se muestran solo los que estén disponibles):
  - **Transferencia bancaria**: se activa al completar los datos bancarios en `/admin/ajustes`. El pedido queda pendiente, el cliente ve y recibe por correo los datos para transferir y tú lo confirmas en `/admin/pedidos` ("Confirmar pago recibido"), lo que envía la confirmación. El stock queda reservado desde que se crea el pedido; si no pagan, "Anular pedido y liberar stock" lo devuelve.
  - **Tarjeta**: capa intercambiable (`src/lib/payments.ts`) elegida con `PAYMENT_PROVIDER`. `dlocalgo` es la pasarela real (pago en CLP, liquidación en USD al extranjero); `mock` es modo de prueba que no cobra. Si la variable está vacía, la tarjeta queda desactivada.
  - Si no hay ninguno, el checkout ofrece pedir por WhatsApp o correo.
- Stock: solo se controla en las presentaciones donde cargaste una cantidad (vacío = sin control). Se descuenta al pagarse con tarjeta y se reserva al crear un pedido por transferencia (`orders.stock_held`, `decrementStock`/`releaseStock` en `src/lib/catalog.ts`). Al llegar a 0 la ficha muestra "Agotado" y ofrece el aviso de reposición.
- Reseñas (`/admin/resenas`): solo compradores con pedido despachado (número de pedido y correo deben coincidir, una reseña por producto y pedido). El correo de despacho trae el enlace a `/pedido?orden=...&email=...#resenas`. Quedan pendientes hasta que las publicas, se muestran con nombre abreviado ("Ana P.") y "Compra verificada", promedio en tarjetas y fichas, `aggregateRating` en los datos estructurados y sección de opiniones en el inicio cuando hay 3 o más con comentario. Oculta las que describan uso en personas o animales.
- Cupones de descuento (`/admin/cupones`): porcentaje o monto fijo, compra mínima, usos máximos y vencimiento. El servidor los vuelve a validar al crear el pedido.
- Correos de clientes: boletín en el pie y "Avísame cuando vuelva" en fichas agotadas (`/admin/suscriptores`, descarga en CSV). Al reponer stock desde el panel se avisa por correo a quienes esperaban.
- Confianza: `/certificados` (búsqueda por número de lote, con fecha y enlace al COA; el lote y su fecha se cargan en cada producto), `/calculadora` (concentración y volumen de una alícuota, solo cálculo de laboratorio), `/guias` (cómo comprar, leer un COA y almacenar), búsqueda de productos y orden del catálogo.
- Botón flotante de WhatsApp e Instagram en el pie, con los datos de Ajustes (el botón no aparece con el número de ejemplo).
- Pedidos guardados en Postgres (`src/lib/orders.ts`). En desarrollo se usa un Postgres embebido (PGlite) en `.data/`; en producción, `DATABASE_URL`.
- Correos de confirmación al cliente y aviso a la tienda (`src/lib/email.ts`) vía Resend. Sin `RESEND_API_KEY` se imprimen en consola.
- Webhook de dLocal Go que verifica el pago contra su API (y que monto y moneda coincidan) antes de marcar el pedido como pagado. Endpoints y cabecera verificados contra el cliente oficial.
- Página pública "Seguir mi pedido" (`/pedido`): con el número de pedido muestra el estado; con el correo del comprador, además el número de seguimiento.
- SEO: sitemap y robots automáticos, Open Graph con imagen generada por producto y datos estructurados (Product) en cada ficha.
- Panel de administración en `/admin` (clave `ADMIN_PASSWORD`, sesión de 30 días):
  - **Productos**: crear, editar, precios, precio anterior (muestra el descuento) y stock por presentación, fotos, textos de las pestañas de la ficha (investigación, reconstitución), enlace al COA, destacar, ocultar o borrar.
  - **Pedidos**: ver detalle, marcar despachado con número de seguimiento (avisa por correo al cliente), notas internas, borrar pedidos de prueba.
  - **Ajustes**: nombre, contacto, costo de envío, mínimo de envío gratis, línea de despacho de la ficha, datos legales del vendedor (razón social, RUT, domicilio), aviso de investigación, términos, envíos y devoluciones y privacidad.
  - **Apariencia** (dentro de Ajustes): paleta de colores. Por defecto "Vitrina" (hielo, blanco y tinta, con modo oscuro); también Carbón y ámbar, Noche violeta, Tinta y coral y Bosque (`src/lib/palettes.ts`). Cada paleta define solo colores y radios; el color de cada producto sale del campo de color de su ficha.
- Tipografía: la escala está definida una sola vez en `src/app/globals.css` (bloque `@theme`, variables `--text-*`): base de 17 px, texto pequeño de 13,5 y 15,5 px, y títulos que crecen de forma pareja. Para subir o bajar todo el sitio se cambian esos valores, no cada página.
- Identidad del sitio: favicon (`src/app/favicon.ico` y `icon.svg`), ícono del iPhone (`apple-icon.png`), íconos de la app en `public/icons/` con `manifest.ts` (se puede agregar a la pantalla de inicio), imagen al compartir el enlace (`opengraph-image.tsx`, y una por producto), página 404 y de error con la marca, enlace "Saltar al contenido", datos estructurados Organization y WebSite en el inicio y cabeceras de seguridad en `next.config.ts` (el panel y las APIs salen con noindex).
- La URL pública sale de `NEXT_PUBLIC_SITE_URL`; si falta se usa el dominio de producción de Vercel (`src/lib/site.ts`), para que correos, sitemap y vista previa no apunten a localhost.
- Catálogo y ajustes viven en la base de datos (`src/lib/catalog.ts`, `src/lib/settings.ts`). La primera vez se cargan los productos de ejemplo de `src/lib/products.ts`.
- Fotos de producto: con `BLOB_READ_WRITE_TOKEN` (Vercel Blob) se pueden subir desde el panel; sin él, se pega la URL de una imagen. Sin foto se muestra una ilustración del vial.

## Qué hacer antes de vender

- Desde `/admin/productos`: reemplazar los productos de ejemplo por los reales, con precios, stock y fotos.
- Desde `/admin/ajustes`: datos de contacto, envío, datos bancarios para transferencias y términos (revisar los términos con un abogado).
- Cargar el lote y la fecha de análisis de cada producto (y el enlace al COA) para que aparezcan en `/certificados`.
- Confirmar los nombres de campos del webhook de dLocal Go contra su documentación (`src/app/api/webhooks/dlocalgo/route.ts`).

## Despliegue

Pensado para Vercel: importar el repositorio y configurar las variables de `.env.example`.
Servicios necesarios en producción: una base Postgres (por ejemplo Neon, gratis) para `DATABASE_URL`,
una cuenta en Resend con un dominio verificado para los correos, y el procesador de pago elegido.
