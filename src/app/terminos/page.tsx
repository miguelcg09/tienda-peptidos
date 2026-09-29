import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = { title: "Términos y condiciones", alternates: { canonical: "/terminos" } };

// El texto se edita en /admin/ajustes. Debe revisarlo un abogado antes de publicar.
export default async function Terminos() {
  const settings = await getSettings();
  return <LegalDoc title="Términos y condiciones" text={settings.terminos} settings={settings} current="/terminos" />;
}
