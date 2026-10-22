"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { Icon, type IconName } from "./Icon";
import { ProductSearch } from "./ProductSearch";

const round = "inline-flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-2";

// Barra de navegación: una isla blanca con el nombre, los enlaces, el buscador y el carrito. En celular el menú y el
// buscador se abren con un botón dentro de la misma isla; el carrito queda siempre a la vista.
export function NavBar({ navLabel = "Principal" }: { compact?: boolean; navLabel?: string }) {
  const { count, setOpen, settings } = useCart();
  const pathname = usePathname();
  const uid = useId();
  const menuId = `${uid}-menu`;
  const finderId = `${uid}-buscador`;
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [stuck, setStuck] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const finder = useRef<HTMLDivElement>(null);

  // La isla toma una sombra suave en cuanto la página baja.
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Al cambiar de página se cierran los paneles.
  useEffect(() => { setMenu(false); setSearch(false); }, [pathname]);

  // Al abrir un panel, el foco entra en él; Escape lo cierra y devuelve el foco al botón.
  useEffect(() => { if (menu) nav.current?.querySelector<HTMLElement>("a")?.focus(); }, [menu]);
  useEffect(() => { if (search) finder.current?.querySelector<HTMLElement>("input")?.focus(); }, [search]);
  useEffect(() => {
    if (!menu && !search) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menu) { setMenu(false); menuBtn.current?.focus(); }
      else if (search) { setSearch(false); searchBtn.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, search]);

  const contact = whatsappLink(settings.whatsapp, "Hola, tengo una consulta.") || `mailto:${settings.email}`;
  const external = contact.startsWith("http");
  const link = "group/nav flex items-center gap-3 rounded-full px-4 py-3 transition-colors hover:bg-surface-2 lg:inline-flex lg:gap-0 lg:py-2";
  // Ícono de cada enlace: solo en el menú del celular
  const ico = (name: IconName) => <Icon name={name} size={20} className="text-accent-2 transition-transform duration-300 group-hover/nav:scale-110 lg:hidden" />;
  const close = () => setMenu(false);
  const here = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="wrap py-2.5 md:py-3">
      <div className={`relative flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[1.75rem] border border-line bg-surface px-2 py-1.5 pl-4 transition-shadow duration-300 sm:pl-5 lg:flex-nowrap lg:rounded-full lg:gap-x-3 ${stuck ? "shadow-[0_12px_28px_-20px_rgb(0_0_0/0.35)]" : ""}`}>
        <Link href="/" className="order-1 inline-flex shrink-0 items-center gap-2.5 font-display text-lg font-semibold tracking-tight sm:text-xl md:text-[1.35rem]">
          <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-lg bg-accent text-on-accent transition-transform duration-500 hover:rotate-12 max-[380px]:hidden"><Icon name="flask" size={15} /></span>
          {settings.name}
        </Link>

        <nav
          ref={nav}
          id={menuId}
          aria-label={navLabel}
          className={`${menu ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-line pt-2 text-base font-medium lg:order-2 lg:ml-4 lg:flex lg:w-auto lg:flex-row lg:gap-1 lg:border-t-0 lg:pt-0 lg:text-sm`}
        >
          <Link href="/#coleccion" onClick={close} className={link}>{ico("grid")}Colección</Link>
          <Link href="/#despacho" onClick={close} className={link}>{ico("truck")}Despacho</Link>
          <Link href="/guias" onClick={close} className={`${link} ${here("/guias") ? "bg-surface-2" : ""}`} aria-current={here("/guias") ? "page" : undefined}>{ico("doc")}Guías</Link>
          <a href={contact} onClick={close} className={link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
            {ico("chat")}Contacto{external && <span className="sr-only"> (se abre en otra pestaña)</span>}
          </a>
        </nav>

        <div
          ref={finder}
          id={finderId}
          className={`${search ? "block" : "hidden"} order-4 w-full px-1 pb-1 lg:order-3 lg:ml-auto lg:block lg:w-52 lg:px-0 lg:pb-0 xl:w-72`}
        >
          <ProductSearch variant="header" label={navLabel === "Principal" ? "Buscar en la tienda" : "Buscar en la tienda, barra fija"} />
        </div>

        <div className="order-2 ml-auto flex items-center gap-1 lg:order-4 lg:ml-0">
          <button
            ref={searchBtn}
            type="button"
            onClick={() => setSearch((v) => !v)}
            aria-expanded={search}
            aria-controls={finderId}
            className={`${round} lg:hidden`}
          >
            <Icon name={search ? "close" : "search"} size={20} />
            <span className="sr-only">Buscar un producto</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-[var(--btn-hover)] lg:px-5"
          >
            <span key={count} className={`inline-flex ${count > 0 ? "animate-wiggle" : ""}`}><Icon name="cart" size={20} /></span>
            <span className="sr-only lg:not-sr-only">Carrito</span>
            {count > 0 && <span key={count} data-testid="carrito-cantidad" className="animate-pop -ml-1 lg:ml-0">({count}<span className="sr-only"> {count === 1 ? "producto" : "productos"}</span>)</span>}
          </button>
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls={menuId}
            className={`${round} lg:hidden`}
          >
            <Icon name={menu ? "close" : "menu"} size={20} />
            <span className="sr-only">Menú</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Encabezado fijo de todas las páginas, también la portada: la isla queda siempre a mano.
export function Header() {
  return (
    <header className="sticky top-[var(--bar-h)] z-30 bg-bg">
      <NavBar />
    </header>
  );
}
