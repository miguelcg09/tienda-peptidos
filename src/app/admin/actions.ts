"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { categories, slugify, type Category, type Product, type Variant } from "@/lib/products";
import { deleteProduct, setProductVisible, setVariants, upsertProduct } from "@/lib/catalog";
import { deleteOrder, getOrder, markShipped, setOrderNote } from "@/lib/orders";
import { getSettings, saveSettings } from "@/lib/settings";
import { sendShippedEmail } from "@/lib/email";
import type { Settings } from "@/lib/config";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string, fallback = 0) => {
  const n = Number(String(f.get(k) ?? "").replace(/[^\d-]/g, ""));
  return Number.isFinite(n) && String(f.get(k) ?? "").trim() !== "" ? n : fallback;
};

function refreshStore() {
  revalidatePath("/", "layout");
}

// Sube la foto a Vercel Blob si está configurado; si no, usa la URL escrita a mano.
async function resolveImage(form: FormData, slug: string, current?: string) {
  const file = form.get("imagen");
  if (file instanceof File && file.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Para subir fotos activa Blob en Vercel (Storage > Create Database > Blob) o pega un enlace.");
    }
    const { put } = await import("@vercel/blob");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const blob = await put(`productos/${slug}-${Date.now()}.${ext}`, file, { access: "public" });
    return blob.url;
  }
  if (form.get("quitarImagen") === "on") return undefined;
  return str(form, "imageUrl") || current;
}

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const original = str(form, "originalSlug");
  const name = str(form, "name");
  if (!name) throw new Error("El nombre es obligatorio");
  const slug = original || slugify(str(form, "slug") || name);
  const category = (categories as readonly string[]).includes(str(form, "category"))
    ? (str(form, "category") as Category)
    : categories[0];

  const product: Omit<Product, "variants"> = {
    slug,
    name,
    category,
    short: str(form, "short"),
    description: str(form, "description"),
    purity: str(form, "purity"),
    form: str(form, "form"),
    cas: str(form, "cas") || undefined,
    color: str(form, "color") || "#34d399",
    imageUrl: await resolveImage(form, slug, str(form, "currentImageUrl") || undefined),
    mechanism: str(form, "mechanism") || undefined,
    storage: str(form, "storage") || undefined,
    reconstitution: str(form, "reconstitution") || undefined,
    research: str(form, "research") || undefined,
    coaUrl: str(form, "coaUrl") || undefined,
    featured: form.get("featured") === "on",
    visible: form.get("visible") === "on",
    sort: num(form, "sort", 0),
  };

  const ids = form.getAll("v_id").map(String);
  const labels = form.getAll("v_label").map(String);
  const prices = form.getAll("v_price").map(String);
  const compares = form.getAll("v_compare").map(String);
  const stocks = form.getAll("v_stock").map(String);
  const variants: Variant[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i].trim();
    const price = Number(prices[i].replace(/[^\d]/g, ""));
    if (!label || !Number.isFinite(price) || price <= 0) continue;
    const id = ids[i]?.trim() || `${slug}-${slugify(label)}`;
    const stockRaw = (stocks[i] ?? "").trim();
    const compareRaw = Number((compares[i] ?? "").replace(/[^\d]/g, ""));
    variants.push({
      id,
      label,
      price,
      compareAt: Number.isFinite(compareRaw) && compareRaw > price ? compareRaw : null,
      stock: stockRaw === "" ? null : Math.max(0, Number(stockRaw) || 0),
    });
  }
  if (variants.length === 0) throw new Error("Agrega al menos una presentación con precio");

  await upsertProduct(product);
  await setVariants(slug, variants);
  refreshStore();
  redirect("/admin/productos");
}

export async function toggleProductVisible(slug: string, visible: boolean) {
  await requireAdmin();
  await setProductVisible(slug, visible);
  refreshStore();
}

export async function removeProduct(slug: string) {
  await requireAdmin();
  await deleteProduct(slug);
  refreshStore();
}

export async function shipOrder(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const tracking = str(form, "tracking");
  if (!tracking) throw new Error("Escribe el número de seguimiento");
  const order = await markShipped(id, tracking);
  if (order) await sendShippedEmail(order, await getSettings());
  revalidatePath("/admin/pedidos");
}

export async function saveOrderNote(form: FormData) {
  await requireAdmin();
  await setOrderNote(str(form, "id"), str(form, "note"));
  revalidatePath("/admin/pedidos");
}

// Solo se pueden borrar pedidos de prueba o que nunca se pagaron.
export async function removeOrder(id: string) {
  await requireAdmin();
  const order = await getOrder(id);
  if (!order) return;
  const deletable = order.paymentRef === "modo-prueba" || order.status === "pendiente" || order.status === "fallido";
  if (!deletable) throw new Error("Un pedido pagado no se puede borrar");
  await deleteOrder(id);
  revalidatePath("/admin/pedidos");
}

export async function saveSettingsAction(form: FormData) {
  await requireAdmin();
  const patch: Settings = {
    name: str(form, "name"),
    tagline: str(form, "tagline"),
    email: str(form, "email"),
    whatsapp: str(form, "whatsapp"),
    shippingCost: num(form, "shippingCost"),
    freeShippingFrom: num(form, "freeShippingFrom"),
    shippingNote: str(form, "shippingNote"),
    disclaimer: str(form, "disclaimer"),
    terminos: String(form.get("terminos") ?? "").trim(),
  };
  await saveSettings(patch);
  refreshStore();
  redirect("/admin/ajustes?guardado=1");
}
