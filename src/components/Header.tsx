"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { store } from "@/lib/config";

export function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center text-xs text-white">
        Envío gratis sobre $80.000 a todo Chile · Solo para uso en investigación
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">H</span>
          {store.name}
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/productos" className="hover:text-brand">Productos</Link>
          <Link href="/#calidad" className="hover:text-brand">Calidad</Link>
          <Link href="/#faq" className="hover:text-brand">Preguntas frecuentes</Link>
          <Link href="/terminos" className="hover:text-brand">Términos</Link>
        </nav>
        <button
          onClick={() => setOpen(true)}
          className="relative rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-brand"
          aria-label="Abrir carrito"
        >
          Carrito
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs text-white">
              {count}
            </span>
          )}
        </button>
      </div>
      <nav className="flex gap-5 overflow-x-auto px-4 pb-3 text-sm text-slate-600 md:hidden">
        <Link href="/productos">Productos</Link>
        <Link href="/#calidad">Calidad</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/terminos">Términos</Link>
      </nav>
    </header>
  );
}
