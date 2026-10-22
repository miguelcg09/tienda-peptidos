import { Icon } from "./Icon";

// Cinta lenta con los compuestos del catálogo. Es decoración (los lectores de pantalla la ignoran: el catálogo real está debajo)
// y se detiene al pasar el mouse. Con "reducir movimiento" queda quieta.
export function Ticker({ names }: { names: string[] }) {
  if (!names.length) return null;
  // Cada mitad debe ser más ancha que la pantalla para que el recorrido no deje huecos.
  const half = Array.from({ length: Math.max(2, Math.ceil(12 / names.length)) }, () => names).flat();
  return (
    <div aria-hidden="true" className="marquee-wrap overflow-hidden border-y border-line bg-surface py-4">
      <div className="marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {half.map((name, i) => (
              <li key={`${copy}-${i}`} className="flex items-center">
                <span className="px-6 font-display text-xl font-semibold tracking-tight text-muted md:px-8 md:text-2xl">{name}</span>
                <Icon name="spark" size={18} className="text-accent-2" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
