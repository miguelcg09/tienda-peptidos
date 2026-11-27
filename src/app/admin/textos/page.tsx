import { getSettings } from "@/lib/settings";
import { requirePage } from "@/lib/admin";
import { COPY_GROUPS } from "@/lib/copy";
import { resetTextosAction, saveTextosAction } from "../actions";
import { TextoField } from "./TextoField";

export const dynamic = "force-dynamic";

export default async function Textos({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  await requirePage();
  const { guardado } = await searchParams;
  const textos = (await getSettings()).textos ?? {};
  const changedCount = Object.keys(textos).length;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Textos del sitio</h1>
      <p className="mt-2 text-muted">
        Cambia los títulos, botones y etiquetas fijos de la tienda. Lo que dejes igual al original o en blanco usa el texto original.
        Los textos de cada producto se cambian en Productos.
      </p>
      {guardado && (
        <p role="status" className="mt-4 rounded-lg bg-accent/10 p-3 text-sm text-accent">
          {guardado === "todos" ? "Se restauraron todos los textos originales." : guardado === "0" ? "No había cambios que guardar." : "Cambios guardados. Ya se ven en la tienda."}
        </p>
      )}

      <nav aria-label="Secciones" className="mt-6 flex flex-wrap gap-2 text-sm">
        {COPY_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="rounded-full border px-3 py-1 hover:border-accent">{g.title}</a>
        ))}
      </nav>

      <form action={saveTextosAction} className="mt-8 space-y-10">
        {COPY_GROUPS.map((g) => (
          <fieldset key={g.id} id={g.id} className="scroll-mt-6 space-y-4">
            <legend className="mb-1 text-lg font-semibold">{g.title}</legend>
            {g.note && <p className="text-sm text-muted">{g.note}</p>}
            {Object.entries(g.items).map(([key, e]) => (
              <TextoField key={key} name={key} label={e.label} def={e.def} value={textos[key] ?? ""} long={e.long} hint={e.hint} />
            ))}
          </fieldset>
        ))}
        <div className="sticky bottom-0 -mx-4 border-t bg-bg/95 px-4 py-4">
          <button className="btn-primary">Guardar textos</button>
        </div>
      </form>

      {changedCount > 0 && (
        <form action={resetTextosAction} className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>Tienes {changedCount} {changedCount === 1 ? "texto cambiado" : "textos cambiados"}.</span>
          <button className="rounded-full border px-4 py-1.5 text-fg transition hover:border-accent">Volver todos al original</button>
        </form>
      )}
    </div>
  );
}
