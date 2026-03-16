import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsCadastro } from "./settings/SettingsCadastro";
import { SettingsSeguranca } from "./settings/SettingsSeguranca";
import { SettingsPreferencias } from "./settings/SettingsPreferencias";
import { SettingsAssinatura } from "./settings/SettingsAssinatura";
import { SettingsFinanceiro } from "./settings/SettingsFinanceiro";
import { SettingsLegal } from "./settings/SettingsLegal";
import { SheetsConfig } from "./SheetsConfig";
import { PaymentGatewaysConfig } from "./settings/PaymentGatewaysConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Settings,
  User,
  Shield,
  Palette,
  Crown,
  DollarSign,
  Scale,
  FileSpreadsheet,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

type SettingsTab = "cadastro" | "seguranca" | "preferencias" | "assinatura" | "financeiro" | "legal" | "integracoes";

interface SettingsItem {
  id: SettingsTab;
  label: string;
  icon: typeof User;
  description: string;
  iconBg: string;
  iconColor: string;
}

interface SettingsGroup {
  label: string;
  items: SettingsItem[];
}

const settingsGroups: SettingsGroup[] = [
  {
    label: "Conta",
    items: [
      { id: "cadastro", label: "Cadastro", icon: User, description: "Nome, email e dados pessoais", iconBg: "bg-blue-500", iconColor: "text-white" },
      { id: "seguranca", label: "Segurança", icon: Shield, description: "Senha e autenticação", iconBg: "bg-blue-600", iconColor: "text-white" },
      { id: "preferencias", label: "Preferências", icon: Palette, description: "Tema e personalização", iconBg: "bg-indigo-500", iconColor: "text-white" },
    ],
  },
  {
    label: "Negócio",
    items: [
      { id: "assinatura", label: "Assinatura", icon: Crown, description: "Plano e cobrança", iconBg: "bg-amber-500", iconColor: "text-white" },
      { id: "financeiro", label: "Financeiro", icon: DollarSign, description: "Moeda e configurações", iconBg: "bg-emerald-500", iconColor: "text-white" },
    ],
  },
  {
    label: "Avançado",
    items: [
      { id: "legal", label: "Legal", icon: Scale, description: "Termos e privacidade", iconBg: "bg-gray-500", iconColor: "text-white" },
      { id: "integracoes", label: "Integrações", icon: FileSpreadsheet, description: "Planilhas e pagamentos", iconBg: "bg-gray-600", iconColor: "text-white" },
    ],
  },
];

const allTabs = settingsGroups.flatMap((g) => g.items);

function SettingsContent({ tab }: { tab: SettingsTab }) {
  switch (tab) {
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
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const isMobile = useIsMobile();
  const isCompact = isMobile || window.innerWidth < 1024;

  const goTo = (tab: SettingsTab) => {
    setDirection("forward");
    setActiveTab(tab);
  };

  const goBack = () => {
    setDirection("back");
    setActiveTab(null);
  };

  if (isCompact) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === null ? (
          <motion.div
            key="menu"
            initial={{ x: direction === "back" ? -60 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-1 pb-4">
              <h2 className="text-2xl font-display font-bold text-foreground">Configurações</h2>
            </div>
            <div className="space-y-6">
              {settingsGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                    {group.label}
                  </p>
                  <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => goTo(item.id)}
                          className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-secondary/50 active:bg-secondary transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${item.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-primary text-sm font-medium mb-4 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Configurações
            </button>
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              {allTabs.find((t) => t.id === activeTab)!.label}
            </h3>
            <SettingsContent tab={activeTab} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
      </div>
    );
  }

  // Desktop: original tab layout
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent">
          <Settings className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Configurações</h2>
          <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 min-w-max bg-muted p-1 rounded-xl">
          {allTabs.map((tab) => {
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

      <SettingsContent tab={activeTab ?? "cadastro"} />
    </div>
  );
}
