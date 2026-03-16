import { useState } from "react";
import { SettingsCadastro } from "./settings/SettingsCadastro";
import { SettingsSeguranca } from "./settings/SettingsSeguranca";
import { SettingsPreferencias } from "./settings/SettingsPreferencias";
import { SettingsAssinatura } from "./settings/SettingsAssinatura";
import { SettingsFinanceiro } from "./settings/SettingsFinanceiro";
import { SettingsLegal } from "./settings/SettingsLegal";
import { SheetsConfig } from "./SheetsConfig";
import { PaymentGatewaysConfig } from "./settings/PaymentGatewaysConfig";
import {
  Settings,
  User,
  Shield,
  Palette,
  Crown,
  DollarSign,
  Scale,
  FileSpreadsheet,
} from "lucide-react";

type SettingsTab = "cadastro" | "seguranca" | "preferencias" | "assinatura" | "financeiro" | "legal" | "integracoes";

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "cadastro", label: "Cadastro", icon: User },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "preferencias", label: "Preferências", icon: Palette },
  { id: "assinatura", label: "Assinatura", icon: Crown },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "integracoes", label: "Integrações", icon: FileSpreadsheet },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("cadastro");

  const renderContent = () => {
    switch (activeTab) {
      case "cadastro": return <SettingsCadastro />;
      case "seguranca": return <SettingsSeguranca />;
      case "preferencias": return <SettingsPreferencias />;
      case "assinatura": return <SettingsAssinatura />;
      case "financeiro": return <SettingsFinanceiro />;
      case "legal": return <SettingsLegal />;
      case "integracoes": return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <SheetsConfig />
          </div>
          <PaymentGatewaysConfig />
        </div>
      );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent">
          <Settings className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Configurações</h2>
          <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 min-w-max bg-muted p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
