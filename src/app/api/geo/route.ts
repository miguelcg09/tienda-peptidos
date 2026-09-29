import { NextResponse } from "next/server";
import { locateAddress, reversePlace, searchPlaces } from "@/lib/geo";

// Direcciones para el checkout:
//   ?q=...&comuna=&region=            sugerencias mientras se escribe → { places }
//   ?locate=1&q=...&comuna=&region=   ubicación manual (sin sugerencia) → { place }
//   ?lat=&lng=                        dirección a partir de coordenadas (GPS) → { place }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const ctx = { comuna: searchParams.get("comuna")?.trim() || undefined, region: searchParams.get("region")?.trim() || undefined };
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const cacheable = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };
  try {
    if (searchParams.has("lat") && Number.isFinite(lat) && Number.isFinite(lng)) {
      const place = await reversePlace(lat, lng);
      return NextResponse.json({ place }, { headers: { "Cache-Control": "no-store" } });
    }
    if (searchParams.has("locate")) {
      const place = await locateAddress(q, ctx);
      return NextResponse.json({ place }, { headers: cacheable });
    }
    if (q.length < 3) return NextResponse.json({ places: [] });
    const places = await searchPlaces(q, ctx);
    return NextResponse.json({ places }, { headers: cacheable });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ places: [], place: null, error: "Servicio de direcciones no disponible" }, { status: 200 });
  }
}
