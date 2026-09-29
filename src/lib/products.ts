export type Variant = {
  id: string;
  label: string; // p. ej. "5 mg"
  price: number; // CLP, IVA incluido
  stock: number | null; // null = sin control de stock
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
  imageUrl?: string; // foto real; si falta se dibuja el vial
  variants: Variant[];
  featured?: boolean;
  visible: boolean;
  sort: number;
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

// Catálogo inicial: se carga en la base de datos la primera vez y desde ahí se edita en /admin/productos.
export const seedProducts: Product[] = [
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
    visible: true,
    sort: 1,
    variants: [
      { id: "bpc-157-5", label: "5 mg", price: 34990, stock: null },
      { id: "bpc-157-10", label: "10 mg", price: 54990, stock: null },
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
    visible: true,
    sort: 2,
    variants: [
      { id: "tb-500-5", label: "5 mg", price: 39990, stock: null },
      { id: "tb-500-10", label: "10 mg", price: 64990, stock: null },
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
    visible: true,
    sort: 3,
    variants: [{ id: "blend-10", label: "10 mg (5+5)", price: 69990, stock: null }],
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
    visible: true,
    sort: 4,
    variants: [
      { id: "sema-5", label: "5 mg", price: 59990, stock: null },
      { id: "sema-10", label: "10 mg", price: 99990, stock: null },
    ],
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    category: "Metabolismo",
    short: "Agonista dual de receptores GIP y GLP-1.",
    description: "Péptido agonista dual GIP/GLP-1 estudiado en modelos de metabolismo de glucosa y lípidos.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#059669",
    featured: true,
    visible: true,
    sort: 5,
    variants: [
      { id: "tirz-10", label: "10 mg", price: 89990, stock: null },
      { id: "tirz-20", label: "20 mg", price: 159990, stock: null },
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
    visible: true,
    sort: 6,
    variants: [{ id: "cjc-ipa-10", label: "10 mg (5+5)", price: 64990, stock: null }],
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
    visible: true,
    sort: 7,
    variants: [{ id: "ipa-5", label: "5 mg", price: 32990, stock: null }],
  },
  {
    slug: "semax",
    name: "Semax",
    category: "Cognición",
    short: "Heptapéptido análogo de ACTH(4-10).",
    description: "Análogo sintético de un fragmento de ACTH, investigado en modelos de neuroprotección.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#db2777",
    visible: true,
    sort: 8,
    variants: [{ id: "semax-10", label: "10 mg", price: 36990, stock: null }],
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
    visible: true,
    sort: 9,
    variants: [{ id: "bac-10", label: "10 ml", price: 6990, stock: null }],
  },
];

export function findVariantIn(list: Product[], variantId: string) {
  for (const product of list) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}
