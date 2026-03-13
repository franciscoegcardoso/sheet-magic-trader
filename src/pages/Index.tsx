import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PurchaseForm } from "@/components/PurchaseForm";
import { SaleForm } from "@/components/SaleForm";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeList } from "@/components/RecipeList";
import { ReportsPage } from "@/components/ReportsPage";
import { DespesasPage } from "@/components/DespesasPage";
import { ProductManager } from "@/components/ProductManager";
import { CRMPage } from "@/components/CRMPage";
import { StockReport } from "@/components/StockReport";
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
import { SidebarNav } from "@/components/SidebarNav";
import { useToast } from "@/hooks/use-toast";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import {
  ShoppingCart,
  Receipt,
  ChefHat,
  BarChart3,
  Package,
  Users,
  Warehouse,
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const VALID_TABS = [
  "home", "dashboard", "compra", "venda", "produto", "receita", "crm", "pedidos", "catalogo",
  "estoque", "planejamento", "simulador", "marketing", "relatorios", "despesas", "contas", "docs", "configuracoes",
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
      await addVenda({
        cliente: data.cliente,
        telefone_cliente: data.telefoneCliente,
        produto: data.produto,
        tamanho: data.tamanho,
        embalagem: data.embalagem,
        valor_frete: Number(data.valorFrete) || 0,
        forma_pagamento: data.formaPagamento,
        valor_venda: Number(data.valorVenda),
        data_venda: new Date().toISOString().split("T")[0],
        cliente_id: null,
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
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard, mobile: false, desktop: true, group: "geral" },
    { id: "compra" as TabType, label: "Compra", icon: ShoppingCart, mobile: true, desktop: true, group: "producao" },
    { id: "venda" as TabType, label: "Venda", icon: Receipt, mobile: true, desktop: true, group: "vendas" },
    { id: "pedidos" as TabType, label: "Pedidos", icon: CalendarDays, mobile: false, desktop: true, group: "vendas" },
    { id: "crm" as TabType, label: "Clientes", icon: Users, mobile: false, desktop: true, group: "vendas" },
    { id: "catalogo" as TabType, label: "Catálogo", icon: Store, mobile: false, desktop: true, group: "vendas" },
    { id: "produto" as TabType, label: "Produtos", icon: Package, mobile: false, desktop: true, group: "producao" },
    { id: "receita" as TabType, label: "Receitas", icon: ChefHat, mobile: false, desktop: true, group: "producao" },
    { id: "estoque" as TabType, label: "Estoque", icon: Warehouse, mobile: false, desktop: true, group: "producao" },
    { id: "relatorios" as TabType, label: "Relatórios", icon: BarChart3, mobile: false, desktop: true, group: "financeiro" },
    { id: "despesas" as TabType, label: "Despesas", icon: Wallet, mobile: false, desktop: true, group: "financeiro" },
    { id: "contas" as TabType, label: "Contas", icon: CreditCard, mobile: false, desktop: true, group: "financeiro" },
    { id: "planejamento" as TabType, label: "Planejamento", icon: Target, mobile: false, desktop: true, group: "financeiro" },
    { id: "simulador" as TabType, label: "Simulador", icon: Calculator, mobile: false, desktop: true, group: "financeiro" },
    { id: "marketing" as TabType, label: "Marketing", icon: Megaphone, mobile: false, desktop: true, group: "marketing" },
    { id: "docs" as TabType, label: "Ajuda", icon: BookOpen, mobile: false, desktop: true, group: "sistema" },
    { id: "configuracoes" as TabType, label: "Configurações", icon: Settings, mobile: true, desktop: true, group: "sistema" },
  ];

  const mobileBottomTabs = allTabs.filter((t) => t.mobile);

  const sidebarGroups = [
    { key: "geral", label: "" },
    { key: "vendas", label: "Vendas" },
    { key: "producao", label: "Produção" },
    { key: "financeiro", label: "Financeiro" },
    { key: "marketing", label: "Marketing" },
    { key: "sistema", label: "Sistema" },
  ];

  const renderContent = () => {
    if (activeTab === "home") return <MobileHome onNavigate={setActiveTab} />;
    if (activeTab === "dashboard") return <DashboardPage />;
    if (activeTab === "compra") return <PurchaseForm onSubmit={handlePurchaseSubmit} />;
    if (activeTab === "venda") return <SaleForm onSubmit={handleSaleSubmit} />;
    if (activeTab === "pedidos") return <PedidosPage />;
    if (activeTab === "produto") return <ProductManager />;
    if (activeTab === "catalogo") return <CatalogoPage />;
    if (activeTab === "receita") return <div className="space-y-6"><RecipeForm /><RecipeList /></div>;
    if (activeTab === "crm") return <CRMPage />;
    if (activeTab === "estoque") return <StockReport />;
    if (activeTab === "planejamento") return <SalesPlanning />;
    if (activeTab === "simulador") return <PriceSimulator />;
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
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ===== MOBILE LAYOUT (< md) ===== */}
      <div className="md:hidden flex flex-col min-h-screen pb-16">
        <main className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
          {renderContent()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
          <div className="flex items-stretch">
            {mobileBottomTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ===== Mobile Home Screen ===== */
function MobileHome({ onNavigate }: { onNavigate: (tab: TabType) => void }) {
  const quickActions = [
    { id: "compra" as TabType, label: "Nova Compra", icon: ShoppingCart, desc: "Registrar entrada" },
    { id: "venda" as TabType, label: "Nova Venda", icon: Receipt, desc: "Registrar saída" },
  ];

  const menuSections = [
    {
      label: "Visão Geral",
      items: [
        { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Vendas",
      items: [
        { id: "pedidos" as TabType, label: "Pedidos", icon: CalendarDays },
        { id: "crm" as TabType, label: "Clientes", icon: Users },
        { id: "catalogo" as TabType, label: "Catálogo", icon: Store },
      ],
    },
    {
      label: "Produção",
      items: [
        { id: "produto" as TabType, label: "Produtos", icon: Package },
        { id: "receita" as TabType, label: "Receitas", icon: ChefHat },
        { id: "estoque" as TabType, label: "Estoque", icon: Warehouse },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { id: "relatorios" as TabType, label: "Relatórios", icon: BarChart3 },
        { id: "despesas" as TabType, label: "Despesas", icon: Wallet },
        { id: "contas" as TabType, label: "Contas", icon: CreditCard },
        { id: "planejamento" as TabType, label: "Planejamento", icon: Target },
        { id: "simulador" as TabType, label: "Simulador", icon: Calculator },
      ],
    },
    {
      label: "Marketing & Sistema",
      items: [
        { id: "marketing" as TabType, label: "Marketing", icon: Megaphone },
        { id: "configuracoes" as TabType, label: "Configurações", icon: Settings },
        { id: "docs" as TabType, label: "Ajuda", icon: BookOpen },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Controle Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">O que deseja registrar?</p>
      </div>

      {/* Notifications */}
      <NotificacoesPanel />

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
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border active:bg-accent transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
