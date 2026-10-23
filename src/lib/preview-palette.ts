// Paletas "blanco con contraste" de la dirección "Suave". En producción solo existe la primera; en las vistas previas de Vercel
// (y en local) un selector deja probar las tres sin salir de la página. La elegida viaja en la cookie "paleta".
export const PALETTES = [
  { id: "tinta", label: "Tinta", swatch: "#0b0b0f" },
  { id: "iris", label: "Iris", swatch: "#4f46e5" },
  { id: "bermellon", label: "Bermellón", swatch: "#d92d0b" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export const DEFAULT_PALETTE: PaletteId = "tinta";
export const PALETTE_COOKIE = "paleta";

export const isPalette = (v: string | undefined): v is PaletteId => PALETTES.some((p) => p.id === v);

// El selector solo se muestra fuera de producción.
export const paletteSwitchEnabled = () => process.env.VERCEL_ENV !== "production";
