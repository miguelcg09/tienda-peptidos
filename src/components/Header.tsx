"use client";

import Link from "next/link";
import { formatCLP } from "@/lib/products";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

const links = [
  { href: "/productos", label: "Productos" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/certificados", label: "Certificados" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/guias", label: "Guías" },
];

export function Header() {
  const { count, setOpen, settings } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pequeño rebote del contador al agregar productos
  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <header className={`sticky top-0 z-30 transition-colors duration-300 relative ${scrolled ? "border-b bg-bg/75 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="overflow-hidden border-b bg-gradient-to-r from-accent/10 via-accent-2/10 to-accent/10 py-2 text-xs text-fg/80">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            [
              `🚚 Envío gratis sobre ${formatCLP(settings.freeShippingFrom)} a todo Chile`,
              "🔬 Pureza ≥ 98% verificada por HPLC",
              "📄 Certificado de análisis por lote",
              "⚠️ Solo para uso en investigación",
            ].map((t) => <span key={`${k}-${t}`}>{t}</span>),
          )}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm text-on-accent transition-transform group-hover:rotate-12">
            ⬡
          </span>
          {settings.name}
        </Link>
        <nav className="hidden gap-8 text-sm text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative transition-colors hover:text-fg after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full">
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="glass relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:border-accent/60"
          aria-label="Abrir carrito"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          Carrito
          {count > 0 && (
            <span className={`absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-on-accent transition-transform ${bump ? "scale-125" : ""}`}>
              {count}
            </span>
          )}
        </button>
      </div>
      <nav className="flex gap-6 overflow-x-auto px-4 pb-3 text-sm text-muted md:hidden">
        {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <span className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-accent via-accent-2 to-accent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} aria-hidden />
    </header>
  );
}
