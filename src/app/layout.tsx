import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ResearchGate } from "@/components/ResearchGate";
import { store } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });

export const viewport = { themeColor: "#05070d" };

export const metadata: Metadata = {
  title: { default: `${store.name} · ${store.tagline}`, template: `%s · ${store.name}` },
  description: "Péptidos de grado investigación con certificado de análisis. Envíos a todo Chile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <ResearchGate />
        </CartProvider>
      </body>
    </html>
  );
}
