"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";

// Barra de navegación: toma el color del texto de su contenedor, así sirve sobre el fondo de color
// de la portada y sobre el fondo normal de las demás páginas.
export function NavBar() {
  const { count, setOpen, settings } = useCart();
  const contact = whatsappLink(settings.whatsapp, "Hola, tengo una consulta.") || `mailto:${settings.email}`;
  const link = "underline-offset-[5px] hover:underline";
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-10 gap-y-3 px-4 py-5 md:px-12">
      <Link href="/" className="order-1 font-display text-xl font-medium tracking-tight md:text-2xl">
        {settings.name}
      </Link>
      <nav aria-label="Principal" className="order-3 flex w-full gap-x-7 text-sm font-medium md:order-2 md:w-auto md:gap-x-9">
        <Link href="/#coleccion" className={link}>Colección</Link>
        <Link href="/#despacho" className={link}>Despacho</Link>
        <Link href="/guias" className={link}>Guías</Link>
        <a href={contact} className={link} {...(contact.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>Contacto</a>
      </nav>
      <button
        onClick={() => setOpen(true)}
        className="order-2 inline-flex min-h-11 items-center gap-2 rounded-btn border border-current px-5 text-sm font-medium transition-opacity hover:opacity-70 md:order-3"
        aria-label="Abrir carrito"
      >
        Carrito{count > 0 && <span data-testid="carrito-cantidad"> ({count})</span>}
      </button>
    </div>
  );
}

// Encabezado de las páginas interiores. La portada lleva la barra dentro de su fondo de color.
export function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <header className="sticky top-0 z-30 border-b bg-bg">
      <NavBar />
    </header>
  );
}
