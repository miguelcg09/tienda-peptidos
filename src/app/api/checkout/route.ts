import { NextResponse } from "next/server";
import { findVariant, decrementStock, releaseStock, reserveStock } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { cardProviderName, getPaymentProvider } from "@/lib/payments";
import { isValidRut } from "@/lib/rut";
import { createOrder, markFailed, markPaid, newOrderId, setStockHeld, type OrderItem } from "@/lib/orders";
import { sendOrderEmails, sendTransferEmails } from "@/lib/email";
import { applyCoupon, redeemCoupon, releaseCoupon } from "@/lib/coupons";
import { hasBankData } from "@/lib/config";
import { getRegion } from "@/lib/comunas";
import { isEmail, isPhone, isRecord, text } from "@/lib/validate";
import { tooManyRequests } from "@/lib/rate-limit";

const MAX_QTY = 99; // unidades por presentación
const MAX_LINES = 30; // presentaciones distintas por pedido

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  if (tooManyRequests(req, "checkout", 20, 60_000)) return bad("Demasiados intentos. Espera un minuto e inténtalo de nuevo.", 429);
  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body)) return bad("Solicitud inválida");
  const settings = await getSettings();

  if (!Array.isArray(body.lines) || body.lines.length === 0) return bad("El carrito está vacío");
  if (!isRecord(body.customer)) return bad("Datos de contacto incompletos");
  const c = body.customer;
  if (!c.researchAck) return bad("Debes aceptar el uso exclusivo para investigación");

  // Datos del cliente: texto con largo máximo, correo y teléfono con formato, región y comuna oficiales.
  const name = text(c.name, 120);
  const email = text(c.email, 254);
  const phone = text(c.phone, 30);
  const rut = text(c.rut, 14);
  const address = text(c.address, 200);
  const region = text(c.region, 60);
  const comuna = text(c.comuna, 60);
  const reference = text(c.reference ?? "", 200);
  if (!name || name.length < 2 || !address || address.length < 3 || !region || !comuna || !rut || reference === null || !email || !phone) {
    return bad("Datos de contacto incompletos");
  }
  if (!isValidRut(rut)) return bad("El RUT ingresado no es válido.");
  if (!isEmail(email)) return bad("Escribe un correo válido (por ejemplo, nombre@correo.cl).");
  if (!isPhone(phone)) return bad("Escribe un teléfono válido (por ejemplo, +56 9 1234 5678).");
  const reg = getRegion(region);
  if (!reg || !reg.comunas.includes(comuna)) return bad("Elige una región y una comuna de la lista.");

  // Medio de pago: transferencia (si hay datos bancarios) o tarjeta (si hay pasarela configurada).
  const method = c.paymentMethod === "transferencia" ? "transferencia" : "tarjeta";
  if (method === "transferencia" && !hasBankData(settings)) return bad("El pago por transferencia no está habilitado");
  if (method === "tarjeta" && !cardProviderName()) return bad("El pago con tarjeta aún no está habilitado. Elige otro medio de pago.");

  // Las líneas se unen por presentación (una misma presentación repetida no salta el tope ni el stock) y los
  // precios se recalculan en el servidor; nunca se confía en montos del navegador.
  const wanted = new Map<string, number>();
  for (const raw of body.lines) {
    if (!isRecord(raw) || typeof raw.variantId !== "string") return bad("Producto inválido en el carrito");
    const qty = Math.floor(Number(raw.qty));
    if (!(qty >= 1 && qty <= MAX_QTY)) return bad("Producto inválido en el carrito");
    wanted.set(raw.variantId, (wanted.get(raw.variantId) ?? 0) + qty);
  }
  if (wanted.size > MAX_LINES) return bad("El pedido tiene demasiados productos distintos. Divídelo en dos.");

  let subtotal = 0;
  const items: OrderItem[] = [];
  for (const [variantId, qty] of wanted) {
    const found = await findVariant(variantId);
    if (!found) return bad("Producto inválido en el carrito");
    if (qty > MAX_QTY) return bad(`${found.product.name} ${found.variant.label}: el máximo es ${MAX_QTY} unidades por pedido`);
    if (found.variant.stock != null && found.variant.stock < qty) {
      return bad(`${found.product.name} ${found.variant.label}: ${found.variant.stock === 0 ? "agotado" : `solo quedan ${found.variant.stock}`}`, 409);
    }
    subtotal += found.variant.price * qty;
    items.push({ variantId, name: `${found.product.name} ${found.variant.label}`, qty, unitPrice: found.variant.price });
  }

  // Cupón: se vuelve a validar aquí con el subtotal real.
  let discount = 0;
  let coupon: string | null = null;
  const couponInput = text(c.coupon ?? "", 40);
  if (couponInput === null) return bad("Ese cupón no existe o ya no está activo.");
  if (couponInput) {
    const r = await applyCoupon(couponInput, subtotal);
    if (!r.ok) return bad(r.reason);
    discount = r.discount;
    coupon = r.coupon.code;
  }
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= settings.freeShippingFrom ? 0 : settings.shippingCost;

  const lat = Number(c.lat);
  const lng = Number(c.lng);
  const hasPoint = c.lat !== "" && c.lng !== "" && c.lat != null && c.lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

  // Transferencia: el stock se reserva ahora, de forma atómica (se devuelve si se anula el pedido).
  if (method === "transferencia") {
    const short = await reserveStock(items);
    if (short) return bad(`${items.find((i) => i.variantId === short.variantId)?.name ?? "Un producto"}: ya no queda stock suficiente`, 409);
  }
  // El cupón se canjea de forma atómica antes de crear el pedido (el último uso no puede venderse dos veces).
  if (coupon && !(await redeemCoupon(coupon))) {
    if (method === "transferencia") await releaseStock(items);
    return bad("Ese cupón alcanzó su límite de usos.");
  }

  let order;
  try {
    order = await createOrder({
      id: newOrderId(),
      customer: {
        name,
        email,
        phone,
        rut,
        address,
        region,
        comuna,
        ...(reference ? { reference } : {}),
        ...(hasPoint ? { lat, lng } : {}),
      },
      items,
      subtotal,
      discount,
      coupon,
      shipping,
      total: afterDiscount + shipping,
      paymentMethod: method,
    });
  } catch (err) {
    console.error(err);
    if (method === "transferencia") await releaseStock(items);
    if (coupon) await releaseCoupon(coupon);
    return bad("No pudimos crear tu pedido. Intenta nuevamente.", 500);
  }

  if (method === "transferencia") {
    await setStockHeld(order.id, true);
    await sendTransferEmails(order, settings);
    return NextResponse.json({ orderId: order.id, redirectUrl: `/checkout/exito?orden=${order.id}&pago=transferencia` });
  }

  try {
    const { redirectUrl } = await getPaymentProvider().createPayment({
      orderId: order.id,
      amount: order.total,
      description: `Pedido ${order.id} · ${settings.name}`,
      customer: { name: order.customer.name, email: order.customer.email, rut: order.customer.rut },
    });

    // En modo de prueba no hay pasarela que avise: se confirma el pago aquí mismo.
    if (cardProviderName() === "mock") {
      const paid = await markPaid(order.id, "modo-prueba");
      if (paid) {
        await decrementStock(paid.items);
        await sendOrderEmails(paid, settings);
      }
    }

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (err) {
    console.error(err);
    // El pago no llegó a iniciarse: el pedido queda como fallido y el cupón se devuelve.
    await markFailed(order.id, null);
    if (coupon) await releaseCoupon(coupon);
    return bad("No pudimos iniciar el pago. Intenta nuevamente.", 502);
  }
}
