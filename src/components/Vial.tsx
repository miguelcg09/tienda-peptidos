// Ilustración genérica de vial; reemplazar por fotos propias del producto.
export function Vial({ color, label, className = "" }: { color: string; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} role="img" aria-label={`Vial de ${label}`}>
      <defs>
        <linearGradient id={`glass-${label}`} x1="0" x2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect x="38" y="8" width="44" height="26" rx="4" fill={color} />
      <rect x="44" y="34" width="32" height="12" fill="#94a3b8" />
      <rect x="26" y="46" width="68" height="140" rx="12" fill={`url(#glass-${label})`} stroke="#cbd5e1" />
      <rect x="26" y="88" width="68" height="62" fill="#fff" stroke="#e2e8f0" />
      <rect x="26" y="88" width="68" height="8" fill={color} />
      <text x="60" y="118" textAnchor="middle" fontSize={label.length > 9 ? 8 : 11} fontWeight="700" fill="#0b1220" fontFamily="system-ui">
        {label.length > 14 ? label.slice(0, 13) + "…" : label}
      </text>
      <text x="60" y="136" textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily="system-ui">
        RESEARCH ONLY
      </text>
      <rect x="34" y="162" width="52" height="16" rx="3" fill="#f1f5f9" />
    </svg>
  );
}
