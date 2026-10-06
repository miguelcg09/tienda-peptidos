import { deep } from "@/lib/colors";

// Ilustración del vial hasta tener la fotografía del producto: vidrio transparente, tapa del color
// del producto y etiqueta con el nombre y el lote. Todo plano, sin degradados.
// tone "light": sobre fondos claros. tone "field": sobre el fondo de color de la portada.

function splitName(label: string): [string, string] {
  const up = label.toUpperCase();
  const i = up.indexOf(" + ");
  return i > 0 ? [`${up.slice(0, i)} +`, up.slice(i + 3)] : [up, ""];
}

// Tamaño de letra para que el nombre quepa en el ancho de la etiqueta.
const fit = (line: string) => Math.max(8, Math.min(19, Math.floor(88 / (Math.max(line.length, 1) * 0.66))));

export function Vial({
  color,
  label,
  className = "",
  tone = "light",
  lot,
  format,
}: {
  color: string;
  label: string;
  className?: string;
  tone?: "light" | "field";
  lot?: string;
  format?: string;
}) {
  const field = tone === "field";
  const cap = field ? deep(color) : color;
  const capTop = deep(color);
  const [l1, l2] = splitName(label);
  const display = { fontFamily: "var(--font-funnel-display), system-ui, sans-serif" };
  const mono = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" };
  const data = [lot ? `LOTE ${lot}` : "", format ?? ""].filter(Boolean);
  return (
    <svg viewBox="38 38 124 278" className={className} role="img" aria-label={`Vial de ${label}`}>
      <ellipse cx="100" cy="306" rx="56" ry="5" fill="#0b0f10" opacity={field ? 0.2 : 0.14} />
      <rect
        x="50" y="116" width="100" height="186" rx="14"
        fill="#ffffff" fillOpacity={field ? 0.2 : 0.55}
        stroke={field ? "#ffffff" : "#0b0f10"} strokeOpacity={field ? 0.8 : 0.35} strokeWidth="2"
      />
      <rect
        x="74" y="94" width="52" height="28" rx="4"
        fill="#ffffff" fillOpacity={field ? 0.2 : 0.55}
        stroke={field ? "#ffffff" : "#0b0f10"} strokeOpacity={field ? 0.8 : 0.35} strokeWidth="2"
      />
      <rect x="57" y="122" width="6" height="170" rx="3" fill="#ffffff" opacity={field ? 0.45 : 0.6} />
      <path d="M58 292 V272 Q64 262 76 266 Q88 258 102 264 Q116 258 128 266 Q140 262 142 274 V292 Q142 296 136 296 H64 Q58 296 58 292 Z" fill="#ffffff" />
      <path d="M58 284 H142 V292 Q142 296 136 296 H64 Q58 296 58 292 Z" fill="#e3e8e9" />
      <rect x="64" y="56" width="72" height="44" rx="5" fill={cap} />
      <rect x="70" y="44" width="60" height="16" rx="4" fill={capTop} />
      <rect x="64" y="92" width="72" height="8" rx="3" fill={field ? "#0b0f10" : capTop} opacity={field ? 0.25 : 1} />
      <rect x="50" y="166" width="100" height="90" fill="#ffffff" />
      <rect x="50" y="166" width="100" height="7" fill={cap} />
      <text x="100" y={l2 ? 196 : 205} textAnchor="middle" fontWeight="700" fontSize={fit(l1)} fill="#0b0f10" style={display}>{l1}</text>
      {l2 && <text x="100" y="212" textAnchor="middle" fontWeight="700" fontSize={fit(l2)} fill="#0b0f10" style={display}>{l2}</text>}
      {data.map((t, i) => (
        <text key={t} x="100" y={231 + i * 10} textAnchor="middle" fontSize="7.5" fill="#0b0f10" style={mono}>{t}</text>
      ))}
      <text x="100" y="251" textAnchor="middle" fontSize="6" fill="#0b0f10" style={mono}>SOLO INVESTIGACIÓN</text>
    </svg>
  );
}
