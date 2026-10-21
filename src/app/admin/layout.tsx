import Link from "next/link";
import type { Metadata } from "next";
import { currentActor } from "@/lib/auth";
import { pendingReviewCount } from "@/lib/reviews";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin/ventas", label: "Ventas" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/resenas", label: "Reseñas" },
  { href: "/admin/suscriptores", label: "Suscriptores" },
  { href: "/admin/ajustes", label: "Ajustes" },
  { href: "/admin/usuarios", label: "Equipo" },
  { href: "/admin/auditoria", label: "Auditoría" },
];

const logout = (
  <form method="post" action="/admin/salir">
    <button className="inline-flex min-h-9 items-center px-3 text-sm text-muted hover:text-fg">Salir</button>
  </form>
);

// Cada persona entra con su propia cuenta. El layout solo dibuja el marco: cada página decide si hay acceso
// (requirePage) antes de leer datos.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await currentActor();
  // Sin sesión se muestra solo la página (la de ingreso, o una redirección): el panel no se dibuja.
  if (!actor) return <>{children}</>;

  // Sesión de instalación o clave por cambiar: solo se ve la tarea pendiente, sin el resto del panel.
  if (actor.bootstrap || actor.mustChange) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b pb-4">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">Administración</span>
          <div className="ml-auto">{logout}</div>
        </div>
        {children}
      </div>
    );
  }

  const pendingReviews = await pendingReviewCount();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b pb-4">
        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">Administración</span>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="inline-flex min-h-9 items-center rounded-full border px-4 text-sm hover:border-accent">
            {n.label}{n.href === "/admin/resenas" && pendingReviews > 0 && <span className="ml-1.5 rounded-full bg-accent-2 px-1.5 text-xs font-bold text-white">{pendingReviews}</span>}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/admin/cuenta" className="inline-flex min-h-9 items-center px-3 text-sm text-muted hover:text-fg" aria-label={`Mi cuenta: ${actor.name}`}>
            {actor.name}
          </Link>
          {logout}
        </div>
      </div>
      {children}
    </div>
  );
}
