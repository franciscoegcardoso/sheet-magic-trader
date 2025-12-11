import { useState } from "react";
import { PurchaseForm } from "@/components/PurchaseForm";
import { SaleForm } from "@/components/SaleForm";
import { SheetsConfig } from "@/components/SheetsConfig";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Receipt, FileSpreadsheet } from "lucide-react";

type TabType = "compra" | "venda" | "config";

export default function Index() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("compra");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const sendToSheets = async (data: object, type: "compra" | "venda") => {
    if (!isConnected || !webhookUrl) {
      console.log("Dados salvos localmente:", { type, data });
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
          ...data,
        }),
      });

      toast({
        title: "Enviado para planilha",
        description: "Os dados foram sincronizados com o Google Sheets.",
      });
    } catch (error) {
      console.error("Erro ao enviar para Sheets:", error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível enviar os dados para a planilha.",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseSubmit = (data: object) => {
    sendToSheets(data, "compra");
  };

  const handleSaleSubmit = (data: object) => {
    sendToSheets(data, "venda");
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
        <p className="text-center text-xs text-muted-foreground mt-8">
          Os dados são enviados para sua planilha quando a integração está ativa
        </p>
      </div>
    </div>
  );
}
