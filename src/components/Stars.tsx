// Estrellas de valoración (0 a 5, admite decimales). Componente de presentación, sirve en servidor y cliente.
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span className={`relative inline-block whitespace-nowrap leading-none ${className}`} role="img" aria-label={`${value.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 estrellas`}>
      <span className="text-tint/20" aria-hidden>★★★★★</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden text-accent-2" style={{ width: `${pct}%` }} aria-hidden>★★★★★</span>
    </span>
  );
}
