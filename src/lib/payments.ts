import "server-only";

// Capa de pagos intercambiable. Para cambiar de procesador se agrega un
// proveedor nuevo que implemente PaymentProvider y se elige con PAYMENT_PROVIDER.

export type CheckoutRequest = {
  orderId: string;
  amount: number; // CLP
  description: string;
  customer: { name: string; email: string; rut: string };
};

export type CheckoutResult = { redirectUrl: string };

interface PaymentProvider {
  createPayment(req: CheckoutRequest): Promise<CheckoutResult>;
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Proveedor de pruebas: no cobra nada, redirige directo a la página de éxito.
const mockProvider: PaymentProvider = {
  async createPayment(req) {
    return { redirectUrl: `/checkout/exito?orden=${req.orderId}&modo=prueba` };
  },
};

// dLocal Go: el cliente paga en CLP con medios chilenos (Webpay, tarjetas,
// transferencia) y el comercio recibe la liquidación en USD en el extranjero.
// Endpoints, cabecera y campos verificados el 2026-09-29 contra el cliente oficial
// (POST /v1/payments, GET /v1/payments/{id}, Authorization: Bearer apiKey:secretKey).
// Referencia: https://docs.dlocalgo.com/integration-api
const dlocalGoProvider: PaymentProvider = {
  async createPayment(req) {
    const apiKey = process.env.DLOCALGO_API_KEY;
    const secretKey = process.env.DLOCALGO_SECRET_KEY;
    if (!apiKey || !secretKey) throw new Error("Faltan DLOCALGO_API_KEY / DLOCALGO_SECRET_KEY");

    const base =
      process.env.DLOCALGO_SANDBOX === "false"
        ? "https://api.dlocalgo.com"
        : "https://api-sbx.dlocalgo.com";

    const res = await fetch(`${base}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}:${secretKey}`,
      },
      body: JSON.stringify({
        amount: req.amount,
        currency: "CLP",
        country: "CL",
        order_id: req.orderId,
        description: req.description,
        success_url: `${siteUrl()}/checkout/exito?orden=${req.orderId}`,
        back_url: `${siteUrl()}/carrito`,
        notification_url: `${siteUrl()}/api/webhooks/dlocalgo`,
        payer: { name: req.customer.name, email: req.customer.email, document: req.customer.rut.replace(/[^0-9kK]/g, "") },
      }),
    });
    if (!res.ok) throw new Error(`dLocal Go respondió ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { id?: string; redirect_url?: string };
    if (!data.redirect_url) throw new Error("dLocal Go no devolvió redirect_url");
    return { redirectUrl: data.redirect_url };
  },
};

const providers: Record<string, PaymentProvider> = {
  mock: mockProvider,
  dlocalgo: dlocalGoProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  const provider = providers[name];
  if (!provider) throw new Error(`Proveedor de pago desconocido: ${name}`);
  return provider;
}
