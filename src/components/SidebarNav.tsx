import { useState } from "react";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import { canAccessTab, type PlanId } from "@/lib/planFeatures";
import logo from "@/assets/logo.png";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  mobile?: boolean;
  desktop?: boolean;
  group?: string;
}

interface SidebarGroup {
  key: string;
  label: string;
}

interface SidebarNavProps {
  allTabs: TabItem[];
  sidebarGroups: SidebarGroup[];
  activeTab: string;
  onTabChange: (id: any) => void;
  userPlan?: PlanId;
}

export function SidebarNav({ allTabs, sidebarGroups, activeTab, onTabChange, userPlan = "free" }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    sidebarGroups.forEach((g) => {
      if (g.label) all[g.key] = true;
    });
    setCollapsed(all);
  };

  const hasAnyCollapsed = sidebarGroups.some((g) => g.label && collapsed[g.key]);

  const renderTabButton = (tab: TabItem) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    const hasAccess = canAccessTab(userPlan, tab.id);

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground border-r-2 border-primary"
            : hasAccess
            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-muted-foreground/50 hover:bg-muted/50"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{tab.label}</span>
        {!hasAccess && <Lock className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
      </button>
    );
  };

  return (
    <aside className="w-56 lg:w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Logo" className="h-7" />
          <div>
            <h1 className="text-sm font-display font-bold text-foreground leading-tight">
              VerticeA
            </h1>
            <p className="text-[10px] text-muted-foreground">Seu negócio na mão</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-1 flex justify-end">
        <button
          onClick={hasAnyCollapsed ? expandAll : collapseAll}
          className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {hasAnyCollapsed ? "Expandir tudo" : "Recolher tudo"}
        </button>
      </div>

      <nav className="flex-1 py-1 overflow-y-auto">
        {sidebarGroups.map((group) => {
          const groupTabs = allTabs.filter((t) => t.desktop && t.group === group.key);
          if (groupTabs.length === 0) return null;

          const isCollapsed = !!collapsed[group.key];
          const hasActiveChild = groupTabs.some((t) => t.id === activeTab);

          if (!group.label) {
            return <div key={group.key}>{groupTabs.map(renderTabButton)}</div>;
          }

          return (
            <div key={group.key} className="mt-1">
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center justify-between px-4 py-1.5 group cursor-pointer"
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    hasActiveChild ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {group.label}
                </span>
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                )}
              </button>

              {!isCollapsed && (
                <div className="animate-fade-in">{groupTabs.map(renderTabButton)}</div>
              )}

              {isCollapsed && hasActiveChild && (
                <div className="px-4 py-1">
                  <span className="text-[10px] text-primary font-medium">
                    • {groupTabs.find((t) => t.id === activeTab)?.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <img src={logo} alt="Vértice Soluções" className="h-6 opacity-50 mx-auto" />
      </div>
    </aside>
  );
}
