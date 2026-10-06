import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Certificados de análisis por lote",
  description: "Busca por número de lote el certificado de análisis (pureza HPLC e identidad por espectrometría de masas) de cada producto.",
  alternates: { canonical: "/certificados" },
};
export const dynamic = "force-dynamic";

const fmt = (d?: string) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : "—");

export default async function Certificados({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const term = q.trim().toLowerCase();
  const list = products
    .filter((p) => p.category !== "Accesorios")
    .filter((p) => !term || p.name.toLowerCase().includes(term) || (p.lot ?? "").toLowerCase().includes(term) || (p.cas ?? "").includes(term));

  return (
    <div className="animate-fade mx-auto max-w-5xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Transparencia</p>
      <h1 className="t-page mt-2">Certificados por lote</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Cada lote se analiza por HPLC (pureza) y espectrometría de masas (identidad). El número de lote va impreso en la etiqueta del vial:
        búscalo aquí para ver su certificado.
      </p>

      <form method="get" className="mt-8 flex max-w-xl gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Número de lote, producto o CAS" aria-label="Buscar certificado" className="field mt-0 flex-1" />
        <button className="btn-primary text-sm">Buscar</button>
        {q && <Link href="/certificados" className="btn-ghost text-sm">Limpiar</Link>}
      </form>

      {list.length === 0 ? (
        <p className="mt-10 rounded-card border bg-surface p-5 text-sm">
          No encontramos ese lote. Escríbenos a <a href={`mailto:${settings.email}?subject=Consulta de lote ${q}`} className="text-accent">{settings.email}</a> con el número impreso en tu vial y lo revisamos.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border bg-surface">
          <ul className="divide-y" data-testid="certificados">
            {list.map((p) => (
              <li key={p.slug} className="grid gap-3 p-5 text-sm sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-center">
                <div>
                  <Link href={`/productos/${p.slug}`} className="font-display text-lg font-semibold hover:text-accent">{p.name}</Link>
                  <p className="text-xs text-muted">{p.category} · {p.variants.map((v) => v.label).join(" / ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Lote</p>
                  <p className="font-mono font-medium">{p.lot ?? "Por confirmar"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Analizado · Pureza</p>
                  <p className="font-medium">{fmt(p.lotDate)} · {p.purity.replace(" (HPLC)", "")}</p>
                </div>
                {p.coaUrl ? (
                  <a href={p.coaUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">Ver certificado</a>
                ) : (
                  <a href={`mailto:${settings.email}?subject=COA ${p.name}${p.lot ? ` lote ${p.lot}` : ""}`} className="btn-ghost text-xs">Pedir certificado</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-6 text-xs text-muted">
        Los certificados se publican a medida que se analiza cada lote. Si el lote de tu vial no aparece, escríbenos y lo verificamos. Solo para uso en investigación.
      </p>
    </div>
  );
}
