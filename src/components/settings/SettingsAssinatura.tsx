import { useAuth } from "@/hooks/useAuth";
import { Crown, CheckCircle2, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans, PLAN_DISPLAY_NAMES, type PlanId } from "@/lib/planFeatures";

export function SettingsAssinatura() {
  const { profile } = useAuth();
  const currentPlan: PlanId = (profile?.plano as PlanId) || "free";

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Plano Atual</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Você está no plano{" "}
          <strong className="text-foreground">{PLAN_DISPLAY_NAMES[currentPlan]}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isDowngrade =
            plans.findIndex((p) => p.id === currentPlan) >=
            plans.findIndex((p) => p.id === plan.id);

          return (
            <div
              key={plan.id}
              className={`bg-card border rounded-xl p-5 space-y-3 ${
                plan.highlight
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{plan.name}</h4>
                    {plan.highlight && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{plan.tagline}</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {plan.price}
                    <span className="text-xs font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Atual
                  </span>
                )}
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && !isDowngrade && (
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                  disabled
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Em breve
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Os planos pagos estarão disponíveis em breve. Fique ligado!
      </p>
    </div>
  );
}
