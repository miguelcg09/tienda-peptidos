import Link from "next/link";
import type { StoreSettings } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";
import { Icon, type IconName } from "./Icon";
import { Newsletter } from "./Newsletter";

const instagramUrl = (v: string) => (v.startsWith("http") ? v : `https://instagram.com/${v.replace(/^@/, "")}`);

const pill = "inline-flex min-h-11 items-center gap-2 rounded-full border border-control px-4 text-sm font-medium transition-colors hover:border-accent hover:bg-surface-2";

// Enlace del pie: al pasar el mouse o con el teclado aparece una flecha que se desliza
function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group/l inline-flex items-center gap-1.5 py-1 transition-colors hover:text-fg focus-visible:text-fg">
      <span className="underline-offset-4 group-hover/l:underline">{children}</span>
      <Icon name="arrow" size={14} className="-translate-x-1.5 opacity-0 transition-all duration-200 group-hover/l:translate-x-0 group-hover/l:opacity-100 group-focus-visible/l:translate-x-0 group-focus-visible/l:opacity-100" />
    </Link>
  );
}

function Heading({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-display text-base font-semibold">
      <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name={icon} size={16} /></span>
      {children}
    </p>
  );
}

export function Footer({ settings }: { settings: StoreSettings }) {
  const wa = whatsappLink(settings.whatsapp);
  return (
    <footer className="relative mt-6 overflow-hidden inverse rounded-t-[2.25rem] md:mt-10 md:rounded-t-[3rem]">
      <div className="wrap relative grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr_1.4fr]">
        <div>
          <p className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight"><span aria-hidden="true" className="h-3 w-3 rounded-[4px] bg-accent" />{settings.name}</p>
          <p className="mt-2 text-sm text-muted">{settings.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.instagram && (
              <a href={instagramUrl(settings.instagram)} target="_blank" rel="noreferrer" className={pill}><Icon name="instagram" size={18} className="text-accent-2" />Instagram</a>
            )}
            {wa && <a href={wa} target="_blank" rel="noreferrer" className={pill}><Icon name="chat" size={18} className="text-accent-2" />WhatsApp</a>}
          </div>
        </div>
        <div className="text-sm">
          <Heading icon="grid">Tienda</Heading>
          <ul className="mt-3 space-y-0.5 text-muted">
            <li><FootLink href="/productos">Productos</FootLink></li>
            <li><FootLink href="/calculadora">Calculadora de reconstitución</FootLink></li>
            <li><FootLink href="/guias">Guías</FootLink></li>
            <li><FootLink href="/pedido">Seguir mi pedido</FootLink></li>
          </ul>
        </div>
        <div className="text-sm">
          <Heading icon="help">Ayuda</Heading>
          <ul className="mt-3 space-y-0.5 text-muted">
            <li><FootLink href="/#faq">Preguntas frecuentes</FootLink></li>
            <li><FootLink href="/terminos">Términos y condiciones</FootLink></li>
            <li><FootLink href="/envios">Envíos y devoluciones</FootLink></li>
            <li><FootLink href="/privacidad">Privacidad</FootLink></li>
            <li className="flex items-center gap-2 pt-2"><Icon name="mail" size={16} className="shrink-0 text-accent-2" /><span className="min-w-0 [overflow-wrap:anywhere]">{settings.email}</span></li>
            <li className="flex items-center gap-2"><Icon name="chat" size={16} className="shrink-0 text-accent-2" />{settings.whatsapp}</li>
          </ul>
        </div>
        <div className="text-sm">
          <Heading icon="spark">Novedades y ofertas</Heading>
          <p className="mt-3 text-muted">Nuevos lotes y cupones. Un correo al mes como máximo.</p>
          <div className="mt-4"><Newsletter compact /></div>
        </div>
      </div>
      <div className="relative border-t border-line px-4 py-6 text-center text-xs text-muted">
        <p className="mx-auto flex max-w-3xl items-start justify-center gap-2 text-left sm:text-center"><Icon name="shield" size={16} className="mt-0.5 shrink-0 text-accent-2" /><span>{settings.disclaimer}</span></p>
        <p className="mt-2">
          © {new Date().getFullYear()} {settings.name}
          {settings.legalName && <> · {settings.legalName}{settings.legalRut && <> · RUT {settings.legalRut}</>}{settings.legalAddress && <> · {settings.legalAddress}</>}</>}
        </p>
      </div>
    </footer>
  );
}
