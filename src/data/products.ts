export type ProductType = {
  id: string;
  name: string;
  icon: string;
  sort: number;
};

export type ProductModel = {
  id: string;
  productTypeId: string;
  name: string;
  active: boolean;
  sort: number;
};

export const PRODUCT_TYPES: ProductType[] = [
  { id: "COLLIER", name: "Collier", icon: "🐕", sort: 10 },
  { id: "LAISSE", name: "Laisse", icon: "🦮", sort: 20 },
  { id: "LONGE", name: "Longe", icon: "🔗", sort: 30 },
  { id: "HARNAIS", name: "Harnais", icon: "🎽", sort: 40 },
  { id: "POIGNEE", name: "Poignée", icon: "✋", sort: 50 },
];

export const PRODUCT_MODELS: ProductModel[] = [
  // Collier
  { id: "COLLIER_BOUCLE_METAL", productTypeId: "COLLIER", name: "Collier — Boucle rapide métal", active: true, sort: 10 },
  { id: "COLLIER_BOUCLE_PLASTIQUE", productTypeId: "COLLIER", name: "Collier — Boucle rapide plastique", active: true, sort: 20 },
  { id: "COLLIER_ADAPTATEUR", productTypeId: "COLLIER", name: "Collier — Adaptateur BioThane", active: true, sort: 30 },
  { id: "COLLIER_MARTINGALE", productTypeId: "COLLIER", name: "Collier — Semi-étrangleur", active: true, sort: 40 },
  { id: "COLLIER_FIXE", productTypeId: "COLLIER", name: "Collier — Fixe", active: true, sort: 50 },

  // Laisse (Reconstitué avec tes options)
  { id: "LAISSE_CLASSIQUE", productTypeId: "LAISSE", name: "Laisse classique", active: true, sort: 10 },
  { id: "LAISSE_MULTI_SANS", productTypeId: "LAISSE", name: "Laisse multipositions sans poignée", active: true, sort: 20 },
  { id: "LAISSE_MULTI_AVEC", productTypeId: "LAISSE", name: "Laisse multipositions avec poignée", active: true, sort: 30 },
  { id: "LAISSE_TRACTEE", productTypeId: "LAISSE", name: "Laisse tractée", active: true, sort: 40 },

  // Longe
  { id: "LONGE_CLASSIQUE", productTypeId: "LONGE", name: "Longe classique", active: true, sort: 10 },
  { id: "LONGE_MOUSQUETON_DOUBLE", productTypeId: "LONGE", name: "Longe — double mousqueton", active: true, sort: 20 },

  // Harnais
  { id: "HARNAIS_CLASSIQUE", productTypeId: "HARNAIS", name: "Harnais classique", active: true, sort: 10 },

  // Poignée
  { id: "POIGNEE_SIMPLE", productTypeId: "POIGNEE", name: "Poignée simple", active: true, sort: 10 },
];