import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ResearchGate } from "@/components/ResearchGate";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Effects } from "@/components/Effects";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { getPalette, paletteCss } from "@/lib/palettes";
import { hasBankData, toStoreSettings } from "@/lib/config";
import { cardProviderName } from "@/lib/payments";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400", "500", "600", "700"] });

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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description = "Péptidos de grado investigación con certificado de análisis por lote. Compra en pesos, envíos a todo Chile.";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${s.name} · ${s.tagline}`, template: `%s · ${s.name}` },
    description,
    openGraph: { type: "website", siteName: s.name, locale: "es_CL", title: `${s.name} · ${s.tagline}`, description },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getProducts(), getSettings()]);
  const palette = getPalette(settings.palette);
  const provider = cardProviderName();
  const storeSettings = toStoreSettings(settings, { card: provider !== null, test: provider === "mock", transfer: hasBankData(settings) });
  return (
    <html lang="es-CL" className={outfit.variable}>
      <body className="font-sans antialiased">
        {/* Paleta elegida en /admin/ajustes */}
        <style dangerouslySetInnerHTML={{ __html: paletteCss(palette) }} />
        <div className="grain" aria-hidden />
        <ScrollProgress />
        <Effects />
        <StoreProvider catalog={catalog} settings={storeSettings}>
          <Header />
          <main>{children}</main>
          <Footer settings={storeSettings} />
          <CartDrawer />
          <ResearchGate />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
