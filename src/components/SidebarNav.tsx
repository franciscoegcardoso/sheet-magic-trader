import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
}

export function SidebarNav({ allTabs, sidebarGroups, activeTab, onTabChange }: SidebarNavProps) {
  // Initialize all labeled groups as expanded
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

  return (
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

      {/* Expand/Collapse all toggle */}
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

          // Groups without label (like "geral") are always visible
          if (!group.label) {
            return (
              <div key={group.key}>
                {groupTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-colors ${
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
              </div>
            );
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
                <div className="animate-fade-in">
                  {groupTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-colors ${
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
                </div>
              )}

              {/* Show active item badge when collapsed */}
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
