import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">No encontramos esta página</h1>
      <p className="mt-3 text-muted">El enlace puede estar mal escrito o el producto ya no está disponible. Revisa el catálogo o vuelve al inicio.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/productos" className="btn-primary">Ver productos</Link>
        <Link href="/" className="btn-ghost">Volver al inicio</Link>
      </div>
    </section>
  );
}
