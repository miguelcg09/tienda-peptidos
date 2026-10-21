"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { categories, formatCLP, slugify, type Category, type Product, type Variant } from "@/lib/products";
import { decrementStock, deleteProduct, getProduct, releaseStock, setProductVisible, setVariants, upsertProduct } from "@/lib/catalog";
import { deleteOrder, getOrder, markPaid, markShipped, setOrderNote } from "@/lib/orders";
import { getSettings, saveSettings } from "@/lib/settings";
import { defaultSettings } from "@/lib/config";
import { sendBackInStockEmails, sendOrderEmails, sendShippedEmail } from "@/lib/email";
import { deleteCoupon, describeCoupon, getCoupon, normalizeCode, saveCoupon, setCouponActive } from "@/lib/coupons";
import { clearStockWatchers, deleteSubscriber, listSubscribers, stockWatchers } from "@/lib/subscribers";
import { deleteReview, listAllReviews, setReviewStatus, type ReviewStatus } from "@/lib/reviews";
import type { Settings } from "@/lib/config";
import { getPalette } from "@/lib/palettes";
import { logAudit } from "@/lib/audit";
import { diffProduct, diffSettings, maskEmail, summarizeChanges } from "@/lib/audit-diff";

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
  const actor = await requireAdmin();
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
    let id = ids[i]?.trim() || `${slug}-${slugify(label)}`;
    // Dos presentaciones con el mismo nombre no pueden compartir identificador (la segunda pisaría a la primera).
    for (let n = 2; variants.some((v) => v.id === id); n++) id = `${slug}-${slugify(label)}-${n}`;
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
  // Un producto nuevo no puede pisar a uno que ya existe con la misma dirección (perdería sus presentaciones).
  if (!original && (await getProduct(slug, { includeHidden: true }))) {
    redirect(`/admin/productos/nuevo?error=existe&slug=${encodeURIComponent(slug)}`);
  }
  await upsertProduct(product);
  await setVariants(slug, variants);

  const changes = diffProduct(before, product, variants);
  if (!before) {
    await logAudit(actor, "producto.crear", { entity: "producto", entityId: slug, summary: `Creó el producto «${name}» (${variants.length} ${variants.length === 1 ? "presentación" : "presentaciones"})`, details: changes });
  } else if (changes.length > 0) {
    await logAudit(actor, "producto.editar", { entity: "producto", entityId: slug, summary: `Editó «${name}»: ${summarizeChanges(changes, "")}`, details: changes });
  }

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
  const actor = await requireAdmin();
  const p = await getProduct(slug, { includeHidden: true });
  await setProductVisible(slug, visible);
  await logAudit(actor, "producto.visibilidad", { entity: "producto", entityId: slug, summary: `${visible ? "Mostró" : "Ocultó"} «${p?.name ?? slug}» ${visible ? "en" : "de"} la tienda` });
  refreshStore();
}

export async function removeProduct(slug: string) {
  const actor = await requireAdmin();
  const p = await getProduct(slug, { includeHidden: true });
  await deleteProduct(slug);
  await logAudit(actor, "producto.borrar", {
    entity: "producto",
    entityId: slug,
    summary: `Borró el producto «${p?.name ?? slug}»${p ? ` (${p.variants.map((v) => `${v.label} ${formatCLP(v.price)}`).join(", ")})` : ""}`,
    details: p ? { name: p.name, variants: p.variants } : undefined,
  });
  refreshStore();
}

export async function shipOrder(form: FormData) {
  const actor = await requireAdmin();
  const id = str(form, "id");
  const tracking = str(form, "tracking");
  if (!tracking) throw new Error("Escribe el número de seguimiento");
  const order = await markShipped(id, tracking);
  if (order) {
    await logAudit(actor, "pedido.despachar", { entity: "pedido", entityId: id, summary: `Despachó el pedido ${id} (seguimiento ${tracking})` });
    await sendShippedEmail(order, await getSettings());
  }
  revalidatePath("/admin/pedidos");
}

export async function saveOrderNote(form: FormData) {
  const actor = await requireAdmin();
  const note = str(form, "note");
  const before = await getOrder(str(form, "id"));
  if (before && (before.note ?? "") !== note) {
    await setOrderNote(before.id, note);
    await logAudit(actor, "pedido.nota", { entity: "pedido", entityId: before.id, summary: `Cambió la nota interna del pedido ${before.id}`, details: { antes: before.note ?? "", despues: note } });
  }
  revalidatePath("/admin/pedidos");
}

// Solo se pueden borrar pedidos de prueba o que nunca se pagaron.
export async function removeOrder(id: string) {
  const actor = await requireAdmin();
  const order = await getOrder(id);
  if (!order) return;
  const deletable = order.paymentRef === "modo-prueba" || order.status === "pendiente" || order.status === "fallido";
  if (!deletable) throw new Error("Un pedido pagado no se puede borrar");
  if (order.stockHeld && order.status === "pendiente") await releaseStock(order.items); // anular una transferencia devuelve el stock
  await deleteOrder(id);
  const released = order.stockHeld && order.status === "pendiente";
  await logAudit(actor, "pedido.anular", {
    entity: "pedido",
    entityId: id,
    summary: `${released ? "Anuló" : "Eliminó"} el pedido ${id} (${order.status}, ${formatCLP(order.total)})${released ? " y devolvió el stock" : ""}`,
    details: { estado: order.status, total: order.total, items: order.items },
  });
  revalidatePath("/admin/pedidos");
}

