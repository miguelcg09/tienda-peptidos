import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = { title: "Política de privacidad", alternates: { canonical: "/privacidad" } };

export default async function Privacidad() {
  const settings = await getSettings();
  return <LegalDoc title="Política de privacidad" text={settings.privacidad} settings={settings} current="/privacidad" />;
}
