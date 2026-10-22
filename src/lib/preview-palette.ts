// Paletas claras de la dirección "Suave". En producción solo existe la primera; en las vistas previas de Vercel (y en
// local) un selector deja probar las cuatro sin salir de la página. La elegida viaja en la cookie "paleta".
export const PALETTES = [
  { id: "hielo", label: "Hielo", swatch: "#00789a" },
  { id: "menta", label: "Menta", swatch: "#0a7d6b" },
  { id: "durazno", label: "Durazno", swatch: "#c2410c" },
  { id: "lima", label: "Lima", swatch: "#4d6b00" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export const DEFAULT_PALETTE: PaletteId = "hielo";
export const PALETTE_COOKIE = "paleta";

export const isPalette = (v: string | undefined): v is PaletteId => PALETTES.some((p) => p.id === v);

// El selector solo se muestra fuera de producción.
export const paletteSwitchEnabled = () => process.env.VERCEL_ENV !== "production";
