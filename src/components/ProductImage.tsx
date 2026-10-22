import type { Product } from "@/lib/products";
import { Vial, VialAuto } from "./Vial";

// Foto del producto si existe; si no, la ilustración del vial. tone "auto" (por defecto) sigue el modo claro u oscuro.
export function ProductImage({ product, className = "", tone = "auto" }: { product: Product; className?: string; tone?: "light" | "field" | "auto" }) {
  if (product.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.imageUrl} alt={product.name} className={`object-contain ${className}`} loading="lazy" />;
  }
  const props = { color: product.color, label: product.name, className, lot: product.lot, format: product.variants[0]?.label, kind: product.category === "Accesorios" ? ("liquid" as const) : ("powder" as const) };
  return tone === "auto" ? <VialAuto {...props} /> : <Vial {...props} tone={tone} />;
}
