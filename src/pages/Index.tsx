import { useState } from "react";
import { PurchaseForm } from "@/components/PurchaseForm";
import { SaleForm } from "@/components/SaleForm";
import { SheetsConfig } from "@/components/SheetsConfig";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Receipt, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type TabType = "compra" | "venda" | "config";

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
  const [activeTab, setActiveTab] = useState<TabType>("compra");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handlePurchaseSubmit = async (data: PurchaseData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('add-compra-sheets', {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Compra registrada!",
        description: "Dados salvos na planilha com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível registrar a compra na planilha.",
        variant: "destructive",
      });
    }
  };

  const handleSaleSubmit = async (data: SaleData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('add-venda-sheets', {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Venda registrada!",
        description: "Dados salvos na planilha com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível registrar a venda na planilha.",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: "compra" as TabType, label: "Compra", icon: ShoppingCart },
    { id: "venda" as TabType, label: "Venda", icon: Receipt },
    { id: "config" as TabType, label: "Configuração", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Controle Financeiro
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas compras e vendas com facilidade
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Conectado ao Google Sheets
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-secondary rounded-xl mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "tab-active"
                    : "tab-inactive"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === "compra" && (
            <PurchaseForm onSubmit={handlePurchaseSubmit} />
          )}
          {activeTab === "venda" && <SaleForm onSubmit={handleSaleSubmit} />}
          {activeTab === "config" && (
            <SheetsConfig
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              isConnected={isConnected}
              setIsConnected={setIsConnected}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <p className="text-xs text-muted-foreground">
            Os dados são enviados para sua planilha quando a integração está ativa
          </p>
          <img 
            src={logo} 
            alt="Vértice Soluções" 
            className="h-8 opacity-60"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}
