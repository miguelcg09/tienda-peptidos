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

- Inicio, catálogo con filtro por categoría y ficha de producto con selector de presentación, insignias de stock, pestañas (resumen, COA, reconstitución, preguntas, investigación) y barra de compra fija.
- Carrito lateral y página de carrito (se guarda en el navegador).
- Checkout con validación de RUT, región/comuna y aceptación de uso para investigación.
- Dirección de despacho con autocompletado: mientras el cliente escribe, `/api/geo` busca en Photon (OpenStreetMap, gratis y sin clave); al elegir una sugerencia se completan comuna y región y aparece un mapa con el punto de entrega. Botón "Usar mi ubicación" (GPS del navegador). El pedido guarda referencia (depto., casa) y coordenadas; en `/admin/pedidos` hay un enlace al punto en el mapa. `GEO_PROVIDER=mock` devuelve resultados fijos para probar sin red.
- Aviso de ingreso (+18 y solo investigación), rótulos en fichas y términos y condiciones base.
- Capa de pagos intercambiable (`src/lib/payments.ts`):
  - `mock`: modo de prueba, no cobra.
  - `dlocalgo`: dLocal Go. El cliente paga en CLP con medios chilenos y la liquidación llega en USD al extranjero.
- Pedidos guardados en Postgres (`src/lib/orders.ts`). En desarrollo se usa un Postgres embebido (PGlite) en `.data/`; en producción, `DATABASE_URL`.
- Correos de confirmación al cliente y aviso a la tienda (`src/lib/email.ts`) vía Resend. Sin `RESEND_API_KEY` se imprimen en consola.
- Webhook de dLocal Go que verifica el pago contra su API (y que monto y moneda coincidan) antes de marcar el pedido como pagado. Endpoints y cabecera verificados contra el cliente oficial.
- Página pública "Seguir mi pedido" (`/pedido`): con el número de pedido muestra el estado; con el correo del comprador, además el número de seguimiento.
- SEO: sitemap y robots automáticos, Open Graph con imagen generada por producto y datos estructurados (Product) en cada ficha.
- Panel de administración en `/admin` (clave `ADMIN_PASSWORD`, sesión de 30 días):
  - **Productos**: crear, editar, precios, precio anterior (muestra el descuento) y stock por presentación, fotos, textos de las pestañas de la ficha (investigación, reconstitución), enlace al COA, destacar, ocultar o borrar.
  - **Pedidos**: ver detalle, marcar despachado con número de seguimiento (avisa por correo al cliente), notas internas, borrar pedidos de prueba.
  - **Ajustes**: nombre, contacto, costo de envío, mínimo de envío gratis, línea de despacho de la ficha, aviso de investigación y términos.
- Catálogo y ajustes viven en la base de datos (`src/lib/catalog.ts`, `src/lib/settings.ts`). La primera vez se cargan los productos de ejemplo de `src/lib/products.ts`.
- Fotos de producto: con `BLOB_READ_WRITE_TOKEN` (Vercel Blob) se pueden subir desde el panel; sin él, se pega la URL de una imagen. Sin foto se muestra una ilustración del vial.

## Qué hacer antes de vender

- Desde `/admin/productos`: reemplazar los productos de ejemplo por los reales, con precios, stock y fotos.
- Desde `/admin/ajustes`: datos de contacto, envío y términos (revisar los términos con un abogado).
- Confirmar los nombres de campos del webhook de dLocal Go contra su documentación (`src/app/api/webhooks/dlocalgo/route.ts`).

## Despliegue

Pensado para Vercel: importar el repositorio y configurar las variables de `.env.example`.
Servicios necesarios en producción: una base Postgres (por ejemplo Neon, gratis) para `DATABASE_URL`,
una cuenta en Resend con un dominio verificado para los correos, y el procesador de pago elegido.
