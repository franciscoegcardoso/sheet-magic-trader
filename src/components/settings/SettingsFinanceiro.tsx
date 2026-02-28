import { useCompras } from "@/hooks/useCompras";
import { DollarSign, TrendingDown, Calendar } from "lucide-react";

export function SettingsFinanceiro() {
  const { compras, isLoading } = useCompras();

  const sorted = [...(compras || [])].sort(
    (a, b) => new Date(b.data_compra).getTime() - new Date(a.data_compra).getTime()
  );

  const totalGasto = sorted.reduce((sum, c) => sum + Number(c.valor_compra), 0);

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">Resumo de Gastos</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Total de Compras</p>
            <p className="text-lg font-bold text-foreground">{sorted.length}</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">Total Gasto</p>
            <p className="text-lg font-bold text-foreground">
              R$ {totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Histórico de Compras
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-muted-foreground">Carregando...</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Nenhuma compra registrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {sorted.slice(0, 50).map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{c.insumo_nome}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(c.data_compra).toLocaleDateString("pt-BR")} — {c.quantidade} {c.unidade || "un"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  R$ {Number(c.valor_compra).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
