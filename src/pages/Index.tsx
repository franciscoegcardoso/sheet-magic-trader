import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PurchaseForm } from "@/components/PurchaseForm";
import { SaleForm } from "@/components/SaleForm";
// SheetsConfig is now inside SettingsPage
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
import { useToast } from "@/hooks/use-toast";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import {
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const VALID_TABS = [
  "home", "compra", "venda", "produto", "receita", "crm",
  "estoque", "planejamento", "simulador", "marketing", "relatorios", "despesas", "docs", "configuracoes",
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
    { id: "compra" as TabType, label: "Compra", icon: ShoppingCart, mobile: true, desktop: true },
    { id: "venda" as TabType, label: "Venda", icon: Receipt, mobile: true, desktop: true },
    { id: "produto" as TabType, label: "Produtos", icon: Package, mobile: false, desktop: true },
    { id: "receita" as TabType, label: "Receitas", icon: ChefHat, mobile: false, desktop: true },
    { id: "crm" as TabType, label: "CRM", icon: Users, mobile: false, desktop: true },
    { id: "estoque" as TabType, label: "Estoque", icon: Warehouse, mobile: false, desktop: true },
    { id: "planejamento" as TabType, label: "Planejamento", icon: Target, mobile: false, desktop: true },
    { id: "simulador" as TabType, label: "Simulador", icon: Calculator, mobile: false, desktop: true },
    { id: "marketing" as TabType, label: "Marketing", icon: Megaphone, mobile: false, desktop: true },
    { id: "relatorios" as TabType, label: "Relatórios", icon: BarChart3, mobile: false, desktop: true },
    { id: "despesas" as TabType, label: "Despesas", icon: Wallet, mobile: false, desktop: true },
    { id: "despesas" as TabType, label: "Despesas", icon: Wallet, mobile: false, desktop: true },
    { id: "docs" as TabType, label: "Ajuda", icon: BookOpen, mobile: false, desktop: true },
    { id: "configuracoes" as TabType, label: "Configurações", icon: Settings, mobile: true, desktop: true },
  ];

  const mobileBottomTabs = allTabs.filter((t) => t.mobile);
  const desktopSidebarTabs = allTabs.filter((t) => t.desktop);

  const renderContent = () => {
    if (activeTab === "home") return <MobileHome onNavigate={setActiveTab} />;
    if (activeTab === "compra") return <PurchaseForm onSubmit={handlePurchaseSubmit} />;
    if (activeTab === "venda") return <SaleForm onSubmit={handleSaleSubmit} />;
    if (activeTab === "produto") return <ProductManager />;
    if (activeTab === "receita") return <div className="space-y-6"><RecipeForm /><RecipeList /></div>;
    if (activeTab === "crm") return <CRMPage />;
    if (activeTab === "estoque") return <StockReport />;
    if (activeTab === "planejamento") return <SalesPlanning />;
    if (activeTab === "simulador") return <PriceSimulator />;
    if (activeTab === "marketing") return <MarketingPage />;
    if (activeTab === "relatorios") return <ReportsPage />;
    if (activeTab === "despesas") return <DespesasPage />;
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
        <aside className="w-56 lg:w-64 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Logo" className="h-7" />
              <div>
                <h1 className="text-sm font-display font-bold text-foreground leading-tight">
                  Controle Financeiro
                </h1>
                <p className="text-[10px] text-muted-foreground">Gestão completa</p>
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] text-primary border-b border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Google Sheets conectado
            </div>
          )}

          <nav className="flex-1 py-2 overflow-y-auto">
            {desktopSidebarTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <img src={logo} alt="Vértice Soluções" className="h-6 opacity-50 mx-auto" />
          </div>
        </aside>

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

  const menuItems = [
    { id: "produto" as TabType, label: "Produtos", icon: Package },
    { id: "receita" as TabType, label: "Receitas", icon: ChefHat },
    { id: "crm" as TabType, label: "Clientes", icon: Users },
    { id: "estoque" as TabType, label: "Estoque", icon: Warehouse },
    { id: "planejamento" as TabType, label: "Planejamento", icon: Target },
    { id: "simulador" as TabType, label: "Simulador", icon: Calculator },
    { id: "marketing" as TabType, label: "Marketing", icon: Megaphone },
    { id: "relatorios" as TabType, label: "Relatórios", icon: BarChart3 },
    { id: "despesas" as TabType, label: "Despesas", icon: Wallet },
    { id: "config" as TabType, label: "Configurações", icon: FileSpreadsheet },
    { id: "docs" as TabType, label: "Ajuda", icon: BookOpen },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-foreground">Controle Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">O que deseja registrar?</p>
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

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Gestão
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {menuItems.map((item) => {
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
    </div>
  );
}
