"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { Icon } from "./Icon";
import { ProductSearch } from "./ProductSearch";

// Botón cuadrado de filete fino; al pasar el mouse se invierte (tinta sobre papel).
const control = "inline-flex min-h-11 items-center justify-center gap-2 border border-line-2 text-sm font-medium transition-colors hover:bg-fg hover:text-bg";

// Encabezado fijo de toda la tienda: una sola fila con celdas separadas por filetes. En celular el menú y el
// buscador se abren con un botón; el carrito queda siempre a la vista.
export function Header() {
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
  const link = "flex min-h-11 items-center gap-2 py-3 underline-offset-[6px] hover:underline lg:py-0";
  const num = "font-mono text-[0.8125rem] text-muted";
  const close = () => setMenu(false);

  return (
    <header className="sticky top-[var(--bar-h)] z-30 border-b border-fg bg-bg">
      <div className="wrap relative flex flex-wrap items-stretch lg:flex-nowrap">
        <Link href="/" className="order-1 flex min-h-[var(--head-h)] min-w-0 flex-1 items-center gap-2 pr-2 font-display text-base font-medium tracking-tight transition-opacity hover:opacity-80 min-[380px]:gap-2.5 min-[380px]:pr-3 min-[380px]:text-lg min-[420px]:text-xl md:text-[1.4rem] lg:flex-none lg:shrink-0 lg:border-r lg:pr-8">
          <span className="mark shrink-0" aria-hidden="true" />
          <span className="truncate">{settings.name}</span>
        </Link>

        <nav
          ref={nav}
          id={menuId}
          aria-label="Principal"
          className={`${menu ? "flex" : "hidden"} order-3 w-full flex-col divide-y divide-line border-t border-line text-base font-medium lg:order-2 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-x-8 lg:divide-y-0 lg:border-t-0 lg:px-8 lg:text-sm`}
        >
          <Link href="/#coleccion" onClick={close} className={link}><span className={num}>01</span>Colección</Link>
          <Link href="/#despacho" onClick={close} className={link}><span className={num}>02</span>Despacho</Link>
          <Link href="/guias" onClick={close} className={link}><span className={num}>03</span>Guías</Link>
          <a href={contact} onClick={close} className={link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
            <span className={num}>04</span>Contacto{external && <span className="sr-only"> (se abre en otra pestaña)</span>}
          </a>
        </nav>

        <div
          ref={finder}
          id={finderId}
          className={`${search ? "block" : "hidden"} order-4 w-full pb-3 lg:order-3 lg:ml-auto lg:block lg:w-52 lg:self-center lg:pb-0 xl:w-72`}
        >
          <ProductSearch variant="header" label="Buscar en la tienda" />
        </div>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 min-[380px]:gap-2 lg:order-4 lg:ml-6">
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
            {count > 0 && <span data-testid="carrito-cantidad" className="-ml-1 font-mono lg:ml-0">({count}<span className="sr-only"> {count === 1 ? "producto" : "productos"}</span>)</span>}
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
    </header>
  );
}
