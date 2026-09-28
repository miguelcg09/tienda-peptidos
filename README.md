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

## Qué editar antes de publicar

- `src/lib/config.ts`: nombre de la tienda, contacto, costos de envío.
- `src/lib/products.ts`: productos, precios y descripciones reales.
- `src/components/Vial.tsx`: reemplazar por fotos propias.
- `src/app/terminos/page.tsx`: revisar con un abogado.
- Guardar órdenes y confirmar pagos en el webhook (`src/app/api/webhooks/dlocalgo/route.ts`).

## Despliegue

Pensado para Vercel: importar el repositorio y configurar las variables de `.env.example`.
