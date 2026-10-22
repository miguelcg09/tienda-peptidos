import { Icon } from "./Icon";

// Última celda del catálogo: una invitación para quien no encuentra el compuesto que busca.
export function CatalogCta({ href }: { href: string }) {
  const external = href.startsWith("http");
  return (
    <div className="cell flex min-w-0 flex-col justify-between gap-8 bg-bg p-5 sm:p-6">
      <p className="label">Fin del índice</p>
      <div>
        <p className="font-display text-xl font-medium leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-2xl">¿Falta un compuesto?</p>
        <p className="mt-2 text-sm text-muted">Escríbenos y vemos si podemos incluirlo.</p>
      </div>
      <a href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium u-link" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        Escríbenos
        <Icon name="arrow" size={18} />
        {external && <span className="sr-only"> (se abre en otra pestaña)</span>}
      </a>
    </div>
  );
}
