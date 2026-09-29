import "server-only";
import type { Settings } from "./config";
import { formatCLP } from "./products";
import type { Order } from "./orders";

// Correos transaccionales. Con RESEND_API_KEY se envían por Resend;
// sin ella se imprimen en la consola (útil en desarrollo).

type Mail = { to: string; subject: string; html: string; text: string };

async function send(mail: Mail, settings: Settings) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${settings.name} <onboarding@resend.dev>`;
  if (!apiKey) {
    console.log(`[correo no enviado: falta RESEND_API_KEY]\nPara: ${mail.to}\nAsunto: ${mail.subject}\n\n${mail.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
  });
  if (!res.ok) console.error(`Resend respondió ${res.status}: ${await res.text()}`);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function itemsText(order: Order) {
  const lines = order.items.map((i) => `- ${i.name} × ${i.qty}: ${formatCLP(i.unitPrice * i.qty)}`);
  if (order.discount > 0) lines.push(`- Descuento${order.coupon ? ` (${order.coupon})` : ""}: -${formatCLP(order.discount)}`);
  return lines.join("\n");
}

function itemsHtml(order: Order) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${esc(i.name)} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${formatCLP(i.unitPrice * i.qty)}</td></tr>`,
    )
    .join("");
  const discount = order.discount > 0
    ? `<tr><td style="padding:6px 0">Descuento${order.coupon ? ` (${esc(order.coupon)})` : ""}</td><td style="padding:6px 0;text-align:right">-${formatCLP(order.discount)}</td></tr>`
    : "";
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}${discount}
    <tr><td style="padding:6px 0;border-top:1px solid #ddd">Envío</td><td style="padding:6px 0;border-top:1px solid #ddd;text-align:right">${order.shipping ? formatCLP(order.shipping) : "Gratis"}</td></tr>
    <tr><td style="padding:6px 0;font-weight:bold">Total</td><td style="padding:6px 0;text-align:right;font-weight:bold">${formatCLP(order.total)}</td></tr>
  </table>`;
}

