import Link from "next/link";
import type { StoreSettings } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";
import { Newsletter } from "./Newsletter";

const instagramUrl = (v: string) => (v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/, "")}`);

export function Footer({ settings }: { settings: StoreSettings }) {
  const wa = whatsappLink(settings.whatsapp);
  return (
    <footer className="relative overflow-hidden border-t bg-surface">
      <div className="wrap relative grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
        <div>
          <p className="font-display text-2xl font-bold tracking-[-0.03em] [font-stretch:115%]">{settings.name}</p>
          <p className="mt-2 text-sm text-muted">{settings.tagline}</p>
          <div className="mt-4 flex gap-2">
            {settings.instagram && (
              <a href={instagramUrl(settings.instagram)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-btn border px-3 text-xs transition hover:border-accent">Instagram</a>
            )}
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-btn border px-3 text-xs transition hover:border-accent">WhatsApp</a>}
          </div>
        </div>
        <div className="text-sm">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">Tienda</p>
          <ul className="mt-3 space-y-0.5">
            <li><Link href="/productos" className="inline-block py-1 hover:underline underline-offset-4">Productos</Link></li>
            <li><Link href="/calculadora" className="inline-block py-1 hover:underline underline-offset-4">Calculadora de reconstitución</Link></li>
            <li><Link href="/guias" className="inline-block py-1 hover:underline underline-offset-4">Guías</Link></li>
            <li><Link href="/pedido" className="inline-block py-1 hover:underline underline-offset-4">Seguir mi pedido</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">Ayuda</p>
          <ul className="mt-3 space-y-0.5">
            <li><Link href="/#faq" className="inline-block py-1 hover:underline underline-offset-4">Preguntas frecuentes</Link></li>
            <li><Link href="/terminos" className="inline-block py-1 hover:underline underline-offset-4">Términos y condiciones</Link></li>
            <li><Link href="/envios" className="inline-block py-1 hover:underline underline-offset-4">Envíos y devoluciones</Link></li>
            <li><Link href="/privacidad" className="inline-block py-1 hover:underline underline-offset-4">Privacidad</Link></li>
            <li className="pt-2 text-muted">{settings.email}</li>
            <li className="text-muted">{settings.whatsapp}</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted">Novedades y ofertas</p>
          <p className="mt-3 text-muted">Nuevos lotes y cupones. Un correo al mes como máximo.</p>
          <div className="mt-4"><Newsletter compact /></div>
        </div>
      </div>
      <div className="relative border-t px-4 py-6 text-center text-xs text-muted">
        <p className="mx-auto max-w-3xl">{settings.disclaimer}</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {settings.name}
          {settings.legalName && <> · {settings.legalName}{settings.legalRut && <> · RUT {settings.legalRut}</>}{settings.legalAddress && <> · {settings.legalAddress}</>}</>}
        </p>
      </div>
    </footer>
  );
}
