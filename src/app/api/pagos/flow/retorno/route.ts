import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/site";

// Vuelta del cliente desde Flow (urlReturn). Flow llega con un POST de formulario, que una página de Next
// no acepta, así que aquí solo se redirige (303, para pasar a GET) a la página de éxito del pedido. El
// estado real lo fija el aviso /api/webhooks/flow; la página de éxito lo consulta hasta que cambie.
function back(req: Request) {
  const orden = new URL(req.url).searchParams.get("orden") ?? "";
  const target = /^[A-Za-z0-9-]{1,40}$/.test(orden) ? `/checkout/exito?orden=${orden}` : "/carrito";
  return NextResponse.redirect(new URL(target, publicUrl()), 303);
}

export const POST = back;
export const GET = back;