function layout(settings: Settings, title: string, body: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#17201b">
    <h1 style="font-size:20px;margin:0 0 16px">${esc(settings.name)}</h1>
    <h2 style="font-size:17px;margin:0 0 12px">${title}</h2>
    ${body}
    <p style="font-size:12px;color:#777;margin-top:24px">${esc(settings.disclaimer)}</p>
  </div>`;
}

const addressOf = (o: Order) => `${o.customer.address}${o.customer.reference ? ` (${o.customer.reference})` : ""}, ${o.customer.comuna}, ${o.customer.region}`;
const trackUrl = (o: Order) => `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "")}/pedido?orden=${o.id}`;

export async function sendOrderEmails(order: Order, settings: Settings) {
  const c = order.customer;
  const address = addressOf(order);

  const customerMail: Mail = {
    to: c.email,
    subject: `Pedido ${order.id} confirmado · ${settings.name}`,
    text: `Hola ${c.name},\n\nRecibimos tu pago. Este es el detalle de tu pedido ${order.id}:\n\n${itemsText(order)}\nEnvío: ${order.shipping ? formatCLP(order.shipping) : "Gratis"}\nTotal: ${formatCLP(order.total)}\n\nDespacho a: ${address}\n\nTe avisaremos por este medio cuando salga con su número de seguimiento. Puedes ver el estado en ${trackUrl(order)}\n\n${settings.name} · ${settings.email}`,
    html: layout(
      settings,
      `Recibimos tu pago, ${esc(c.name)}`,
      `<p>Este es el detalle de tu pedido <strong>${order.id}</strong>:</p>${itemsHtml(order)}
       <p style="margin-top:16px"><strong>Despacho a:</strong><br>${esc(address)}</p>
       <p>Te avisaremos cuando salga con su número de seguimiento. También puedes <a href="${trackUrl(order)}">ver el estado de tu pedido</a> en cualquier momento.</p>`,
    ),
  };

  const storeMail: Mail = {
    to: process.env.ORDERS_NOTIFY_EMAIL ?? settings.email,
    subject: `Nuevo pedido ${order.id} · ${formatCLP(order.total)}`,
    text: `Pedido ${order.id} pagado.\n\nCliente: ${c.name}\nRUT: ${c.rut}\nCorreo: ${c.email}\nTeléfono: ${c.phone}\nDirección: ${address}\n\n${itemsText(order)}\nEnvío: ${order.shipping ? formatCLP(order.shipping) : "Gratis"}\nTotal: ${formatCLP(order.total)}\nReferencia de pago: ${order.paymentRef ?? "-"}`,
    html: layout(
      settings,
      `Nuevo pedido ${order.id}`,
      `<p><strong>${esc(c.name)}</strong> · RUT ${esc(c.rut)}<br>${esc(c.email)} · ${esc(c.phone)}<br>${esc(address)}</p>${itemsHtml(order)}
       <p style="font-size:12px;color:#777">Referencia de pago: ${esc(order.paymentRef ?? "-")}</p>`,
    ),
  };

  await Promise.all([send(customerMail, settings), send(storeMail, settings)]);
}

export async function sendShippedEmail(order: Order, settings: Settings) {
  const c = order.customer;
  const tracking = order.tracking ?? "-";
  await send(
    {
      to: c.email,
      subject: `Tu pedido ${order.id} va en camino · ${settings.name}`,
      text: `Hola ${c.name},\n\nTu pedido ${order.id} fue despachado a ${addressOf(order)}.\n\nNúmero de seguimiento: ${tracking}\n\n${itemsText(order)}\n\nRecomendamos refrigerar los viales al recibirlos.\n\n${settings.name} · ${settings.email}`,
      html: layout(
        settings,
        `Tu pedido va en camino, ${esc(c.name)}`,
        `<p>Tu pedido <strong>${order.id}</strong> fue despachado a ${esc(addressOf(order))}.</p>
         <p style="font-size:18px"><strong>Seguimiento:</strong> ${esc(tracking)}</p>
         <p><a href="${trackUrl(order)}">Ver el estado de tu pedido</a></p>${itemsHtml(order)}
         <p>Recomendamos refrigerar los viales al recibirlos.</p>`,
      ),
    },
    settings,
  );
}

// Datos bancarios para pagar por transferencia (se configuran en /admin/ajustes).
function bankLines(s: Settings) {
  return [
    ["Banco", s.bankName],
    ["Tipo de cuenta", s.bankAccountType],
    ["Número de cuenta", s.bankAccount],
    ["Titular", s.bankHolder],
    ["RUT", s.bankRut],
    ["Correo", s.bankEmail],
  ].filter(([, v]) => v.trim());
}

// Pedido creado con "transferencia": el cliente recibe los datos y la tienda un aviso de pedido pendiente.
export async function sendTransferEmails(order: Order, settings: Settings) {
  const c = order.customer;
  const bank = bankLines(settings);
  const bankText = [...bank, ["Comentario", `Pedido ${order.id}`]].map(([k, v]) => `${k}: ${v}`).join("\n");
  const bankHtml = `<table style="font-size:14px;border-collapse:collapse">${[...bank, ["Comentario", `Pedido ${order.id}`]]
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0;font-weight:600">${esc(v)}</td></tr>`)
    .join("")}</table>`;
  const contact = settings.bankEmail || settings.email;

  const customerMail: Mail = {
    to: c.email,
    subject: `Pedido ${order.id} recibido · cómo pagar por transferencia · ${settings.name}`,
    text: `Hola ${c.name},\n\nRecibimos tu pedido ${order.id}. Para confirmarlo, transfiere ${formatCLP(order.total)} a:\n\n${bankText}\n\nEnvía el comprobante respondiendo a este correo (${contact})${settings.whatsapp ? ` o por WhatsApp al ${settings.whatsapp}` : ""}. Reservamos tu pedido por 48 horas y lo despachamos apenas confirmemos el abono.\n\nDetalle:\n${itemsText(order)}\nEnvío: ${order.shipping ? formatCLP(order.shipping) : "Gratis"}\nTotal: ${formatCLP(order.total)}\n\nDespacho a: ${addressOf(order)}\nEstado del pedido: ${trackUrl(order)}\n\n${settings.name} · ${settings.email}`,
    html: layout(
      settings,
      `Recibimos tu pedido, ${esc(c.name)}`,
      `<p>Para confirmar el pedido <strong>${order.id}</strong>, transfiere <strong>${formatCLP(order.total)}</strong> a:</p>${bankHtml}
       <p>Envía el comprobante respondiendo a este correo (${esc(contact)})${settings.whatsapp ? ` o por WhatsApp al ${esc(settings.whatsapp)}` : ""}. Reservamos tu pedido por 48 horas y lo despachamos apenas confirmemos el abono.</p>
       ${itemsHtml(order)}
       <p style="margin-top:16px"><strong>Despacho a:</strong><br>${esc(addressOf(order))}</p>
       <p><a href="${trackUrl(order)}">Ver el estado de tu pedido</a></p>`,
    ),
  };

  const storeMail: Mail = {
    to: process.env.ORDERS_NOTIFY_EMAIL ?? settings.email,
    subject: `Pedido ${order.id} pendiente de transferencia · ${formatCLP(order.total)}`,
    text: `Pedido ${order.id} creado con pago por transferencia. Cuando veas el abono, confírmalo en el panel (Pedidos > Confirmar pago recibido).\n\nCliente: ${c.name}\nRUT: ${c.rut}\nCorreo: ${c.email}\nTeléfono: ${c.phone}\nDirección: ${addressOf(order)}\n\n${itemsText(order)}\nEnvío: ${order.shipping ? formatCLP(order.shipping) : "Gratis"}\nTotal: ${formatCLP(order.total)}`,
    html: layout(
      settings,
      `Pedido ${order.id} pendiente de transferencia`,
      `<p>Cuando veas el abono de <strong>${formatCLP(order.total)}</strong>, confírmalo en el panel (Pedidos &gt; Confirmar pago recibido).</p>
       <p><strong>${esc(c.name)}</strong> · RUT ${esc(c.rut)}<br>${esc(c.email)} · ${esc(c.phone)}<br>${esc(addressOf(order))}</p>${itemsHtml(order)}`,
    ),
  };

  await Promise.all([send(customerMail, settings), send(storeMail, settings)]);
}

// Aviso a quienes pidieron "avísame cuando vuelva" un producto.
export async function sendBackInStockEmails(product: { name: string; slug: string }, emails: string[], settings: Settings) {
  const url = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "")}/productos/${product.slug}`;
  await Promise.all(
    emails.map((to) =>
      send(
        {
          to,
          subject: `${product.name} volvió a estar disponible · ${settings.name}`,
          text: `Hola,\n\nNos pediste que te avisáramos: ${product.name} ya está disponible otra vez.\n\n${url}\n\n${settings.name} · ${settings.email}`,
          html: layout(settings, `${esc(product.name)} volvió a estar disponible`, `<p>Nos pediste que te avisáramos: <strong>${esc(product.name)}</strong> ya está disponible otra vez.</p><p><a href="${url}">Ver producto</a></p>`),
        },
        settings,
      ),
    ),
  );
}
