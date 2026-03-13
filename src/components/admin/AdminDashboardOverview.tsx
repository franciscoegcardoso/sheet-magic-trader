import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Crown, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: typeof Users;
  trend?: string;
  color: string;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, vendasRes, produtosRes] = await Promise.all([
        supabase.from("profiles").select("plano", { count: "exact" }),
        supabase.from("vendas").select("valor_venda"),
        supabase.from("produtos").select("id", { count: "exact" }),
      ]);

      const totalUsers = profilesRes.count || 0;
      const planos = (profilesRes.data || []).reduce(
        (acc, p) => {
          acc[p.plano] = (acc[p.plano] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const totalVendas = (vendasRes.data || []).reduce(
        (sum, v) => sum + Number(v.valor_venda),
        0
      );

      setStats([
        {
          label: "Total de Usuários",
          value: totalUsers,
          icon: Users,
          color: "bg-primary/10 text-primary",
        },
        {
          label: "Plano Pro",
          value: planos.pro || 0,
          icon: Crown,
          trend: totalUsers > 0 ? `${(((planos.pro || 0) / totalUsers) * 100).toFixed(0)}%` : "0%",
          color: "bg-accent text-accent-foreground",
        },
        {
          label: "Plano Premium",
          value: planos.premium || 0,
          icon: Crown,
          trend: totalUsers > 0 ? `${(((planos.premium || 0) / totalUsers) * 100).toFixed(0)}%` : "0%",
          color: "bg-warning/10 text-warning",
        },
        {
          label: "Faturamento Total",
          value: `R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          icon: TrendingUp,
          color: "bg-success/10 text-success",
        },
      ]);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Resumo geral da plataforma e métricas principais.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.trend && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
