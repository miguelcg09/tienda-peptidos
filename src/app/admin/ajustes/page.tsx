import { getSettings } from "@/lib/settings";
import { saveSettingsAction } from "../actions";
import { palettes } from "@/lib/palettes";

export const dynamic = "force-dynamic";

export default async function Ajustes({ searchParams }: { searchParams: Promise<{ guardado?: string }> }) {
  const { guardado } = await searchParams;
  const s = await getSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Ajustes</h1>
      {guardado && <p className="mt-4 rounded-lg bg-accent/10 p-3 text-sm text-accent">Cambios guardados.</p>}

      <form action={saveSettingsAction} className="mt-8 space-y-8">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Tienda</legend>
          <label className="text-sm">Nombre<input name="name" required defaultValue={s.name} className="field" /></label>
          <label className="text-sm">Lema (bajo el nombre)<input name="tagline" defaultValue={s.tagline} className="field" /></label>
          <label className="text-sm">Correo de contacto<input name="email" type="email" defaultValue={s.email} className="field" /></label>
          <label className="text-sm">WhatsApp<input name="whatsapp" defaultValue={s.whatsapp} className="field" /></label>
        </fieldset>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Apariencia</legend>
          <p className="text-xs text-muted sm:col-span-2">Elige la combinación de colores. Cada una tiene versión clara y oscura; el visitante ve la de su sistema.</p>
          {palettes.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-surface p-4 has-[:checked]:border-accent has-[:checked]:ring-2 has-[:checked]:ring-accent/30">
              <input type="radio" name="palette" value={p.id} defaultChecked={s.palette === p.id} className="mt-1" />
              <span className="grow">
                <span className="block font-medium">{p.name}</span>
                <span className="block text-xs text-muted">{p.blurb}</span>
                <span className="mt-2 flex gap-1">
                  {[p.light.bg, p.light.surface, p.light.accent, p.light.accent2, p.dark.bg, p.dark.surface, p.dark.accent, p.dark.accent2].map((c, i) => (
                    <span key={i} className="h-5 w-5 rounded-full border" style={{ background: c }} />
                  ))}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Envío</legend>
          <label className="text-sm">Costo de envío (CLP)<input name="shippingCost" type="number" min={0} defaultValue={s.shippingCost} className="field" /></label>
          <label className="text-sm">Envío gratis desde (CLP)<input name="freeShippingFrom" type="number" min={0} defaultValue={s.freeShippingFrom} className="field" /></label>
          <label className="text-sm sm:col-span-2">Línea de despacho en la ficha de producto (plazos, empresas de transporte)
            <input name="shippingNote" defaultValue={s.shippingNote} className="field" />
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 font-semibold">Textos legales</legend>
          <label className="block text-sm">Aviso de uso para investigación (aparece en fichas, checkout, correos y pie de página)
            <textarea name="disclaimer" rows={3} defaultValue={s.disclaimer} className="field" />
          </label>
          <label className="block text-sm">Términos y condiciones. Una línea que empieza con "## " es un título; una línea en blanco separa párrafos.
            <textarea name="terminos" rows={18} defaultValue={s.terminos} className="field font-mono text-xs" />
          </label>
        </fieldset>

        <button className="btn-primary">Guardar ajustes</button>
      </form>
    </div>
  );
}
