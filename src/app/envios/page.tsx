import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = { title: "Envíos y devoluciones", alternates: { canonical: "/envios" } };

export default async function Envios() {
  const settings = await getSettings();
  return <LegalDoc title="Envíos y devoluciones" text={settings.envios} settings={settings} current="/envios" />;
}
