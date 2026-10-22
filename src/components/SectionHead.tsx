import { DrawRule } from "./DrawRule";

// Cabecera numerada de cada sección: "02  Catálogo" y un filete que se dibuja hacia la derecha.
export function SectionHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="label text-fg">{n}</span>
      <span className="label">{label}</span>
      <DrawRule className="h-px flex-1 bg-fg" />
    </div>
  );
}
