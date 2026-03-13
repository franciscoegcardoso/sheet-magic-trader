import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown,
  Users,
  Check,
  Loader2,
  BarChart3,
} from "lucide-react";

interface PlanInfo {
  id: string;
  name: string;
  price: string;
  features: string[];
  color: string;
  iconColor: string;
  borderColor: string;
  userCount: number;
}

export default function AdminPlans() {
  const [planCounts, setPlanCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("plano");
      const counts = (data || []).reduce(
        (acc, p) => {
          acc[p.plano] = (acc[p.plano] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      setPlanCounts(counts);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalUsers = Object.values(planCounts).reduce((a, b) => a + b, 0);

  const plans: PlanInfo[] = [
    {
      id: "free",
      name: "Free",
      price: "R$ 0",
      features: [
        "50 produtos cadastrados",
        "1 usuário",
        "Relatórios básicos",
        "Suporte via email",
      ],
      color: "bg-muted/50",
      iconColor: "text-muted-foreground",
      borderColor: "border-border",
      userCount: planCounts.free || 0,
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 49,90/mês",
      features: [
        "Produtos ilimitados",
        "Simulador de preços",
        "CRM de clientes",
        "Integração Google Sheets",
        "Suporte prioritário",
      ],
      color: "bg-primary/5",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
      userCount: planCounts.pro || 0,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 99,90/mês",
      features: [
        "Tudo do Pro",
        "Multi-usuários",
        "Relatórios avançados",
        "Acesso à API",
        "Suporte dedicado",
        "Backup automático",
      ],
      color: "bg-warning/5",
      iconColor: "text-warning",
      borderColor: "border-warning/30",
      userCount: planCounts.premium || 0,
    },
  ];

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
        Visualize os planos disponíveis e a distribuição de assinantes. A alteração de plano é feita na gestão de usuários.
      </p>

      {/* Distribution bar */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Distribuição de Planos</h3>
        </div>
        <div className="flex rounded-full overflow-hidden h-3 bg-muted">
          {plans.map((plan) => {
            const pct = totalUsers > 0 ? (plan.userCount / totalUsers) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={plan.id}
                className={`h-full transition-all ${
                  plan.id === "free"
                    ? "bg-muted-foreground/40"
                    : plan.id === "pro"
                    ? "bg-primary"
                    : "bg-warning"
                }`}
                style={{ width: `${pct}%` }}
                title={`${plan.name}: ${plan.userCount} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  plan.id === "free"
                    ? "bg-muted-foreground/40"
                    : plan.id === "pro"
                    ? "bg-primary"
                    : "bg-warning"
                }`}
              />
              {plan.name}: {plan.userCount}
            </div>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${plan.color} border-2 ${plan.borderColor} rounded-xl p-6 space-y-5 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className={`w-5 h-5 ${plan.iconColor}`} />
                <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
                <Users className="w-3 h-3" />
                {plan.userCount}
              </div>
            </div>

            <p className="text-2xl font-bold text-foreground">{plan.price}</p>

            <ul className="space-y-2">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${plan.iconColor}`} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
