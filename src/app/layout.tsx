import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ResearchGate } from "@/components/ResearchGate";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { getPalette, paletteCss } from "@/lib/palettes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });

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

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.name} · ${s.tagline}`, template: `%s · ${s.name}` },
    description: "Péptidos de grado investigación con certificado de análisis. Envíos a todo Chile.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getProducts(), getSettings()]);
  const palette = getPalette(settings.palette);
  return (
    <html lang="es-CL" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        {/* Paleta elegida en /admin/ajustes */}
        <style dangerouslySetInnerHTML={{ __html: paletteCss(palette) }} />
        <div className="grain" aria-hidden />
        <StoreProvider catalog={catalog} settings={settings}>
          <Header />
          <main>{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
          <ResearchGate />
        </StoreProvider>
      </body>
    </html>
  );
}
