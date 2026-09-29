import { NextResponse } from "next/server";
import { reversePlace, searchPlaces } from "@/lib/geo";

// Autocompletado de direcciones (?q=) y dirección a partir de coordenadas (?lat=&lng=).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  try {
    if (Number.isFinite(lat) && Number.isFinite(lng) && searchParams.has("lat")) {
      const place = await reversePlace(lat, lng);
      return NextResponse.json({ place }, { headers: { "Cache-Control": "no-store" } });
    }
    if (q.length < 3) return NextResponse.json({ places: [] });
    const places = await searchPlaces(q);
    return NextResponse.json({ places }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ places: [], place: null, error: "Servicio de direcciones no disponible" }, { status: 200 });
  }
}
