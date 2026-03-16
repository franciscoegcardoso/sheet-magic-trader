// Plan feature gating configuration
// Maps internal DB enum (free/pro/premium) to display names and feature access

export type PlanId = "free" | "pro" | "premium";

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: string[];
}

// Which tabs each plan can access
const STARTER_TABS = [
  "home", "compra", "venda", "insumos", "configuracoes", "docs",
] as const;

const CRESCIMENTO_TABS = [
  ...STARTER_TABS,
  "dashboard", "produto", "receita", "estoque",
  "despesas", "relatorios", "simulador",
] as const;

const PROFESSIONAL_TABS = [
  ...CRESCIMENTO_TABS,
  "crm", "pedidos", "catalogo", "planejamento",
  "concorrencia", "marketing", "contas",
] as const;

const planTabAccess: Record<PlanId, readonly string[]> = {
  free: STARTER_TABS,
  pro: CRESCIMENTO_TABS,
  premium: PROFESSIONAL_TABS,
};

export function canAccessTab(plan: PlanId, tabId: string): boolean {
  return planTabAccess[plan].includes(tabId);
}

export function getRequiredPlan(tabId: string): PlanId {
  if ((STARTER_TABS as readonly string[]).includes(tabId)) return "free";
  if ((CRESCIMENTO_TABS as readonly string[]).includes(tabId)) return "pro";
  return "premium";
}

export const PLAN_DISPLAY_NAMES: Record<PlanId, string> = {
  free: "Starter",
  pro: "Crescimento",
  premium: "Professional",
};

export const PLAN_COLORS: Record<PlanId, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary/20 text-primary",
  premium: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
};

export const plans: PlanConfig[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "Para quem está começando",
    price: "R$ 0",
    period: "/mês",
    features: [
      "Registro de compras (entradas)",
      "Registro de vendas (saídas)",
      "Configurações básicas",
      "Central de ajuda",
    ],
  },
  {
    id: "pro",
    name: "Crescimento",
    tagline: "Para quem quer crescer com controle",
    price: "R$ 49,90",
    period: "/mês",
    highlight: true,
    features: [
      "Tudo do Starter +",
      "Painel Geral com indicadores",
      "Cadastro de produtos e receitas",
      "Controle de estoque",
      "Gastos fixos e margem de lucro",
      "Relatórios de resultados",
      "Calculadora de preço de venda",
    ],
  },
  {
    id: "premium",
    name: "Professional",
    tagline: "Gestão completa do seu negócio",
    price: "R$ 99,90",
    period: "/mês",
    features: [
      "Tudo do Crescimento +",
      "CRM de clientes",
      "Gestão de encomendas",
      "Vitrine online / catálogo",
      "Metas de venda e planejamento",
      "Análise de concorrentes",
      "Contas a pagar e receber",
      "Ferramentas de divulgação",
    ],
  },
];
