import { NextResponse } from "next/server";

// Notificación de dLocal Go cuando cambia el estado de un pago.
// TODO: consultar el pago por su id en la API para confirmar el estado
// antes de marcar la orden como pagada (no confiar solo en el cuerpo recibido).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  console.log("Webhook dLocal Go", body);
  return NextResponse.json({ ok: true });
}
