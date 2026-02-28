import { useMemo } from "react";
import { useReceitas } from "@/hooks/useReceitas";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ChefHat,
  Loader2,
  Package,
} from "lucide-react";

export function AdminDashboard() {
  const { receitas, isLoading } = useReceitas();

  const stats = useMemo(() => {
    if (!receitas.length) return null;

    const totalReceitas = receitas.length;
    const custoMedio =
      receitas.reduce((s, r) => s + (r.custo_total || 0), 0) / totalReceitas;
    const custoTotal = receitas.reduce((s, r) => s + (r.custo_total || 0), 0);
    const totalIngredientes = receitas.reduce(
      (s, r) => s + (r.ingredientes?.length || 0),
      0
    );

    return { totalReceitas, custoMedio, custoTotal, totalIngredientes };
  }, [receitas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-accent">
          <BarChart3 className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Painel Administrativo
          </h2>
          <p className="text-sm text-muted-foreground">
            Visão geral de custos e receitas
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={ChefHat}
          label="Receitas"
          value={String(stats?.totalReceitas || 0)}
        />
        <StatCard
          icon={Package}
          label="Ingredientes"
          value={String(stats?.totalIngredientes || 0)}
        />
        <StatCard
          icon={DollarSign}
          label="Custo Total"
          value={`R$ ${(stats?.custoTotal || 0).toFixed(2)}`}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Custo Médio"
          value={`R$ ${(stats?.custoMedio || 0).toFixed(2)}`}
        />
      </div>

      {/* Tabela de custo por receita */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm text-foreground">
            Custo por Receita
          </h3>
        </div>
        {receitas.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Cadastre receitas para ver a análise de custos
          </p>
        ) : (
          <div className="divide-y divide-border">
            {receitas.map((r) => {
              const custoPorUnidade =
                r.rendimento && r.rendimento > 0
                  ? (r.custo_total || 0) / r.rendimento
                  : r.custo_total || 0;

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {r.nome}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({r.ingredientes?.length || 0} itens)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">
                      R$ {(r.custo_total || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-primary">
                      R$ {custoPorUnidade.toFixed(2)} / {r.unidade_rendimento}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-display font-bold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
