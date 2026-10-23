import type { Metadata } from "next";
import { Calculadora } from "@/components/Calculadora";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Calculadora de reconstitución",
  description: "Calcula la concentración de un vial liofilizado y el volumen de una alícuota de laboratorio según los mg y el diluyente.",
  alternates: { canonical: "/calculadora" },
};

export default function Page() {
  return (
    <div className="animate-fade mx-auto max-w-3xl px-4 py-14">
      <PageHead icon="calc" label="Herramienta" title="Calculadora de reconstitución">
        <p>
          Indica los miligramos del vial y cuánto diluyente agregas: te decimos la concentración resultante y el volumen que corresponde a la cantidad de muestra que necesitas medir.
        </p>
      </PageHead>
      <Calculadora />
    </div>
  );
}
