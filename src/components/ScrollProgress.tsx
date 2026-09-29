"use client";

import { useEffect, useState } from "react";

// Línea fina en el borde superior que avanza con el scroll de la página.
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[70] h-[3px] w-full" aria-hidden>
      <div className="h-full origin-left bg-gradient-to-r from-accent to-accent-2 transition-transform duration-150 ease-out" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
