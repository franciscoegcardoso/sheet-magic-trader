// Lista padronizada de unidades de medida
// Referências: ANVISA, INMETRO, Sistema Internacional de Unidades (SI), Tabela TACO

export interface UnitOption {
  value: string;
  label: string;
  abbr: string;
}

export interface UnitGroup {
  group: string;
  units: UnitOption[];
}

export const UNIT_GROUPS: UnitGroup[] = [
  {
    group: "Massa / Peso",
    units: [
      { value: "mg", label: "Miligramas", abbr: "mg" },
      { value: "g", label: "Gramas", abbr: "g" },
      { value: "kg", label: "Quilogramas", abbr: "kg" },
      { value: "t", label: "Toneladas", abbr: "t" },
      { value: "oz", label: "Onças", abbr: "oz" },
      { value: "lb", label: "Libras", abbr: "lb" },
    ],
  },
  {
    group: "Volume / Líquidos",
    units: [
      { value: "ml", label: "Mililitros", abbr: "ml" },
      { value: "cl", label: "Centilitros", abbr: "cl" },
      { value: "dl", label: "Decilitros", abbr: "dl" },
      { value: "L", label: "Litros", abbr: "L" },
      { value: "gal", label: "Galões", abbr: "gal" },
    ],
  },
  {
    group: "Comprimento",
    units: [
      { value: "mm", label: "Milímetros", abbr: "mm" },
      { value: "cm", label: "Centímetros", abbr: "cm" },
      { value: "m", label: "Metros", abbr: "m" },
      { value: "km", label: "Quilômetros", abbr: "km" },
      { value: "pol", label: "Polegadas", abbr: "pol" },
    ],
  },
  {
    group: "Medidas Culinárias",
    units: [
      { value: "pitada", label: "Pitada", abbr: "pitada" },
      { value: "gota", label: "Gota", abbr: "gota" },
      { value: "colher_cafe", label: "Colher de café", abbr: "col. café" },
      { value: "colher_cha", label: "Colher de chá", abbr: "col. chá" },
      { value: "colher_sobremesa", label: "Colher de sobremesa", abbr: "col. sobr." },
      { value: "colher_sopa", label: "Colher de sopa", abbr: "col. sopa" },
      { value: "xicara", label: "Xícara", abbr: "xíc." },
      { value: "copo", label: "Copo (200ml)", abbr: "copo" },
    ],
  },
  {
    group: "Embalagem / Contagem",
    units: [
      { value: "un", label: "Unidade", abbr: "un" },
      { value: "par", label: "Par", abbr: "par" },
      { value: "dz", label: "Dúzia", abbr: "dz" },
      { value: "fatia", label: "Fatia", abbr: "fatia" },
      { value: "folha", label: "Folha", abbr: "folha" },
      { value: "rolo", label: "Rolo", abbr: "rolo" },
      { value: "pct", label: "Pacote", abbr: "pct" },
      { value: "cx", label: "Caixa", abbr: "cx" },
      { value: "saco", label: "Saco", abbr: "saco" },
      { value: "fardo", label: "Fardo", abbr: "fardo" },
      { value: "lata", label: "Lata", abbr: "lata" },
      { value: "garrafa", label: "Garrafa", abbr: "grf" },
      { value: "bandeja", label: "Bandeja", abbr: "bdj" },
      { value: "pote", label: "Pote", abbr: "pote" },
      { value: "balde", label: "Balde", abbr: "balde" },
      { value: "bisnaga", label: "Bisnaga", abbr: "bisnaga" },
    ],
  },
  {
    group: "Porções",
    units: [
      { value: "porcao", label: "Porção", abbr: "porção" },
      { value: "dose", label: "Dose", abbr: "dose" },
      { value: "pedaco", label: "Pedaço", abbr: "pedaço" },
      { value: "tira", label: "Tira", abbr: "tira" },
      { value: "punhado", label: "Punhado", abbr: "punhado" },
      { value: "maco", label: "Maço", abbr: "maço" },
      { value: "rama", label: "Rama / Ramo", abbr: "ramo" },
      { value: "dente", label: "Dente (alho)", abbr: "dente" },
    ],
  },
];

// Flat list for quick lookups
export const ALL_UNITS: UnitOption[] = UNIT_GROUPS.flatMap((g) => g.units);

// Rendimento-specific units (subset)
export const RENDIMENTO_UNITS: UnitOption[] = [
  { value: "un", label: "Unidades", abbr: "un" },
  { value: "porcao", label: "Porções", abbr: "porção" },
  { value: "kg", label: "Quilogramas", abbr: "kg" },
  { value: "g", label: "Gramas", abbr: "g" },
  { value: "L", label: "Litros", abbr: "L" },
  { value: "ml", label: "Mililitros", abbr: "ml" },
  { value: "fatia", label: "Fatias", abbr: "fatia" },
  { value: "pedaco", label: "Pedaços", abbr: "pedaço" },
];

// Helper to get label from value
export function getUnitLabel(value: string): string {
  const unit = ALL_UNITS.find((u) => u.value === value);
  return unit ? `${unit.abbr} (${unit.label})` : value;
}

export function getUnitAbbr(value: string): string {
  const unit = ALL_UNITS.find((u) => u.value === value);
  return unit?.abbr || value;
}
