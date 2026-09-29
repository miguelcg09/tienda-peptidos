"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { categories, slugify, type Category, type Product, type Variant } from "@/lib/products";
import { decrementStock, deleteProduct, getProduct, setProductVisible, setVariants, upsertProduct } from "@/lib/catalog";
import { deleteOrder, getOrder, markPaid, markShipped, setOrderNote } from "@/lib/orders";
import { getSettings, saveSettings } from "@/lib/settings";
import { defaultSettings } from "@/lib/config";
import { sendBackInStockEmails, sendOrderEmails, sendShippedEmail } from "@/lib/email";
import { deleteCoupon, normalizeCode, saveCoupon, setCouponActive } from "@/lib/coupons";
import { clearStockWatchers, deleteSubscriber, stockWatchers } from "@/lib/subscribers";
import type { Settings } from "@/lib/config";
import { getPalette } from "@/lib/palettes";

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
    lot: str(form, "lot") || undefined,
    lotDate: /^\d{4}-\d{2}-\d{2}$/.test(str(form, "lotDate")) ? str(form, "lotDate") : undefined,
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

  const before = original ? await getProduct(slug, { includeHidden: true }) : null;
  await upsertProduct(product);
  await setVariants(slug, variants);

  // Si el producto estaba agotado y vuelve a tener stock, se avisa a quienes lo pidieron.
  const wasOut = Boolean(before && before.variants.length > 0 && before.variants.every((v) => v.stock === 0));
  if (wasOut && product.visible && variants.some((v) => v.stock !== 0)) {
    const watchers = await stockWatchers(slug);
    if (watchers.length > 0) {
      await sendBackInStockEmails({ name, slug }, watchers.map((w) => w.email), await getSettings());
      await clearStockWatchers(slug);
    }
  }
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
    palette: getPalette(str(form, "palette")).id,
    disclaimer: str(form, "disclaimer"),
    legalName: str(form, "legalName"),
    legalRut: str(form, "legalRut"),
    legalAddress: str(form, "legalAddress"),
    legalUpdated: str(form, "legalUpdated"),
    instagram: str(form, "instagram"),
    bankName: str(form, "bankName"),
    bankAccountType: str(form, "bankAccountType"),
    bankAccount: str(form, "bankAccount"),
    bankHolder: str(form, "bankHolder"),
    bankRut: str(form, "bankRut"),
    bankEmail: str(form, "bankEmail"),
    terminos: String(form.get("terminos") ?? "").trim(),
    envios: String(form.get("envios") ?? "").trim(),
    privacidad: String(form.get("privacidad") ?? "").trim(),
  };
  await saveSettings(patch);
  refreshStore();
  redirect("/admin/ajustes?guardado=1");
}

// Vuelve a los textos legales sugeridos (útil si se guardaron versiones antiguas).
export async function resetLegalAction() {
  await requireAdmin();
  await saveSettings({ terminos: defaultSettings.terminos, envios: defaultSettings.envios, privacidad: defaultSettings.privacidad });
  refreshStore();
  redirect("/admin/ajustes?guardado=1");
}

// Pedido por transferencia: al ver el abono se confirma aquí. Descuenta stock y envía la confirmación al cliente.
export async function confirmTransfer(form: FormData) {
  await requireAdmin();
  const paid = await markPaid(str(form, "id"), "transferencia");
  if (paid) {
    await decrementStock(paid.items);
    await sendOrderEmails(paid, await getSettings());
  }
  refreshStore();
  revalidatePath("/admin/pedidos");
}

export async function saveCouponAction(form: FormData) {
  await requireAdmin();
  const code = normalizeCode(str(form, "code"));
  if (!code) throw new Error("Escribe un código (letras y números)");
  const kind = str(form, "kind") === "monto" ? "monto" : "porcentaje";
  const value = num(form, "value");
  if (value <= 0 || (kind === "porcentaje" && value > 100)) throw new Error("El valor del cupón no es válido");
  await saveCoupon({
    code,
    kind,
    value,
    minSubtotal: Math.max(0, num(form, "minSubtotal")),
    maxUses: str(form, "maxUses") ? Math.max(1, num(form, "maxUses")) : null,
    expiresAt: /^\d{4}-\d{2}-\d{2}$/.test(str(form, "expiresAt")) ? str(form, "expiresAt") : null,
    active: true,
  });
  revalidatePath("/admin/cupones");
  redirect("/admin/cupones?guardado=1");
}

export async function toggleCoupon(code: string, active: boolean) {
  await requireAdmin();
  await setCouponActive(code, active);
  revalidatePath("/admin/cupones");
}

export async function removeCoupon(code: string) {
  await requireAdmin();
  await deleteCoupon(code);
  revalidatePath("/admin/cupones");
}

export async function removeSubscriber(id: number) {
  await requireAdmin();
  await deleteSubscriber(id);
  revalidatePath("/admin/suscriptores");
}
