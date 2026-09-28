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

- Inicio, catálogo con filtro por categoría y ficha de producto con variantes.
- Carrito lateral y página de carrito (se guarda en el navegador).
- Checkout con validación de RUT, región/comuna y aceptación de uso para investigación.
- Aviso de ingreso (+18 y solo investigación), rótulos en fichas y términos y condiciones base.
- Capa de pagos intercambiable (`src/lib/payments.ts`):
  - `mock`: modo de prueba, no cobra.
  - `dlocalgo`: dLocal Go. El cliente paga en CLP con medios chilenos y la liquidación llega en USD al extranjero.
- Pedidos guardados en Postgres (`src/lib/orders.ts`). En desarrollo se usa un Postgres embebido (PGlite) en `.data/`; en producción, `DATABASE_URL`.
- Correos de confirmación al cliente y aviso a la tienda (`src/lib/email.ts`) vía Resend. Sin `RESEND_API_KEY` se imprimen en consola.
- Webhook de dLocal Go que verifica el pago contra su API antes de marcar el pedido como pagado.
- Vista privada de pedidos en `/admin/pedidos?clave=<ADMIN_PASSWORD>`.

## Qué editar antes de publicar

- `src/lib/config.ts`: nombre de la tienda, contacto, costos de envío.
- `src/lib/products.ts`: productos, precios y descripciones reales.
- `src/components/Vial.tsx`: reemplazar por fotos propias.
- `src/app/terminos/page.tsx`: revisar con un abogado.
- Confirmar los nombres de campos del webhook de dLocal Go contra su documentación (`src/app/api/webhooks/dlocalgo/route.ts`).

## Despliegue

Pensado para Vercel: importar el repositorio y configurar las variables de `.env.example`.
Servicios necesarios en producción: una base Postgres (por ejemplo Neon, gratis) para `DATABASE_URL`,
una cuenta en Resend con un dominio verificado para los correos, y el procesador de pago elegido.
