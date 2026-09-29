import "server-only";

// Búsqueda de direcciones (autocompletado y geolocalización inversa) para el checkout.
// Usa Photon (OpenStreetMap, sin clave ni costo). Con GEO_PROVIDER=mock devuelve
// resultados fijos, útil para probar sin red.
//
// En Chile OpenStreetMap tiene pocos números de casa, así que la búsqueda se hace en
// dos capas: números exactos ("house") y calles ("street"). Si solo aparece la calle,
// se conserva el número que escribió el cliente y el punto queda marcado como
// aproximado (approx) para que lo ajuste en el mapa.

export type Place = {
  label: string; // "Los Leones 45, Providencia, Metropolitana"
  address: string; // calle y número
  comuna: string;
  region: string; // nombre corto, como en el selector del checkout
  lat: number;
  lng: number;
  approx?: boolean; // el número no está en el mapa: el punto es el de la calle
};

const regiones: [string, string][] = [
  ["arica", "Arica y Parinacota"], ["tarapac", "Tarapacá"], ["antofagasta", "Antofagasta"], ["atacama", "Atacama"],
  ["coquimbo", "Coquimbo"], ["valpara", "Valparaíso"], ["metropolitana", "Metropolitana"], ["santiago", "Metropolitana"],
  ["higgins", "O'Higgins"], ["maule", "Maule"], ["nuble", "Ñuble"], ["biob", "Biobío"], ["araucan", "La Araucanía"],
  ["los rios", "Los Ríos"], ["los lagos", "Los Lagos"], ["ays", "Aysén"], ["magallanes", "Magallanes"],
];

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function shortRegion(name: string | undefined) {
  if (!name) return "";
  const n = plain(name);
  return regiones.find(([k]) => n.includes(k))?.[1] ?? name.replace(/^Regi[oó]n (de |del |de la )?/i, "");
}

