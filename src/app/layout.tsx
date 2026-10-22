import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ResearchGate } from "@/components/ResearchGate";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { formatCLP } from "@/lib/products";
import { hasBankData, toStoreSettings } from "@/lib/config";
import { cardProviderName } from "@/lib/payments";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { publicUrl } from "@/lib/site";
import { PalettePicker } from "@/components/PalettePicker";
import { DEFAULT_PALETTE, PALETTE_COOKIE, isPalette, paletteSwitchEnabled } from "@/lib/preview-palette";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", axes: ["opsz"] });
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// El catálogo y los ajustes viven en la base de datos, así que todo se renderiza por petición.
export const dynamic = "force-dynamic";

// El color del navegador sigue al fondo del tema claro u oscuro de la paleta por defecto.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07151b" },
  ],
};

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
  const provider = cardProviderName();
  const storeSettings = toStoreSettings(settings, { card: provider !== null, test: provider === "mock", transfer: hasBankData(settings) });
  // Fuera de producción se puede probar cada paleta con el selector; en producción manda la de siempre.
  const picker = paletteSwitchEnabled();
  const saved = picker ? (await cookies()).get(PALETTE_COOKIE)?.value : undefined;
  const palette = isPalette(saved) ? saved : DEFAULT_PALETTE;
  return (
    <html lang="es-CL" data-palette={palette} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <div aria-hidden="true" className="scroll-progress" />
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-on-accent">
          Saltar al contenido
        </a>
        {/* Aviso de uso: fijo arriba en todas las páginas, también en la portada. En celular, versión corta de una línea */}
        <section aria-label="Aviso de uso y envío" className="sticky top-0 z-40 flex h-[var(--bar-h)] items-center justify-center gap-x-8 overflow-hidden whitespace-nowrap border-b border-line bg-bar px-4 text-center text-sm font-medium text-on-bar">
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
          {picker && <PalettePicker initial={palette} />}
        </StoreProvider>
      </body>
    </html>
  );
}
