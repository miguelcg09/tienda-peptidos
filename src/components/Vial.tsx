import { useId } from "react";

// Ilustración genérica de vial; reemplazar por fotos propias del producto.
export function Vial({ color, label, className = "" }: { color: string; label: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const text = label.length > 14 ? label.slice(0, 13) + "…" : label;
  return (
    <svg viewBox="0 0 120 210" className={className} role="img" aria-label={`Vial de ${label}`}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#9fb0c8" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#dbe4f0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#8394ad" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id={`s${id}`}>
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="198" rx="46" ry="9" fill={`url(#s${id})`} />
      <rect x="38" y="8" width="44" height="26" rx="5" fill={`url(#c${id})`} />
      <rect x="38" y="8" width="44" height="6" rx="3" fill="#fff" opacity="0.25" />
      <rect x="44" y="34" width="32" height="12" fill="#b6c2d4" />
      <rect x="26" y="46" width="68" height="144" rx="14" fill={`url(#g${id})`} stroke="#ffffff" strokeOpacity="0.35" />
      <rect x="26" y="90" width="68" height="62" fill="#0b1020" />
      <rect x="26" y="90" width="68" height="6" fill={color} />
      <text x="60" y="121" textAnchor="middle" fontSize={label.length > 9 ? 8 : 11} fontWeight="700" fill="#fff" fontFamily="system-ui">
        {text}
      </text>
      <text x="60" y="139" textAnchor="middle" fontSize="6" letterSpacing="1" fill={color} fontFamily="system-ui">
        RESEARCH ONLY
      </text>
      <rect x="32" y="52" width="6" height="132" rx="3" fill="#fff" opacity="0.35" />
    </svg>
  );
}
