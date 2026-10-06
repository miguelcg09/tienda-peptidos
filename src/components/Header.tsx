"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { Icon } from "./Icon";
import { ProductSearch } from "./ProductSearch";

const control = "inline-flex min-h-11 items-center justify-center gap-2 rounded-btn border border-current text-sm font-medium transition-colors hover:bg-current/15";

// Barra de navegación: toma el color del texto de su contenedor, así sirve sobre el fondo de color de la
// portada y sobre el fondo normal de las demás páginas. En celular el menú y el buscador se abren con un
// botón; el carrito queda siempre a la vista.
export function NavBar({ compact = false, navLabel = "Principal" }: { compact?: boolean; navLabel?: string }) {
  const { count, setOpen, settings } = useCart();
  const pathname = usePathname();
  const uid = useId();
  const menuId = `${uid}-menu`;
  const finderId = `${uid}-buscador`;
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const finder = useRef<HTMLDivElement>(null);

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
  const link = "block py-3 underline-offset-[5px] hover:underline lg:inline lg:py-0";
  const close = () => setMenu(false);

  return (
    <div className={`relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-4 md:px-12 lg:flex-nowrap ${compact ? "py-3" : "py-5"}`}>
      <Link href="/" className="order-1 shrink-0 font-display text-xl font-medium tracking-tight transition-opacity hover:opacity-80 md:text-2xl">
        {settings.name}
      </Link>

      <nav
        ref={nav}
        id={menuId}
        aria-label={navLabel}
        className={`${menu ? "flex" : "hidden"} order-3 w-full flex-col divide-y divide-current/25 border-t border-current/25 text-base font-medium lg:order-2 lg:ml-6 lg:flex lg:w-auto lg:flex-row lg:gap-x-7 lg:divide-y-0 lg:border-t-0 lg:text-sm xl:gap-x-9`}
      >
        <Link href="/#coleccion" onClick={close} className={link}>Colección</Link>
        <Link href="/#despacho" onClick={close} className={link}>Despacho</Link>
        <Link href="/guias" onClick={close} className={link}>Guías</Link>
        <a href={contact} onClick={close} className={link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          Contacto{external && <span className="sr-only"> (se abre en otra pestaña)</span>}
        </a>
      </nav>

      <div
        ref={finder}
        id={finderId}
        className={`${search ? "block" : "hidden"} order-4 w-full lg:order-3 lg:ml-auto lg:block lg:w-48 xl:w-72`}
      >
        <ProductSearch variant="header" label={navLabel === "Principal" ? "Buscar en la tienda" : "Buscar en la tienda, barra fija"} />
      </div>

      <div className="order-2 ml-auto flex items-center gap-2 lg:order-4 lg:ml-0">
        <button
          ref={searchBtn}
          type="button"
          onClick={() => setSearch((v) => !v)}
          aria-expanded={search}
          aria-controls={finderId}
          className={`${control} w-11 lg:hidden`}
        >
          <Icon name={search ? "close" : "search"} size={20} />
          <span className="sr-only">Buscar un producto</span>
        </button>
        <button type="button" onClick={() => setOpen(true)} className={`${control} px-3 lg:px-5`}>
          <Icon name="cart" size={20} />
          <span className="sr-only lg:not-sr-only">Carrito</span>
          {count > 0 && <span data-testid="carrito-cantidad" className="-ml-1 lg:ml-0">({count}<span className="sr-only"> {count === 1 ? "producto" : "productos"}</span>)</span>}
        </button>
        <button
          ref={menuBtn}
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-controls={menuId}
          className={`${control} w-11 lg:hidden`}
        >
          <Icon name={menu ? "close" : "menu"} size={20} />
          <span className="sr-only">Menú</span>
        </button>
      </div>
    </div>
  );
}

// En la portada la barra va dentro del fondo de color; al bajar, una barra compacta queda fija arriba.
function StickyHome() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("portada");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <header
      inert={!show}
      className={`fixed inset-x-0 top-[var(--bar-h)] z-30 border-b bg-bg text-fg transition-transform duration-200 motion-reduce:transition-none ${show ? "translate-y-0" : "invisible -translate-y-full"}`}
    >
      <NavBar compact navLabel="Principal, barra fija" />
    </header>
  );
}

// Encabezado fijo de las páginas interiores. En la portada, la barra viene dentro de su fondo de color.
export function Header() {
  const pathname = usePathname();
  if (pathname === "/") return <StickyHome />;
  return (
    <header className="sticky top-[var(--bar-h)] z-30 border-b bg-bg">
      <NavBar compact />
    </header>
  );
}
