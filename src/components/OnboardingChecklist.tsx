import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, ArrowRight, Sparkles,
  Package, Receipt, ChefHat, Users, ShoppingCart, Wallet, X
} from "lucide-react";

interface ChecklistCounts {
  totalProdutos: number;
  totalVendas: number;
  totalReceitas: number;
  totalClientes: number;
  totalCompras: number;
  totalDespesas: number;
}

interface OnboardingChecklistProps extends ChecklistCounts {
  onDismiss: () => void;
}

const TASKS = [
  {
    id: "produto",
    label: "Cadastre seu primeiro produto",
    description: "Adicione um produto com nome e preço de venda",
    icon: Package,
    route: "/produto",
    checkKey: "totalProdutos" as keyof ChecklistCounts,
  },
  {
    id: "receita",
    label: "Crie sua primeira receita",
    description: "Monte uma receita com ingredientes e custos",
    icon: ChefHat,
    route: "/receita",
    checkKey: "totalReceitas" as keyof ChecklistCounts,
  },
  {
    id: "venda",
    label: "Registre sua primeira venda",
    description: "Anote uma venda com cliente e valor",
    icon: Receipt,
    route: "/venda",
    checkKey: "totalVendas" as keyof ChecklistCounts,
  },
  {
    id: "cliente",
    label: "Cadastre seu primeiro cliente",
    description: "Adicione um cliente com nome e contato",
    icon: Users,
    route: "/crm",
    checkKey: "totalClientes" as keyof ChecklistCounts,
  },
  {
    id: "compra",
    label: "Registre sua primeira compra",
    description: "Lance a compra de um insumo com valor e quantidade",
    icon: ShoppingCart,
    route: "/compra",
    checkKey: "totalCompras" as keyof ChecklistCounts,
  },
  {
    id: "despesa",
    label: "Configure uma despesa fixa",
    description: "Cadastre um gasto recorrente como aluguel ou energia",
    icon: Wallet,
    route: "/despesas",
    checkKey: "totalDespesas" as keyof ChecklistCounts,
  },
];

export function OnboardingChecklist({
  totalProdutos,
  totalVendas,
  totalReceitas,
  totalClientes,
  totalCompras,
  totalDespesas,
  onDismiss,
}: OnboardingChecklistProps) {
  const navigate = useNavigate();

  const counts: ChecklistCounts = {
    totalProdutos, totalVendas, totalReceitas,
    totalClientes, totalCompras, totalDespesas,
  };

  const completedCount = useMemo(
    () => TASKS.filter((t) => counts[t.checkKey] > 0).length,
    [totalProdutos, totalVendas, totalReceitas, totalClientes, totalCompras, totalDespesas]
  );

  const allDone = completedCount === TASKS.length;
  if (allDone) return null;

  const progress = (completedCount / TASKS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Primeiros passos
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {TASKS.length} concluídos
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
          aria-label="Fechar checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {TASKS.map((task, i) => {
          const done = counts[task.checkKey] > 0;
          const Icon = task.icon;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                done
                  ? "border-primary/20 bg-accent/50"
                  : "border-border bg-card hover:bg-secondary/50 cursor-pointer"
              }`}
              onClick={() => !done && navigate(task.route)}
            >
              <div className="flex-shrink-0">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.label}
                </p>
                {!done && (
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                )}
              </div>
              {!done && (
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
