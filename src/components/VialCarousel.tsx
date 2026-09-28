"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/lib/products";
import { Vial } from "./Vial";

// Carrusel 3D que gira solo y se puede arrastrar. Solo transforms CSS: sin librerías.
export function VialCarousel({ items }: { items: Product[] }) {
  const ring = useRef<HTMLDivElement>(null);
  const state = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0, moved: 0 });
  const step = 360 / items.length;
  const radius = Math.round(115 / Math.tan(Math.PI / items.length));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const tick = () => {
      const s = state.current;
      if (!s.dragging) {
        s.velocity *= 0.95;
        s.angle += s.velocity + (reduce ? 0 : 0.12);
      }
      if (ring.current) ring.current.style.transform = `translateZ(-${radius}px) rotateY(${s.angle}deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [radius]);

  function down(e: React.PointerEvent) {
    state.current.dragging = true;
    state.current.lastX = e.clientX;
    state.current.moved = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.moved += Math.abs(dx);
    s.angle += dx * 0.35;
    s.velocity = dx * 0.35;
  }
  function up() {
    state.current.dragging = false;
  }

  return (
    <div
      className="relative mx-auto h-[380px] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      style={{ perspective: "1100px" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
        {items.map((p, i) => (
          <Link
            key={p.slug}
            href={`/productos/${p.slug}`}
            draggable={false}
            onClick={(e) => state.current.moved > 6 && e.preventDefault()}
            className="glass absolute -left-[90px] -top-[150px] flex h-[300px] w-[180px] flex-col items-center justify-between rounded-3xl p-4"
            style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
          >
            <Vial color={p.color} label={p.name} className="h-52" />
            <span className="text-sm font-semibold">{p.name}</span>
          </Link>
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-0 left-0 right-0 text-center text-xs uppercase tracking-[0.25em] text-muted">
        Arrastra para girar
      </p>
    </div>
  );
}
