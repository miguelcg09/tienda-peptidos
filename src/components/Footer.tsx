import Link from "next/link";
import type { Settings } from "@/lib/config";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="relative mt-28 overflow-hidden border-t bg-surface">
      <div className="glow -top-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 bg-accent/10" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{settings.name}</p>
          <p className="mt-2 text-sm text-muted">{settings.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Tienda</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/productos" className="hover:text-accent">Productos</Link></li>
            <li><Link href="/carrito" className="hover:text-accent">Carrito</Link></li>
            <li><Link href="/terminos" className="hover:text-accent">Términos y condiciones</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Contacto</p>
          <p className="mt-3 text-muted">{settings.email}</p>
          <p className="text-muted">{settings.whatsapp}</p>
        </div>
      </div>
      <div className="relative border-t px-4 py-6 text-center text-xs text-muted">
        <p className="mx-auto max-w-3xl">{settings.disclaimer}</p>
        <p className="mt-2">© {new Date().getFullYear()} {settings.name}</p>
      </div>
    </footer>
  );
}
