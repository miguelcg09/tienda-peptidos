import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <span aria-hidden="true" className="animate-float mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="search" size={36} /></span>
      <p className="font-display text-7xl font-bold text-accent-2">404</p>
      <h1 className="t-page mt-4">No encontramos esta página</h1>
      <p className="mt-3 text-muted">El enlace puede estar mal escrito o el producto ya no está disponible. Revisa el catálogo o vuelve al inicio.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/productos" className="btn-primary">Ver productos</Link>
        <Link href="/" className="btn-ghost">Volver al inicio</Link>
      </div>
    </section>
  );
}
