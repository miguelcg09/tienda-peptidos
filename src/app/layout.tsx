import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ResearchGate } from "@/components/ResearchGate";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { formatCLP } from "@/lib/products";
import { getPalette, paletteCss } from "@/lib/palettes";
import { hasBankData, toStoreSettings } from "@/lib/config";
import { cardProviderName } from "@/lib/payments";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { publicUrl } from "@/lib/site";

const display = Funnel_Display({ subsets: ["latin"], variable: "--font-funnel-display" });
const sans = Funnel_Sans({ subsets: ["latin"], variable: "--font-funnel-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// El catálogo y los ajustes viven en la base de datos, así que todo se renderiza por petición.
export const dynamic = "force-dynamic";

export async function generateViewport() {
  const p = getPalette((await getSettings()).palette);
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: p.light.bg },
      { media: "(prefers-color-scheme: dark)", color: p.dark.bg },
    ],
  };
}

const siteUrl = publicUrl();

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description = "Péptidos de investigación en Chile. Pago en pesos y despacho con seguimiento a todo Chile. Solo para uso en investigación, mayores de 18.";
  const title = `Péptidos de investigación en Chile | ${s.name}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${s.name}` },
    description,
    openGraph: { type: "website", siteName: s.name, locale: "es_CL", title, description },
    twitter: { card: "summary_large_image" },
    applicationName: s.name,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getProducts(), getSettings()]);
  const palette = getPalette(settings.palette);
  const provider = cardProviderName();
  const storeSettings = toStoreSettings(settings, { card: provider !== null, test: provider === "mock", transfer: hasBankData(settings) });
  return (
    <html lang="es-CL" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {/* Paleta elegida en /admin/ajustes */}
        <style dangerouslySetInnerHTML={{ __html: paletteCss(palette) }} />
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-card focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          Saltar al contenido
        </a>
        {/* Aviso de uso: fijo arriba en todas las páginas, también en la portada. En celular, versión corta de una línea */}
        <section aria-label="Aviso de uso y envío" className="sticky top-0 z-40 flex h-[var(--bar-h)] items-center justify-center gap-x-8 overflow-hidden whitespace-nowrap bg-fg px-4 text-center text-sm font-medium text-bg">
          <span className="sm:hidden">Solo investigación · +18</span>
          <span className="hidden sm:inline">Solo para uso en investigación · Mayores de 18 años</span>
          <span className="hidden lg:inline">Envío gratis sobre {formatCLP(settings.freeShippingFrom)}</span>
        </section>
        <StoreProvider catalog={catalog} settings={storeSettings}>
          <Header />
          <main id="contenido" tabIndex={-1} className="outline-none">{children}</main>
          <Footer settings={storeSettings} />
          <CartDrawer />
          <ResearchGate />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
