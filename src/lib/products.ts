export type Variant = {
  id: string;
  label: string; // p. ej. "5 mg"
  price: number; // CLP, IVA incluido
  compareAt: number | null; // precio anterior (para mostrar descuento); null = sin descuento
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
  mechanism?: string; // resumen de una línea del mecanismo (tarjeta de datos)
  storage?: string; // condiciones de almacenamiento
  reconstitution?: string; // pestaña "Reconstitución"
  research?: string; // pestaña "Investigación"
  coaUrl?: string; // enlace al certificado de análisis (PDF o imagen)
  lot?: string; // número de lote actual (el que va impreso en la etiqueta)
  lotDate?: string; // fecha del análisis del lote (AAAA-MM-DD)
  rating?: { avg: number; count: number }; // reseñas publicadas (se calcula al leer el catálogo)
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
    mechanism: "Modelos preclínicos de reparación de tejidos",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Se estudia en modelos de cicatrización de tendón, músculo y mucosa gástrica, con interés en angiogénesis y señalización de factores de crecimiento.",
    name: "BPC-157",
    category: "Reparación tisular",
    short: "Pentadecapéptido derivado de una proteína gástrica.",
    description:
      "Péptido sintético de 15 aminoácidos estudiado en modelos preclínicos de reparación de tejidos. Se entrega liofilizado en vial sellado.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    cas: "137525-51-0",
    color: "#2E5AAC",
    featured: true,
    visible: true,
    sort: 1,
    variants: [
      { id: "bpc-157-5", label: "5 mg", price: 34990, compareAt: null, stock: null },
      { id: "bpc-157-10", label: "10 mg", price: 54990, compareAt: 64990, stock: null },
    ],
  },
  {
    slug: "tb-500",
    mechanism: "Migración celular y angiogénesis",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Investigado por su papel en la regulación de actina, la migración de células endoteliales y la formación de nuevos vasos en modelos animales.",
    name: "TB-500",
    category: "Reparación tisular",
    short: "Fragmento sintético de timosina beta-4.",
    description:
      "Análogo sintético de la región activa de la timosina beta-4, utilizado en investigación sobre migración celular y angiogénesis.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#187A62",
    featured: true,
    visible: true,
    sort: 2,
    variants: [
      { id: "tb-500-5", label: "5 mg", price: 39990, compareAt: null, stock: null },
      { id: "tb-500-10", label: "10 mg", price: 64990, compareAt: null, stock: null },
    ],
  },
  {
    slug: "bpc-tb-blend",
    mechanism: "Protocolos combinados de reparación",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Permite estudiar de forma comparativa el efecto conjunto de ambos péptidos en modelos de daño tisular.",
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
    variants: [{ id: "blend-10", label: "10 mg (5+5)", price: 69990, compareAt: null, stock: null }],
  },
  {
    slug: "semaglutide",
    mechanism: "Agonista del receptor GLP-1",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Se utiliza en investigación sobre secreción de insulina dependiente de glucosa, vaciamiento gástrico y regulación del apetito en modelos animales.",
    name: "Semaglutide",
    category: "Metabolismo",
    short: "Análogo del receptor GLP-1.",
    description:
      "Análogo del péptido similar al glucagón tipo 1 (GLP-1) usado en investigación metabólica y de señalización de insulina.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    cas: "910463-68-2",
    color: "#D9622B",
    featured: true,
    visible: true,
    sort: 4,
    variants: [
      { id: "sema-5", label: "5 mg", price: 59990, compareAt: null, stock: null },
      { id: "sema-10", label: "10 mg", price: 99990, compareAt: 114990, stock: null },
    ],
  },
  {
    slug: "tirzepatide",
    mechanism: "Agonista dual GIP / GLP-1",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Investigado en modelos de metabolismo de glucosa y lípidos, con interés en la acción simultánea sobre dos receptores de incretinas.",
    name: "Tirzepatide",
    category: "Metabolismo",
    short: "Agonista dual de receptores GIP y GLP-1.",
    description: "Péptido agonista dual GIP/GLP-1 estudiado en modelos de metabolismo de glucosa y lípidos.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#B83232",
    featured: true,
    visible: true,
    sort: 5,
    variants: [
      { id: "tirz-10", label: "10 mg", price: 89990, compareAt: null, stock: null },
      { id: "tirz-20", label: "20 mg", price: 159990, compareAt: null, stock: null },
    ],
  },
  {
    slug: "cjc-1295-ipamorelin",
    mechanism: "Eje hormona de crecimiento / IGF-1",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Combinación usada en estudios de pulsatilidad de GH y su relación con IGF-1 en modelos preclínicos.",
    name: "CJC-1295 + Ipamorelin",
    category: "Hormona de crecimiento",
    short: "Combinación de análogo de GHRH y secretagogo selectivo.",
    description:
      "Mezcla de CJC-1295 (sin DAC) e Ipamorelin, usada en estudios del eje de la hormona de crecimiento.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#C28A1E",
    visible: true,
    sort: 6,
    variants: [{ id: "cjc-ipa-10", label: "10 mg (5+5)", price: 64990, compareAt: null, stock: null }],
  },
  {
    slug: "ipamorelin",
    mechanism: "Secretagogo selectivo de GH",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Investigado por su selectividad sobre el receptor de grelina sin efecto relevante sobre cortisol o prolactina en los modelos estudiados.",
    name: "Ipamorelin",
    category: "Hormona de crecimiento",
    short: "Pentapéptido secretagogo de GH.",
    description:
      "Secretagogo selectivo del receptor de grelina, estudiado por su especificidad sobre la liberación de GH.",
    purity: "≥ 99% (HPLC)",
    form: "Polvo liofilizado",
    color: "#A9B2B5",
    visible: true,
    sort: 7,
    variants: [{ id: "ipa-5", label: "5 mg", price: 32990, compareAt: null, stock: null }],
  },
  {
    slug: "semax",
    mechanism: "Neuropéptido análogo de ACTH(4-10)",
    reconstitution: "Deja el vial a temperatura ambiente 10 minutos. Inyecta el agua bacteriostática lentamente por la pared del vial, sin apuntar al polvo. No agites: gira suavemente hasta disolver. Una vez reconstituido, refrigera entre 2 y 8 °C y protege de la luz.",
    research: "Estudiado en modelos de neuroprotección, memoria y expresión de BDNF en roedores.",
    name: "Semax",
    category: "Cognición",
    short: "Heptapéptido análogo de ACTH(4-10).",
    description: "Análogo sintético de un fragmento de ACTH, investigado en modelos de neuroprotección.",
    purity: "≥ 98% (HPLC)",
    form: "Polvo liofilizado",
    color: "#db2777",
    visible: true,
    sort: 8,
    variants: [{ id: "semax-10", label: "10 mg", price: 36990, compareAt: null, stock: null }],
  },
  {
    slug: "agua-bacteriostatica",
    mechanism: "Diluyente para reconstitución",
    storage: "Temperatura ambiente, sin luz",
    research: "Diluyente estándar para preparar soluciones de péptidos liofilizados. El alcohol bencílico al 0,9% inhibe el crecimiento bacteriano y permite extracciones múltiples del mismo vial.",
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
    variants: [{ id: "bac-10", label: "10 ml", price: 6990, compareAt: null, stock: null }],
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
