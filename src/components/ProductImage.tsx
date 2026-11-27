import { isSupply, type Product } from "@/lib/products";
import { Vial } from "./Vial";

// Foto del producto si existe; si no, la ilustración del vial.
export function ProductImage({ product, className = "", tone = "light", format }: { product: Product; className?: string; tone?: "light" | "field"; format?: string }) {
  if (product.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.imageUrl} alt={product.name} className={`object-contain ${className}`} loading="lazy" />;
  }
  return <Vial color={product.color} label={product.name} className={className} tone={tone} lot={product.lot} format={format ?? product.variants[0]?.label} kind={isSupply(product) ? "liquid" : "powder"} />;
}