export async function saveSettingsAction(form: FormData) {
  const actor = await requireAdmin();
  const before = await getSettings();
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
  const changes = diffSettings(before, { ...before, ...patch });
  if (changes.length > 0) await logAudit(actor, "ajustes.guardar", { entity: "ajustes", summary: `Cambió los ajustes: ${summarizeChanges(changes, "")}`, details: changes });
  refreshStore();
  redirect("/admin/ajustes?guardado=1");
}

// Vuelve a los textos legales sugeridos (útil si se guardaron versiones antiguas).
export async function resetLegalAction() {
  const actor = await requireAdmin();
  await saveSettings({ terminos: defaultSettings.terminos, envios: defaultSettings.envios, privacidad: defaultSettings.privacidad });
  await logAudit(actor, "ajustes.restaurar_textos", { entity: "ajustes", summary: "Restauró los términos, envíos y privacidad a los textos sugeridos" });
  refreshStore();
  redirect("/admin/ajustes?guardado=1");
}

// Pedido por transferencia: al ver el abono se confirma aquí. Descuenta stock y envía la confirmación al cliente.
export async function confirmTransfer(form: FormData) {
  const actor = await requireAdmin();
  const paid = await markPaid(str(form, "id"), "transferencia");
  if (paid) {
    await logAudit(actor, "pedido.confirmar_pago", { entity: "pedido", entityId: paid.id, summary: `Confirmó el pago por transferencia del pedido ${paid.id} (${formatCLP(paid.total)})` });
    if (!paid.stockHeld) await decrementStock(paid.items); // si estaba reservado, ya se descontó al crear el pedido
    await sendOrderEmails(paid, await getSettings());
  }
  refreshStore();
  revalidatePath("/admin/pedidos");
}

export async function saveCouponAction(form: FormData) {
  const actor = await requireAdmin();
  const code = normalizeCode(str(form, "code"));
  if (!code) throw new Error("Escribe un código (letras y números)");
  const kind = str(form, "kind") === "monto" ? "monto" : "porcentaje";
  const value = num(form, "value");
  if (value <= 0 || (kind === "porcentaje" && value > 100)) throw new Error("El valor del cupón no es válido");
  const existing = await getCoupon(code);
  const next = {
    code,
    kind,
    value,
    minSubtotal: Math.max(0, num(form, "minSubtotal")),
    maxUses: str(form, "maxUses") ? Math.max(1, num(form, "maxUses")) : null,
    expiresAt: /^\d{4}-\d{2}-\d{2}$/.test(str(form, "expiresAt")) ? str(form, "expiresAt") : null,
    active: true,
  } as const;
  await saveCoupon(next);
  await logAudit(actor, "cupon.guardar", {
    entity: "cupon",
    entityId: code,
    summary: `${existing ? "Editó" : "Creó"} el cupón ${code}: ${kind === "monto" ? formatCLP(value) : `${value} %`}${next.minSubtotal ? `, compra mínima ${formatCLP(next.minSubtotal)}` : ""}${next.maxUses ? `, máximo ${next.maxUses} usos` : ""}${next.expiresAt ? `, vence ${next.expiresAt}` : ""}`,
    details: { antes: existing ? describeCoupon(existing) : null, despues: next },
  });
  revalidatePath("/admin/cupones");
  redirect("/admin/cupones?guardado=1");
}

export async function toggleCoupon(code: string, active: boolean) {
  const actor = await requireAdmin();
  await setCouponActive(code, active);
  await logAudit(actor, "cupon.estado", { entity: "cupon", entityId: code, summary: `${active ? "Activó" : "Desactivó"} el cupón ${code}` });
  revalidatePath("/admin/cupones");
}

export async function removeCoupon(code: string) {
  const actor = await requireAdmin();
  await deleteCoupon(code);
  await logAudit(actor, "cupon.borrar", { entity: "cupon", entityId: code, summary: `Borró el cupón ${code}` });
  revalidatePath("/admin/cupones");
}

export async function removeSubscriber(id: number) {
  const actor = await requireAdmin();
  const sub = (await listSubscribers()).find((x) => x.id === id);
  await deleteSubscriber(id);
  await logAudit(actor, "suscriptor.borrar", { entity: "suscriptor", entityId: String(id), summary: `Borró al suscriptor ${sub ? maskEmail(sub.email) : `#${id}`}` });
  revalidatePath("/admin/suscriptores");
}

export async function setReviewStatusAction(id: number, status: ReviewStatus) {
  const actor = await requireAdmin();
  const r = (await listAllReviews()).find((x) => x.id === id);
  await setReviewStatus(id, status);
  await logAudit(actor, "resena.estado", { entity: "resena", entityId: String(id), summary: `Reseña de ${r?.name ?? `#${id}`} (${r?.productSlug ?? "producto"}): pasó a «${status}»` });
  refreshStore();
  revalidatePath("/admin/resenas");
}

export async function removeReview(id: number) {
  const actor = await requireAdmin();
  const r = (await listAllReviews()).find((x) => x.id === id);
  await deleteReview(id);
  await logAudit(actor, "resena.borrar", { entity: "resena", entityId: String(id), summary: `Borró la reseña de ${r?.name ?? `#${id}`} (${r?.productSlug ?? "producto"})`, details: r ? { rating: r.rating, body: r.body } : undefined });
  refreshStore();
  revalidatePath("/admin/resenas");
}
