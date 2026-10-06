// Íconos de línea del sitio: 24 px, trazo de 1,75, color heredado. Solo los que cumplen una función
// (buscar, abrir el menú, carrito y los cuatro datos de compra); ninguno es decorativo.
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
} as const;

export type IconName = keyof typeof paths;

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
