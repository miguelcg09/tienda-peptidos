// Regla graduada al borde del espécimen: solo adorno de medición, sin significado para quien lee.
export function Ruler() {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute bottom-5 left-3 top-5 hidden h-[calc(100%-2.5rem)] w-4 text-line-2 sm:block">
      <defs>
        <pattern id="regla" width="16" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 .5h16M0 12.5h7M0 24.5h7M0 36.5h7M0 48.5h7" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="16" height="100%" fill="url(#regla)" />
    </svg>
  );
}
