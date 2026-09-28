export type Variant = {
  id: string;
  label: string; // p. ej. "5 mg"
  price: number; // CLP, IVA incluido
};

export type Product = {
  slug: string;
  name: string;
  category: Category;
  short: string;
  description: string;
  purity: string;
  form: string;
  cas?: string;
  color: string; // color de acento de la etiqueta del vial
  variants: Variant[];
  featured?: boolean;
};

export const categories = [
  "Reparación tisular",
  "Metabolismo",
  "Hormona de crecimiento",
  "Cognición",
  "Accesorios",
] as const;
export type Category = (typeof categories)[number];

export const categoryMeta: Record<Category, { icon: string; blurb: string; color: string }> = {
  "Reparación tisular": { icon: "🧬", blurb: "Regeneración y matriz celular", color: "#34d399" },
  Metabolismo: { icon: "🔥", blurb: "Señalización GLP-1 y GIP", color: "#f5c451" },
  "Hormona de crecimiento": { icon: "💪", blurb: "Eje GH / IGF-1", color: "#fb923c" },
  Cognición: { icon: "🧠", blurb: "Neuropéptidos", color: "#f472b6" },
  Accesorios: { icon: "🧪", blurb: "Diluyentes y reconstitución", color: "#94a3b8" },
};

// Catálogo de ejemplo: reemplazar nombres, descripciones y precios por los reales.
export const products: Product[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    category: "Reparación tisular",
    short: "Pentadecapéptido derivado de una proteína gástrica.",
    description:
      "Péptido sintético de 15 aminoácidos estudiado en modelos preclínicos de reparación de tejidos. Se entrega liofilizado en vial sellado, con certificado de análisis por lote.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    cas: "137525-51-0",
    color: "#2563eb",
    featured: true,
    variants: [
      { id: "bpc-157-5", label: "5 mg", price: 34990 },
      { id: "bpc-157-10", label: "10 mg", price: 54990 },
    ],
  },
  {
    slug: "tb-500",
    name: "TB-500",
    category: "Reparación tisular",
    short: "Fragmento sintético de timosina beta-4.",
    description:
      "Análogo sintético de la región activa de la timosina beta-4, utilizado en investigación sobre migración celular y angiogénesis.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#0d9488",
    featured: true,
    variants: [
      { id: "tb-500-5", label: "5 mg", price: 39990 },
      { id: "tb-500-10", label: "10 mg", price: 64990 },
    ],
  },
  {
    slug: "bpc-tb-blend",
    name: "BPC-157 + TB-500",
    category: "Reparación tisular",
    short: "Mezcla en un solo vial para protocolos combinados.",
    description:
      "Combinación de BPC-157 y TB-500 en proporción 1:1, pensada para estudios comparativos de reparación tisular.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#7c3aed",
    variants: [{ id: "blend-10", label: "10 mg (5+5)", price: 69990 }],
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    category: "Metabolismo",
    short: "Análogo del receptor GLP-1.",
    description:
      "Análogo del péptido similar al glucagón tipo 1 (GLP-1) usado en investigación metabólica y de señalización de insulina.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    cas: "910463-68-2",
    color: "#16a34a",
    featured: true,
    variants: [
      { id: "sema-5", label: "5 mg", price: 59990 },
      { id: "sema-10", label: "10 mg", price: 99990 },
    ],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    category: "Metabolismo",
    short: "Agonista dual de receptores GIP y GLP-1.",
    description:
      "Péptido agonista dual GIP/GLP-1 estudiado en modelos de metabolismo de glucosa y lípidos.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#059669",
    featured: true,
    variants: [
      { id: "tirz-10", label: "10 mg", price: 89990 },
      { id: "tirz-20", label: "20 mg", price: 159990 },
    ],
  },
  {
    slug: "cjc-1295-ipamorelin",
    name: "CJC-1295 + Ipamorelin",
    category: "Hormona de crecimiento",
    short: "Combinación de análogo de GHRH y secretagogo selectivo.",
    description:
      "Mezcla de CJC-1295 (sin DAC) e Ipamorelin, usada en estudios del eje de la hormona de crecimiento.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#ea580c",
    variants: [{ id: "cjc-ipa-10", label: "10 mg (5+5)", price: 64990 }],
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    category: "Hormona de crecimiento",
    short: "Pentapéptido secretagogo de GH.",
    description:
      "Secretagogo selectivo del receptor de grelina, estudiado por su especificidad sobre la liberación de GH.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#d97706",
    variants: [{ id: "ipa-5", label: "5 mg", price: 32990 }],
  },
  {
    slug: "semax",
    name: "Semax",
    category: "Cognición",
    short: "Heptapéptido análogo de ACTH(4-10).",
    description:
      "Análogo sintético de un fragmento de ACTH, investigado en modelos de neuroprotección.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#db2777",
    variants: [{ id: "semax-10", label: "10 mg", price: 36990 }],
  },
  {
    slug: "agua-bacteriostatica",
    name: "Agua bacteriostática",
    category: "Accesorios",
    short: "Diluyente estéril con 0,9% de alcohol bencílico.",
    description:
      "Agua estéril con alcohol bencílico al 0,9% para la reconstitución de péptidos liofilizados en laboratorio.",
    purity: "USP",
    form: "Líquido, vial 10 ml",
    color: "#64748b",
    variants: [{ id: "bac-10", label: "10 ml", price: 6990 }],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function findVariant(variantId: string) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}
