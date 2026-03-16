import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PurchaseForm } from "@/components/PurchaseForm";
import { SaleForm } from "@/components/SaleForm";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeList } from "@/components/RecipeList";
import { ReportsPage } from "@/components/ReportsPage";
import { DespesasPage } from "@/components/DespesasPage";
import { ProductManager } from "@/components/ProductManager";
import { CRMPage } from "@/components/CRMPage";
import { ConcorrenciaPage } from "@/components/ConcorrenciaPage";
import { StockReport } from "@/components/StockReport";
import { InsumoManager } from "@/components/InsumoManager";
import { SalesPlanning } from "@/components/SalesPlanning";
import { DocsPage } from "@/components/DocsPage";
import { PriceSimulator } from "@/components/PriceSimulator";
import { SettingsPage } from "@/components/SettingsPage";
import { MarketingPage } from "@/components/MarketingPage";
import { HelpButton } from "@/components/HelpButton";
import { PedidosPage } from "@/components/PedidosPage";
import { CatalogoPage } from "@/components/CatalogoPage";
import { ContasPage } from "@/components/ContasPage";
import { DashboardPage } from "@/components/DashboardPage";
import { NotificacoesPanel } from "@/components/NotificacoesPanel";
import { MobileHeader } from "@/components/MobileHeader";
import { SidebarNav } from "@/components/SidebarNav";
import { UpgradeGate } from "@/components/UpgradeGate";
import { useToast } from "@/hooks/use-toast";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import { useAuth } from "@/hooks/useAuth";
import { canAccessTab, getRequiredPlan, type PlanId } from "@/lib/planFeatures";
import {
  ShoppingCart,
  Scale,
  Receipt,
  ChefHat,
  BarChart3,
  Package,
  Users,
  Warehouse,
  Boxes,
  Home,
  Target,
  Settings,
  Megaphone,
  BookOpen,
  Calculator,
  Wallet,
  CalendarDays,
  Store,
  CreditCard,
  LayoutDashboard,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const VALID_TABS = [
  "home", "dashboard", "compra", "venda", "produto", "receita", "insumos", "crm", "pedidos", "catalogo",
  "estoque", "planejamento", "simulador", "concorrencia", "marketing", "relatorios", "despesas", "contas", "docs", "configuracoes",
] as const;

type TabType = (typeof VALID_TABS)[number];

interface PurchaseData {
  insumo: string;
  quantidade: string;
  unidade: string;
  dataCompra: string;
  valorCompra: string;
}

interface SaleData {
  cliente: string;
  telefoneCliente: string;
  produto: string;
  tamanho: string;
  embalagem: string;
  valorFrete: string;
  formaPagamento: string;
  valorVenda: string;
}

export default function Index() {
  const { toast } = useToast();
  const { addCompra } = useCompras();
  const { addVenda } = useVendas();
  const { profile } = useAuth();
  const userPlan: PlanId = (profile?.plano as PlanId) || "free";
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const activeTab: TabType =
    tab && VALID_TABS.includes(tab as TabType) ? (tab as TabType) : (tab ? "home" : "home");

  const setActiveTab = (t: TabType) => {
    navigate(t === "home" ? "/" : `/${t}`);
  };

  // webhookUrl/isConnected now managed inside SettingsPage > SheetsConfig

  const handlePurchaseSubmit = async (data: PurchaseData) => {
    try {
      await addCompra({
        insumo_nome: data.insumo,
        quantidade: Number(data.quantidade),
        unidade: data.unidade,
        data_compra: data.dataCompra,
        valor_compra: Number(data.valorCompra),
      });
      await supabase.functions.invoke('add-compra-sheets', { body: data }).catch(() => {});
      toast({ title: "Compra registrada!", description: "Dados salvos com sucesso." });
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      toast({ title: "Erro ao salvar", description: "Não foi possível registrar a compra.", variant: "destructive" });
    }
  };

  const handleSaleSubmit = async (data: SaleData) => {
    try {
      // Resolve product name from ID
      const selectedProduct = data.produto;
      let produtoNome = selectedProduct;
      try {
        const { data: prodData } = await supabase
          .from("produtos")
          .select("nome")
          .eq("id", selectedProduct)
          .single();
        if (prodData) produtoNome = prodData.nome;
      } catch {}

      // Resolve cliente_id if client exists in DB
      let clienteId: string | null = null;
      try {
        const { data: clienteData } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome", data.cliente)
          .maybeSingle();
        if (clienteData) clienteId = clienteData.id;
      } catch {}

      await addVenda({
        cliente: data.cliente,
        telefone_cliente: data.telefoneCliente,
        produto: produtoNome,
        tamanho: data.tamanho,
        embalagem: data.embalagem,
        valor_frete: Number(data.valorFrete) || 0,
        forma_pagamento: data.formaPagamento,
        valor_venda: Number(data.valorVenda),
        data_venda: new Date().toISOString().split("T")[0],
        cliente_id: clienteId,
      });
      await supabase.functions.invoke('add-venda-sheets', { body: data }).catch(() => {});
      toast({ title: "Venda registrada!", description: "Dados salvos com sucesso." });
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast({ title: "Erro ao salvar", description: "Não foi possível registrar a venda.", variant: "destructive" });
    }
  };

  const allTabs = [
    { id: "home" as TabType, label: "Início", icon: Home, mobile: true, desktop: false },
    { id: "dashboard" as TabType, label: "Painel Geral", icon: LayoutDashboard, mobile: false, desktop: true, group: "geral" },
    { id: "compra" as TabType, label: "Compras", icon: ShoppingCart, mobile: true, desktop: true, group: "producao" },
    { id: "venda" as TabType, label: "Vendas", icon: Receipt, mobile: true, desktop: true, group: "vendas" },
    { id: "pedidos" as TabType, label: "Encomendas", icon: CalendarDays, mobile: false, desktop: true, group: "vendas" },
    { id: "crm" as TabType, label: "Clientes", icon: Users, mobile: false, desktop: true, group: "vendas" },
    { id: "catalogo" as TabType, label: "Vitrine Online", icon: Store, mobile: false, desktop: true, group: "vendas" },
    { id: "produto" as TabType, label: "Meus Produtos", icon: Package, mobile: false, desktop: true, group: "producao" },
    { id: "receita" as TabType, label: "Minhas Receitas", icon: ChefHat, mobile: false, desktop: true, group: "producao" },
    { id: "insumos" as TabType, label: "Insumos", icon: Boxes, mobile: false, desktop: true, group: "producao" },
    { id: "estoque" as TabType, label: "Estoque", icon: Warehouse, mobile: false, desktop: true, group: "producao" },
    { id: "relatorios" as TabType, label: "Resultados", icon: BarChart3, mobile: false, desktop: true, group: "financeiro" },
    { id: "despesas" as TabType, label: "Gastos Fixos", icon: Wallet, mobile: false, desktop: true, group: "financeiro" },
    { id: "contas" as TabType, label: "Contas a Pagar/Receber", icon: CreditCard, mobile: false, desktop: true, group: "financeiro" },
    { id: "planejamento" as TabType, label: "Metas de Venda", icon: Target, mobile: false, desktop: true, group: "financeiro" },
    { id: "simulador" as TabType, label: "Calculadora de Preço", icon: Calculator, mobile: false, desktop: true, group: "financeiro" },
    { id: "concorrencia" as TabType, label: "Concorrentes", icon: Scale, mobile: false, desktop: true, group: "financeiro" },
    { id: "marketing" as TabType, label: "Divulgação", icon: Megaphone, mobile: false, desktop: true, group: "marketing" },
    { id: "docs" as TabType, label: "Ajuda", icon: BookOpen, mobile: false, desktop: true, group: "sistema" },
    { id: "configuracoes" as TabType, label: "Configurações", icon: Settings, mobile: true, desktop: true, group: "sistema" },
  ];

  const mobileBottomTabs = allTabs.filter((t) => t.mobile);

  const sidebarGroups = [
    { key: "geral", label: "" },
    { key: "vendas", label: "Vender" },
    { key: "producao", label: "Produzir" },
    { key: "financeiro", label: "Dinheiro" },
    { key: "marketing", label: "Divulgar" },
    { key: "sistema", label: "Ajustes" },
  ];

  const renderContent = () => {
    // Check plan access (home, configuracoes, docs always accessible)
    if (activeTab !== "home" && !canAccessTab(userPlan, activeTab)) {
      return (
        <UpgradeGate
          requiredPlan={getRequiredPlan(activeTab)}
          onUpgrade={() => setActiveTab("configuracoes")}
        />
      );
    }

    if (activeTab === "home") return <MobileHome onNavigate={setActiveTab} userPlan={userPlan} />;
    if (activeTab === "dashboard") return <DashboardPage />;
    if (activeTab === "compra") return <PurchaseForm onSubmit={handlePurchaseSubmit} />;
    if (activeTab === "venda") return <SaleForm onSubmit={handleSaleSubmit} />;
    if (activeTab === "pedidos") return <PedidosPage />;
    if (activeTab === "produto") return <ProductManager />;
    if (activeTab === "catalogo") return <CatalogoPage />;
    if (activeTab === "receita") return <div className="space-y-6"><RecipeForm /><RecipeList /></div>;
    if (activeTab === "crm") return <CRMPage />;
    if (activeTab === "insumos") return <InsumoManager />;
    if (activeTab === "estoque") return <StockReport />;
    if (activeTab === "planejamento") return <SalesPlanning />;
    if (activeTab === "simulador") return <PriceSimulator />;
    if (activeTab === "concorrencia") return <ConcorrenciaPage />;
    if (activeTab === "marketing") return <MarketingPage />;
    if (activeTab === "relatorios") return <ReportsPage />;
    if (activeTab === "despesas") return <DespesasPage />;
    if (activeTab === "contas") return <ContasPage />;
    if (activeTab === "docs") return <DocsPage />;
    if (activeTab === "configuracoes") return <SettingsPage />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {activeTab !== "docs" && <HelpButton onClick={() => setActiveTab("docs")} />}
      {/* ===== DESKTOP / TABLET LAYOUT (md+) ===== */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <SidebarNav
          allTabs={allTabs}
          sidebarGroups={sidebarGroups}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userPlan={userPlan}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ===== MOBILE / TABLET LAYOUT (< md) ===== */}
      <div className="md:hidden flex flex-col min-h-screen pb-16">
        <MobileHeader />
        <main className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
          {renderContent()}
        </main>

        <MobileBottomNav
          tabs={mobileBottomTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

/* ===== Mobile Home Screen ===== */
function MobileHome({ onNavigate, userPlan }: { onNavigate: (tab: TabType) => void; userPlan: PlanId }) {
  const quickActions = [
    { id: "compra" as TabType, label: "Comprei Algo", icon: ShoppingCart, desc: "Registrar o que comprou" },
    { id: "venda" as TabType, label: "Fiz uma Venda", icon: Receipt, desc: "Registrar o que vendeu" },
  ];

  const menuSections = [
    {
      label: "Visão Geral",
      items: [
        { id: "dashboard" as TabType, label: "Painel Geral", icon: LayoutDashboard },
      ],
    },
    {
      label: "Vendas e Clientes",
      items: [
        { id: "pedidos" as TabType, label: "Encomendas", icon: CalendarDays },
        { id: "crm" as TabType, label: "Clientes", icon: Users },
        { id: "catalogo" as TabType, label: "Vitrine Online", icon: Store },
      ],
    },
    {
      label: "O que eu produzo",
      items: [
        { id: "produto" as TabType, label: "Meus Produtos", icon: Package },
        { id: "receita" as TabType, label: "Receitas", icon: ChefHat },
        { id: "insumos" as TabType, label: "Insumos", icon: Boxes },
        { id: "estoque" as TabType, label: "Estoque", icon: Warehouse },
      ],
    },
    {
      label: "Dinheiro",
      items: [
        { id: "relatorios" as TabType, label: "Resultados", icon: BarChart3 },
        { id: "despesas" as TabType, label: "Gastos Fixos", icon: Wallet },
        { id: "contas" as TabType, label: "Contas", icon: CreditCard },
        { id: "planejamento" as TabType, label: "Metas de Venda", icon: Target },
        { id: "simulador" as TabType, label: "Calc. de Preço", icon: Calculator },
        { id: "concorrencia" as TabType, label: "Concorrentes", icon: Scale },
      ],
    },
    {
      label: "Mais",
      items: [
        { id: "marketing" as TabType, label: "Divulgação", icon: Megaphone },
        { id: "configuracoes" as TabType, label: "Configurações", icon: Settings },
        { id: "docs" as TabType, label: "Ajuda", icon: BookOpen },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Olá! 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">O que você quer fazer agora?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-[0.97] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold block">{action.label}</span>
                <span className="text-[11px] opacity-80">{action.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {menuSections.map((section) => (
        <div key={section.label}>
          <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.label}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              const hasAccess = canAccessTab(userPlan, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border active:bg-accent transition-colors ${
                    hasAccess
                      ? "bg-card border-border"
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${hasAccess ? "text-primary" : "text-muted-foreground/40"}`} />
                  <span className={`text-[11px] font-medium ${hasAccess ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {item.label}
                  </span>
                  {!hasAccess && (
                    <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground/40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
