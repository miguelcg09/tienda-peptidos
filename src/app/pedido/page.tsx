"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatCLP } from "@/lib/products";

type Tracking = {
  id: string;
  status: "pendiente" | "pagado" | "despachado" | "fallido";
  items: { variantId: string; name: string; qty: number; unitPrice: number }[];
  shipping: number;
  total: number;
  createdAt: string;
  verified: boolean;
  paidAt?: string | null;
  shippedAt?: string | null;
  tracking?: string | null;
  name?: string;
  destination?: string;
};

const fecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : null;

function Seguimiento() {
  const params = useSearchParams();
  const [orden, setOrden] = useState(params.get("orden") ?? "");
  const [email, setEmail] = useState("");
  const [data, setData] = useState<Tracking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!orden.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(orden.trim())}?email=${encodeURIComponent(email.trim())}`, { cache: "no-store" });
      if (!r.ok) {
        setData(null);
        setError("No encontramos un pedido con ese número. Revisa el correo de confirmación.");
      } else {
        setData(await r.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.get("orden")) void buscar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = data
    ? [
        { label: "Pedido recibido", done: true, when: fecha(data.createdAt) },
        { label: "Pago confirmado", done: data.status === "pagado" || data.status === "despachado", when: fecha(data.paidAt) },
        { label: "Despachado", done: data.status === "despachado", when: fecha(data.shippedAt) },
      ]
    : [];

  return (
    <div className="animate-fade mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Seguimiento</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Seguir mi pedido</h1>
      <p className="mt-3 text-muted">
        Escribe el número de pedido que recibiste por correo. Si agregas el correo con que compraste, verás también el número de seguimiento del envío.
      </p>

      <form onSubmit={buscar} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm">Número de pedido
          <input value={orden} onChange={(e) => setOrden(e.target.value)} placeholder="HX-…" required className="field font-mono uppercase" />
        </label>
        <label className="text-sm">Correo (opcional)
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tu@correo.cl" className="field" />
        </label>
        <button disabled={loading} className="btn-primary self-end">{loading ? "Buscando…" : "Buscar"}</button>
      </form>
      {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">{error}</p>}

      {data && (
        <div className="mt-10 rounded-3xl border bg-surface p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">Pedido {data.id}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.status === "fallido" ? "bg-red-500/15 text-red-600 dark:text-red-300" : data.status === "pendiente" ? "bg-amber-400/15 text-amber-700 dark:text-amber-200" : "bg-accent/15 text-accent"
            }`}>
              {{ pendiente: "Pago pendiente", pagado: "Pagado, preparando envío", despachado: "Despachado", fallido: "Pago no completado" }[data.status]}
            </span>
          </div>
          {data.verified && data.name && <p className="mt-1 text-sm text-muted">Hola {data.name}. Destino: {data.destination}.</p>}

          {data.status !== "fallido" && (
            <ol className="mt-6 grid gap-3 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.label} className={`rounded-2xl border p-4 ${s.done ? "border-accent/40 bg-accent/5" : "opacity-60"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${s.done ? "bg-accent text-on-accent" : "border"}`}>{s.done ? "✓" : i + 1}</span>
                  <p className="mt-3 font-semibold">{s.label}</p>
                  {s.when && data.verified && <p className="text-xs text-muted">{s.when}</p>}
                </li>
              ))}
            </ol>
          )}

          {data.status === "despachado" && (
            <div className="mt-6 rounded-2xl border bg-surface-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Número de seguimiento</p>
              {data.verified ? (
                <p className="mt-1 font-mono text-lg">{data.tracking ?? "—"}</p>
              ) : (
                <p className="mt-1 text-sm text-muted">Agrega el correo con que compraste para ver el número de seguimiento.</p>
              )}
            </div>
          )}

          <ul className="mt-6 space-y-2 border-t pt-4 text-sm">
            {data.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-4"><span>{i.name} × {i.qty}</span><span>{formatCLP(i.unitPrice * i.qty)}</span></li>
            ))}
            <li className="flex justify-between text-muted"><span>Envío</span><span>{data.shipping ? formatCLP(data.shipping) : "Gratis"}</span></li>
            <li className="flex justify-between font-semibold"><span>Total</span><span>{formatCLP(data.total)}</span></li>
          </ul>
        </div>
      )}

      <p className="mt-10 text-sm text-muted">
        ¿Dudas con tu pedido? <Link href="/#faq" className="text-accent hover:underline">Revisa las preguntas frecuentes</Link> o escríbenos.
      </p>
    </div>
  );
}

export default function Page() {
  return <Suspense><Seguimiento /></Suspense>;
}
