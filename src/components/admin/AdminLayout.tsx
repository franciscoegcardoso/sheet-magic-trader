import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Users,
  Crown,
  FileText,
  LogOut,
  KeyRound,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Settings,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export type AdminSection = "dashboard" | "usuarios" | "acessos" | "planos" | "termos" | "auditoria";

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: { id: AdminSection; label: string; icon: typeof Users; group: string }[] = [
  { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard, group: "Principal" },
  { id: "usuarios", label: "Usuários", icon: Users, group: "Gestão" },
  { id: "acessos", label: "Controle de Acesso", icon: KeyRound, group: "Gestão" },
  { id: "planos", label: "Planos & Assinaturas", icon: Crown, group: "Gestão" },
  { id: "termos", label: "Termos & Política", icon: FileText, group: "Sistema" },
];

export default function AdminLayout({ activeSection, onSectionChange, onLogout, children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const groups = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-display font-bold text-foreground leading-tight">Admin Console</p>
              <p className="text-[10px] text-muted-foreground">Painel de gestão</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {group}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3 space-y-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Recolher menu</span>}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 opacity-60" />
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
