import { formatCLP, type Product } from "@/lib/products";

// Cinta de productos en movimiento bajo la portada: nombre, presentaciones y precio desde. Es decorativa
// (la misma información está en el catálogo), así que los lectores de pantalla la saltan. Se detiene al pasar
// el mouse y queda quieta con "menos movimiento".
export function Ticker({ products }: { products: Product[] }) {
  const row = products.map((p) => ({
    name: p.name,
    sizes: p.variants.map((v) => v.label).join(" / "),
    from: Math.min(...p.variants.map((v) => v.price)),
  }));
  const items = (
    <>
      {row.map((r) => (
        <span key={r.name} className="flex shrink-0 items-center gap-3 px-6">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-semibold text-fg">{r.name}</span>
          <span>{r.sizes}</span>
          <span className="text-fg">{formatCLP(r.from)}</span>
        </span>
      ))}
    </>
  );
  return (
    <div aria-hidden="true" className="ticker overflow-hidden border-b bg-surface py-3.5 font-mono text-xs uppercase tracking-[0.08em] text-muted">
      <div className="ticker-track flex w-max">
        {items}
        {items}
      </div>
    </div>
  );
}
