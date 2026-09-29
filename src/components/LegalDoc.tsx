import Link from "next/link";
import type { Settings } from "@/lib/config";
import { renderLegal } from "@/lib/legal";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const docs = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/envios", label: "Envíos y devoluciones" },
  { href: "/privacidad", label: "Privacidad" },
];

// Página legal: título, fecha de vigencia, navegación entre documentos y el texto
// (editable en /admin/ajustes) con títulos "## ", párrafos y listas "- ".
export function LegalDoc({ title, text, settings, current }: { title: string; text: string; settings: Settings; current: string }) {
  const rendered = renderLegal(text, settings, siteUrl);
  // Se lee línea a línea: "## " título, "- " elemento de lista, línea en blanco cierra un párrafo.
  type Node = { kind: "h2"; text: string } | { kind: "ul"; items: string[] } | { kind: "p"; text: string };
  const nodes: Node[] = [];
  for (const raw of rendered.split("\n")) {
    const line = raw.trim();
    const last = nodes[nodes.length - 1];
    if (!line) { if (last?.kind === "p") nodes.push({ kind: "p", text: "" }); continue; }
    if (line.startsWith("## ")) nodes.push({ kind: "h2", text: line.slice(3) });
    else if (line.startsWith("- ")) {
      if (last?.kind === "ul") last.items.push(line.slice(2));
      else nodes.push({ kind: "ul", items: [line.slice(2)] });
    } else if (last?.kind === "p" && last.text) last.text += " " + line;
    else if (last?.kind === "p") last.text = line;
    else nodes.push({ kind: "p", text: line });
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 text-fg/80">
      <nav className="flex flex-wrap gap-2 text-xs">
        {docs.map((d) => (
          <Link key={d.href} href={d.href} className={`rounded-full border px-3 py-1 transition ${d.href === current ? "border-accent bg-accent text-on-accent" : "text-muted hover:border-accent hover:text-fg"}`}>
            {d.label}
          </Link>
        ))}
      </nav>
      <h1 className="mt-6 font-display text-3xl font-bold text-fg md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Vigente desde el {settings.legalUpdated}. {settings.name} · {settings.email}</p>
      {nodes.map((n, i) => {
        if (n.kind === "h2") return <h2 key={i} className="mt-8 text-xl font-semibold text-fg">{n.text}</h2>;
        if (n.kind === "ul") return <ul key={i} className="mt-2 list-disc space-y-1 pl-6">{n.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
        return n.text ? <p key={i} className="mt-3 leading-relaxed">{n.text}</p> : null;
      })}
      <p className="mt-10 rounded-2xl border bg-surface p-4 text-sm">
        ¿Dudas sobre este documento? Escríbenos a <a href={`mailto:${settings.email}`} className="font-medium text-accent">{settings.email}</a>.
      </p>
    </article>
  );
}
