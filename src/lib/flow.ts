import "server-only";
import { createHmac } from "node:crypto";

// Cliente mínimo de la API REST v3 de Flow (flow.cl).
// Firma: HMAC-SHA256 en hex, con la secretKey, sobre la concatenación clave+valor de todos los
// parámetros ordenados alfabéticamente (sin separadores y sin incluir "s"). Se envía como parámetro "s".
// Verificado el 2026-11-27 contra los clientes Node publicados (flow-sdk-v2, derivado del OpenAPI de Flow).

export type FlowPaymentStatus = {
  flowOrder: number;
  commerceOrder: string;
  status: number; // 1 pendiente de pago, 2 pagada, 3 rechazada, 4 anulada
  currency: string;
  amount: number | string;
};

export const FLOW_STATUS = { PENDING: 1, PAID: 2, REJECTED: 3, CANCELED: 4 } as const;

function credentials() {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("Faltan FLOW_API_KEY / FLOW_SECRET_KEY");
  return { apiKey, secretKey };
}

export function flowBaseUrl() {
  if (process.env.FLOW_API_URL) return process.env.FLOW_API_URL; // solo para pruebas locales
  return process.env.FLOW_SANDBOX === "false" ? "https://www.flow.cl/api" : "https://sandbox.flow.cl/api";
}

export function flowSign(params: Record<string, string>, secretKey: string) {
  const toSign = Object.keys(params)
    .filter((k) => k !== "s")
    .sort()
    .map((k) => k + params[k])
    .join("");
  return createHmac("sha256", secretKey).update(toSign).digest("hex");
}

function signed(params: Record<string, string | number>) {
  const { apiKey, secretKey } = credentials();
  const all: Record<string, string> = { apiKey };
  for (const [k, v] of Object.entries(params)) all[k] = String(v);
  return new URLSearchParams({ ...all, s: flowSign(all, secretKey) });
}

async function readJson<T>(res: Response, what: string): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(`Flow respondió ${res.status} en ${what}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

export async function flowCreatePayment(params: {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}) {
  const body = signed({ ...params, currency: "CLP" });
  const res = await fetch(`${flowBaseUrl()}/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  return readJson<{ url?: string; token?: string; flowOrder?: number }>(res, "payment/create");
}

export async function flowGetStatus(token: string) {
  const res = await fetch(`${flowBaseUrl()}/payment/getStatus?${signed({ token })}`, { cache: "no-store" });
  return readJson<FlowPaymentStatus>(res, "payment/getStatus");
}

// Flow avisa (urlConfirmation) y devuelve al cliente (urlReturn) con un POST de formulario que solo trae "token".
export async function readFlowToken(req: Request) {
  const fromQuery = new URL(req.url).searchParams.get("token");
  if (fromQuery) return fromQuery;
  try {
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("form")) return String((await req.formData()).get("token") ?? "");
    const text = await req.text();
    if (type.includes("json")) return String((JSON.parse(text) as { token?: unknown }).token ?? "");
    return new URLSearchParams(text).get("token") ?? "";
  } catch {
    return "";
  }
}
