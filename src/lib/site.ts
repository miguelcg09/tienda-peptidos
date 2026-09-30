// URL pública del sitio. Manda NEXT_PUBLIC_SITE_URL; si falta, se usa el dominio de producción que Vercel entrega solo
// (así los enlaces de correos, el sitemap y la imagen al compartir no apuntan a localhost).
export function publicUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (fromEnv || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/+$/, "");
}
