// Paletas de color de la tienda. Se elige una en /admin/ajustes y se aplica como variables CSS.
// Cada paleta define los tonos para el modo claro y el oscuro (el visitante ve el de su sistema).

export type Tokens = {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  badge: string;
  tint: string;
  onAccent: string;
  glow: string; // r g b
  grain: string; // opacidad del grano de papel
  btnFrom: string; // degradado de los botones principales
  btnTo: string;
  rCard: string; // radio de las tarjetas
  rBtn: string; // radio de los botones
};

export type Palette = { id: string; name: string; blurb: string; light: Tokens; dark: Tokens };

export const palettes: Palette[] = [
  {
    id: "vitrina",
    name: "Vitrina",
    blurb: "Hielo y tinta, con el color de cada producto como único acento. Moderna y silenciosa.",
    light: {
      bg: "#f4f6f6", surface: "#ffffff", surface2: "#e9eeee", line: "rgb(11 15 16 / 0.12)",
      fg: "#0b0f10", muted: "#5b676b", accent: "#0b0f10", accent2: "#2e5aac", badge: "#2e5aac",
      tint: "#0b0f10", onAccent: "#f4f6f6", glow: "11 15 16", grain: "0",
      btnFrom: "#0b0f10", btnTo: "#0b0f10", rCard: "0.375rem", rBtn: "0.25rem",
    },
    dark: {
      bg: "#0b0f10", surface: "#151b1d", surface2: "#1c2326", line: "rgb(244 246 246 / 0.14)",
      fg: "#f4f6f6", muted: "#9aa7ab", accent: "#f4f6f6", accent2: "#7fa4e8", badge: "#7fa4e8",
      tint: "#f4f6f6", onAccent: "#0b0f10", glow: "244 246 246", grain: "0",
      btnFrom: "#f4f6f6", btnTo: "#f4f6f6", rCard: "0.375rem", rBtn: "0.25rem",
    },
  },
  {
    id: "ambar",
    name: "Carbón y ámbar",
    blurb: "Neutros cálidos con naranja y turquesa. Enérgica y clara.",
    light: {
      bg: "#f5f1ea", surface: "#ffffff", surface2: "#ece6da", line: "rgb(40 30 20 / 0.12)",
      fg: "#1c1915", muted: "#6a635a", accent: "#c94d17", accent2: "#0f7c8a", badge: "#b45309",
      tint: "#1c1915", onAccent: "#ffffff", glow: "201 77 23", grain: "0.05",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
    dark: {
      bg: "#15130f", surface: "#1e1b16", surface2: "#29251e", line: "rgb(255 240 220 / 0.09)",
      fg: "#f5f0e8", muted: "#a69d8f", accent: "#ff8a3d", accent2: "#3fc8d6", badge: "#fbbf24",
      tint: "#fff5e8", onAccent: "#1a1008", glow: "255 138 61", grain: "0.07",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
  },
  {
    id: "violeta",
    name: "Noche violeta",
    blurb: "Índigo profundo con violeta y fucsia. Tecnológica y vibrante.",
    light: {
      bg: "#f4f2fa", surface: "#ffffff", surface2: "#e9e5f5", line: "rgb(30 20 60 / 0.12)",
      fg: "#171331", muted: "#625c7d", accent: "#6a3df0", accent2: "#d02a8f", badge: "#5b21b6",
      tint: "#171331", onAccent: "#ffffff", glow: "106 61 240", grain: "0.04",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
    dark: {
      bg: "#0e0c19", surface: "#16132a", surface2: "#201b3a", line: "rgb(230 220 255 / 0.09)",
      fg: "#f2effb", muted: "#9b95b8", accent: "#a88bfa", accent2: "#f472b6", badge: "#c4b5fd",
      tint: "#f2effb", onAccent: "#120c26", glow: "168 139 250", grain: "0.07",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
  },
  {
    id: "coral",
    name: "Tinta y coral",
    blurb: "Casi negro y blanco con rojo coral y naranja. Sobria y con carácter.",
    light: {
      bg: "#f7f5f1", surface: "#ffffff", surface2: "#ece8e1", line: "rgb(30 20 20 / 0.12)",
      fg: "#141212", muted: "#625e5a", accent: "#d1283a", accent2: "#ef6c2f", badge: "#b91c1c",
      tint: "#141212", onAccent: "#ffffff", glow: "209 40 58", grain: "0.05",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
    dark: {
      bg: "#0f0e10", surface: "#18161a", surface2: "#221f24", line: "rgb(255 230 230 / 0.09)",
      fg: "#f6f3ef", muted: "#a09a94", accent: "#ff4d5e", accent2: "#ff9b52", badge: "#ff8a95",
      tint: "#fff0f0", onAccent: "#1b0a0d", glow: "255 77 94", grain: "0.07",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
  },
  {
    id: "bosque",
    name: "Bosque",
    blurb: "Verdes con esmeralda y dorado. La paleta anterior.",
    light: {
      bg: "#cfdccf", surface: "#ffffff", surface2: "#e3ebe1", line: "rgb(20 50 32 / 0.18)",
      fg: "#132019", muted: "#4c5f54", accent: "#059669", accent2: "#c28a12", badge: "#047857",
      tint: "#132019", onAccent: "#ffffff", glow: "5 150 105", grain: "0.05",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
    dark: {
      bg: "#061a11", surface: "#0c2619", surface2: "#123322", line: "rgb(120 220 170 / 0.16)",
      fg: "#eef5ef", muted: "#9bb3a5", accent: "#34d399", accent2: "#f5c451", badge: "#6ee7b7",
      tint: "#fffaf0", onAccent: "#0c1410", glow: "52 211 153", grain: "0.07",
      btnFrom: "var(--accent)", btnTo: "var(--accent-2)", rCard: "1.5rem", rBtn: "9999px",
    },
  },
];

export function getPalette(id: string | undefined) {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

function vars(t: Tokens) {
  return `--bg:${t.bg};--surface:${t.surface};--surface-2:${t.surface2};--line:${t.line};--fg:${t.fg};--muted:${t.muted};--accent:${t.accent};--accent-2:${t.accent2};--badge:${t.badge};--tint:${t.tint};--on-accent:${t.onAccent};--glow:${t.glow};--grain:${t.grain};--btn-from:${t.btnFrom};--btn-to:${t.btnTo};--r-card:${t.rCard};--r-btn:${t.rBtn};`;
}

// CSS que sobreescribe los tokens de globals.css con la paleta elegida.
export function paletteCss(p: Palette) {
  return `:root{${vars(p.light)}}@media (prefers-color-scheme: dark){:root{${vars(p.dark)}}}`;
}
