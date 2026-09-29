"use client";

import { useState, type ReactNode } from "react";

export type Tab = { id: string; label: string; content: ReactNode };

// Pestañas de la ficha de producto. El contenido llega ya renderizado desde el servidor.
export function ProductTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === current.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              t.id === current.id ? "bg-accent text-on-accent shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div key={current.id} role="tabpanel" className="animate-fade mt-6">
        {current.content}
      </div>
    </div>
  );
}
