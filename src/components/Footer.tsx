import Link from "next/link";
import { RESEARCH_DISCLAIMER, store } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{store.name}</p>
          <p className="mt-2 text-sm">{store.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Tienda</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/productos" className="hover:text-white">Productos</Link></li>
            <li><Link href="/carrito" className="hover:text-white">Carrito</Link></li>
            <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Contacto</p>
          <p className="mt-3">{store.email}</p>
          <p>{store.whatsapp}</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-slate-400">
        <p className="mx-auto max-w-3xl">{RESEARCH_DISCLAIMER}</p>
        <p className="mt-2">© {new Date().getFullYear()} {store.name}</p>
      </div>
    </footer>
  );
}
