import { Icon, type IconName } from "./Icon";

// Encabezado de las páginas internas: etiqueta con ícono, título y bajada.
export function PageHead({ icon, label, title, children }: { icon: IconName; label: string; title: string; children?: React.ReactNode }) {
  return (
    <header>
      <p className="chip rise" style={{ "--i": 0 } as React.CSSProperties}><Icon name={icon} size={16} className="text-accent-2" />{label}</p>
      <h1 className="t-page rise mt-4" style={{ "--i": 1 } as React.CSSProperties}>{title}</h1>
      {children && <div className="rise mt-4 max-w-2xl text-lg text-muted" style={{ "--i": 2 } as React.CSSProperties}>{children}</div>}
    </header>
  );
}