// "Av. Los Leones 45", "Los Leones #45", "Los Leones N° 45" → calle "Av. Los Leones", número "45"
export function splitNumber(q: string): { street: string; number: string } {
  const m = q.trim().match(/^(.+?)[\s,]*(?:#|n[°º]?\.?\s*|nro\.?\s*|n[uú]mero\s*)?\s*(\d{1,6}(?:\s?[a-z])?)\s*$/i);
  if (!m || m[1].trim().length < 3) return { street: q.trim(), number: "" };
  return { street: m[1].trim().replace(/[,\s]+$/, ""), number: m[2].replace(/\s+/g, "").toUpperCase() };
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string; street?: string; housenumber?: string; district?: string; city?: string; county?: string;
    locality?: string; state?: string; countrycode?: string; osm_key?: string; osm_value?: string;
  };
};

function comunaOf(p: PhotonFeature["properties"]) {
  return (p.district ?? p.city ?? p.locality ?? p.county ?? "").replace(/^Provincia de /i, "");
}

function place(address: string, f: PhotonFeature, approx: boolean): Place {
  const comuna = comunaOf(f.properties);
  const region = shortRegion(f.properties.state);
  return {
    label: [address, comuna, region].filter(Boolean).join(", "),
    address,
    comuna,
    region,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    ...(approx ? { approx: true } : {}),
  };
}

// Dirección con número verificada en el mapa.
function houseFrom(f: PhotonFeature): Place | null {
  const p = f.properties;
  if (p.countrycode && p.countrycode.toUpperCase() !== "CL") return null;
  if (!p.housenumber) return null;
  const street = p.street ?? p.name;
  if (!street) return null;
  return place(`${street} ${p.housenumber}`, f, false);
}

// Calle sin número en el mapa: se le agrega el número escrito por el cliente.
function streetFrom(f: PhotonFeature, number: string): Place | null {
  const p = f.properties;
  if (p.countrycode && p.countrycode.toUpperCase() !== "CL") return null;
  const street = p.osm_key === "highway" ? p.name ?? p.street : p.street;
  if (!street) return null;
  return place(number ? `${street} ${number}` : street, f, Boolean(number));
}

const headers = { "User-Agent": "tienda-peptidos/1.0 (checkout)" };
const base = "https://photon.komoot.io";

async function photon(path: string, params: Record<string, string>, layers: string[], cache: RequestInit): Promise<PhotonFeature[]> {
  if (process.env.GEO_PROVIDER === "mock") return mockPhoton(path, params, layers);
  const qs = new URLSearchParams(params);
  for (const l of layers) qs.append("layer", l);
  const res = await fetch(`${base}${path}?${qs}`, { headers, ...cache });
  if (!res.ok) throw new Error(`Photon respondió ${res.status}`);
  const data = (await res.json()) as { features?: PhotonFeature[] };
  return data.features ?? [];
}

// Solo Chile, con sesgo hacia Santiago; sin "lang" porque el nombre local ya es el español.
const bias = { countrycode: "CL", lat: "-33.45", lon: "-70.66" };

export async function searchPlaces(q: string): Promise<Place[]> {
  const { street, number } = splitNumber(q);
  const cache: RequestInit = { next: { revalidate: 86400 } };
  const [houses, streets] = await Promise.all([
    number ? photon("/api", { q, limit: "6", ...bias }, ["house"], cache) : Promise.resolve([] as PhotonFeature[]),
    photon("/api", { q: street, limit: "6", ...bias }, ["street"], cache),
  ]);

  const exact = houses.map(houseFrom).filter((p): p is Place => Boolean(p));
  // Primero los números que coinciden con el escrito, luego el resto de esa calle.
  const matches = (p: Place) => Number(p.address.toUpperCase().endsWith(` ${number}`));
  exact.sort((a, b) => matches(b) - matches(a));
  const approx = streets.map((f) => streetFrom(f, number)).filter((p): p is Place => Boolean(p));

  const seen = new Set<string>();
  return [...exact, ...approx].filter((p) => !seen.has(plain(p.label)) && Boolean(seen.add(plain(p.label)))).slice(0, 6);
}

export async function reversePlace(lat: number, lng: number): Promise<Place | null> {
  const feats = await photon("/reverse", { lat: String(lat), lon: String(lng), limit: "1" }, [], { cache: "no-store" });
  const f = feats[0];
  if (!f) return null;
  const p = houseFrom(f) ?? streetFrom(f, "");
  return p ? { ...p, lat, lng } : null;
}

// ---- Datos fijos para pruebas sin red (GEO_PROVIDER=mock) ----
const rm = { state: "Región Metropolitana de Santiago", countrycode: "CL" };
const mockHouses: PhotonFeature[] = [
  { geometry: { coordinates: [-70.6045, -33.4218] }, properties: { street: "Los Leones", housenumber: "45", district: "Providencia", city: "Santiago", osm_key: "place", osm_value: "house", ...rm } },
  { geometry: { coordinates: [-70.6055, -33.4262] }, properties: { street: "Los Leones", housenumber: "450", district: "Providencia", city: "Santiago", osm_key: "building", osm_value: "yes", ...rm } },
];
const mockStreets: PhotonFeature[] = [
  { geometry: { coordinates: [-70.605, -33.424] }, properties: { name: "Los Leones", city: "Providencia", osm_key: "highway", osm_value: "residential", ...rm } },
  { geometry: { coordinates: [-71.5502, -33.0153] }, properties: { name: "Avenida Los Leones", city: "Viña del Mar", osm_key: "highway", osm_value: "primary", state: "Región de Valparaíso", countrycode: "CL" } },
  { geometry: { coordinates: [-70.5769, -33.4137] }, properties: { name: "Avenida Apoquindo", city: "Las Condes", osm_key: "highway", osm_value: "primary", ...rm } },
];

function mockPhoton(path: string, params: Record<string, string>, layers: string[]): PhotonFeature[] {
  if (path === "/reverse") return [mockHouses[0]];
  const q = plain(params.q ?? "");
  const pool = layers.includes("house") ? mockHouses : mockStreets;
  return pool.filter((f) => {
    const name = plain(`${f.properties.street ?? f.properties.name ?? ""} ${f.properties.housenumber ?? ""}`);
    return name.includes(q.slice(0, 6)) || q.includes(plain(f.properties.name ?? f.properties.street ?? "").slice(0, 6));
  });
}
