// Íconos de línea del sitio: 24 px, trazo de 1,75, color heredado. Siempre van acompañados de texto (son aria-hidden),
// salvo los botones, que llevan su nombre accesible aparte.
const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  cart: (
    <>
      <path d="M5.5 8h13l-1 11.5h-11L5.5 8Z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </>
  ),
  // Seguimiento: ruta con punto de llegada
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16" />
      <path d="m14.5 2.5 2 1.5-2 1.5" />
    </>
  ),
  // Pago en pesos
  peso: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.6 9.3c-.5-.9-1.5-1.4-2.7-1.4-1.5 0-2.6.8-2.6 2s1 1.7 2.7 2.1c1.7.4 2.7.9 2.7 2.1s-1.1 2-2.7 2c-1.2 0-2.2-.5-2.7-1.4M12 6.3v1.6m0 8.2v1.6" />
    </>
  ),
  // Despacho el mismo día
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  // Pedido dañado: caja con marca de revisión
  box: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
      <path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  // Camión de despacho
  truck: (
    <>
      <path d="M3 6.5h10.5v9H3zM13.5 10h4l3 3v2.5h-7" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </>
  ),
  // Tarjeta de pago
  card: (
    <>
      <rect x="3" y="6" width="18" height="12.5" rx="3" />
      <path d="M3 10.5h18M7 15h3" />
    </>
  ),
  // Matraz: el compuesto, el formato
  flask: (
    <>
      <path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" />
    </>
  ),
  doc: (
    <>
      <path d="M6.5 3.5h7.5l3.5 3.5v13.5h-11z" />
      <path d="M14 3.5V7h3.5M9 12h6M9 15.5h6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </>
  ),
  chat: <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="3" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3.5 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" />
      <path d="m16 11.5 2 2 3.5-3.5" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0l-8.5-8.1Z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  ruler: (
    <>
      <path d="M3.5 9h17v6h-17z" />
      <path d="M7 9v3M10.5 9v2M14 9v3M17.5 9v2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  // Líneas de investigación
  heal: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />,
  trend: (
    <>
      <path d="M4 17.5 9.5 12l3.5 3.5L20 8.5" />
      <path d="M15 8.5h5v5" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 17.5h6M10 20.5h4" />
      <path d="M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3.5Z" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5Z" />
      <path d="M9.5 14.5a2.7 2.7 0 0 0 2.5 2" />
    </>
  ),
  spark: <path d="M12 3.5c.7 4.6 1.9 5.8 6.5 6.5-4.6.7-5.8 1.9-6.5 6.5-.7-4.6-1.9-5.8-6.5-6.5C10.1 9.3 11.3 8.1 12 3.5Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7M12 16.5v.01" />
    </>
  ),
  quote: <path d="M9 7H6.5A2.5 2.5 0 0 0 4 9.5V13h5V9.5M9 13c0 2-1 3.5-3 4.5M20 7h-2.5A2.5 2.5 0 0 0 15 9.5V13h5V9.5M20 13c0 2-1 3.5-3 4.5" />,
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-.9 2-1.8 0-1.4-1.4-1.6-1.4-2.9 0-1 .8-1.8 1.9-1.8H17a3.5 3.5 0 0 0 3.5-3.5C20.5 6.7 16.8 3.5 12 3.5Z" />
      <circle cx="7.5" cy="12" r="1" />
      <circle cx="10" cy="7.8" r="1" />
      <circle cx="14.5" cy="7.8" r="1" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

// Ícono para cada línea de investigación (las que no se reconocen usan el matraz).
export function categoryIcon(category: string): IconName {
  const c = category.toLowerCase();
  if (c === "todos") return "grid";
  if (c.includes("repar")) return "heal";
  if (c.includes("metab")) return "bolt";
  if (c.includes("hormona")) return "trend";
  if (c.includes("cogni")) return "bulb";
  if (c.includes("acces")) return "drop";
  return "flask";
}

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
