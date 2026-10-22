// Nombre de la pieza en letras enormes y tenues detrás del vial. Es decoración (los lectores de pantalla lo ignoran).
// Necesita un contenedor con `container-type: inline-size` para medir su tamaño en cqw, y el color de la pieza en `--hue`.
// `className` coloca la caja del nombre dentro del panel; con `--wm-share` (fracción del ancho del panel que ocupa) se ajusta el tamaño.

// Parte el nombre en una o dos líneas: "A + B" se separa en el "+", y los nombres largos con espacio, por la mitad.
export function watermarkLines(name: string): string[] {
  const text = name.trim();
  const plus = text.indexOf(" + ");
  if (plus > 0) return [`${text.slice(0, plus)} +`, text.slice(plus + 3)];
  if (text.length > 11 && text.includes(" ")) {
    const mid = text.length / 2;
    let best = -1;
    for (let i = 0; i < text.length; i++) if (text[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return [text.slice(0, best), text.slice(best + 1)];
  }
  return [text];
}

export function Watermark({ name, max = 12, className = "inset-0" }: { name: string; max?: number; className?: string }) {
  const lines = watermarkLines(name);
  const longest = Math.max(...lines.map((l) => l.length));
  const size = `min(${max}rem, calc(var(--wm-share, 1) * ${(92 / (longest * 0.62)).toFixed(2)}cqw))`;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute grid place-items-center overflow-hidden ${className}`}>
      <p className="wm-text animate-wm select-none text-center font-display font-bold uppercase leading-[0.88] tracking-[-0.04em]" style={{ fontSize: size }}>
        {lines.map((l) => <span key={l} className="block whitespace-nowrap">{l}</span>)}
      </p>
    </div>
  );
}
