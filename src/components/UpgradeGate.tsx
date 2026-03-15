import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_DISPLAY_NAMES, type PlanId } from "@/lib/planFeatures";

interface UpgradeGateProps {
  requiredPlan: PlanId;
  onUpgrade?: () => void;
}

export function UpgradeGate({ requiredPlan, onUpgrade }: UpgradeGateProps) {
  const planName = PLAN_DISPLAY_NAMES[requiredPlan];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">
        Recurso do plano {planName}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Faça upgrade para o plano <strong className="text-foreground">{planName}</strong> para
        desbloquear essa funcionalidade e impulsionar seu negócio.
      </p>
      <Button onClick={onUpgrade} className="gap-2">
        Ver planos
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
