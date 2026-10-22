import Link from "next/link";
import type { StoreSettings } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";
import { Newsletter } from "./Newsletter";

const instagramUrl = (v: string) => (v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/, "")}`);
const social = "inline-flex min-h-11 items-center border border-line-2 px-4 text-sm font-medium transition-colors hover:bg-fg hover:text-bg";
const col = "py-8 md:border-l md:border-rule md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0";
const link = "inline-flex min-h-9 items-center underline-offset-4 hover:text-fg hover:underline";

export function Footer({ settings }: { settings: StoreSettings }) {
  const wa = whatsappLink(settings.whatsapp);
  return (
    <footer className="border-t-2 border-fg bg-bg">
      <div className="wrap grid divide-y divide-line md:grid-cols-[1.2fr_1fr_1fr_1.4fr] md:divide-y-0 md:py-6">
        <div className={col}>
          <p className="flex items-center gap-2.5 font-display text-2xl font-medium tracking-tight"><span className="mark" aria-hidden="true" />{settings.name}</p>
          <p className="mt-3 max-w-[30ch] text-sm text-muted">{settings.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {settings.instagram && (
              <a href={instagramUrl(settings.instagram)} target="_blank" rel="noreferrer" className={social}>Instagram</a>
            )}
            {wa && <a href={wa} target="_blank" rel="noreferrer" className={social}>WhatsApp</a>}
          </div>
        </div>
        <div className={`${col} text-sm`}>
          <p className="label text-fg">Tienda</p>
          <ul className="mt-3 text-muted">
            <li><Link href="/productos" className={link}>Productos</Link></li>
            <li><Link href="/calculadora" className={link}>Calculadora de reconstitución</Link></li>
            <li><Link href="/guias" className={link}>Guías</Link></li>
            <li><Link href="/pedido" className={link}>Seguir mi pedido</Link></li>
          </ul>
        </div>
        <div className={`${col} text-sm`}>
          <p className="label text-fg">Ayuda</p>
          <ul className="mt-3 text-muted">
            <li><Link href="/#faq" className={link}>Preguntas frecuentes</Link></li>
            <li><Link href="/terminos" className={link}>Términos y condiciones</Link></li>
            <li><Link href="/envios" className={link}>Envíos y devoluciones</Link></li>
            <li><Link href="/privacidad" className={link}>Privacidad</Link></li>
            <li className="pt-3 font-mono text-[0.8125rem] [overflow-wrap:anywhere]">{settings.email}</li>
            <li className="font-mono text-[0.8125rem]">{settings.whatsapp}</li>
          </ul>
        </div>
        <div className={`${col} text-sm`}>
          <p className="label text-fg">Novedades y ofertas</p>
          <p className="mt-3 text-muted">Nuevos lotes y cupones. Un correo al mes como máximo.</p>
          <div className="mt-4"><Newsletter compact /></div>
        </div>
      </div>
      <div className="border-t border-fg">
        <div className="wrap py-6 text-xs text-muted">
          <p className="max-w-3xl">{settings.disclaimer}</p>
          <p className="mt-2 font-mono">
            © {new Date().getFullYear()} {settings.name}
            {settings.legalName && <> · {settings.legalName}{settings.legalRut && <> · RUT {settings.legalRut}</>}{settings.legalAddress && <> · {settings.legalAddress}</>}</>}
          </p>
        </div>
      </div>
    </footer>
  );
}
