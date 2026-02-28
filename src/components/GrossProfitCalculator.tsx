import { useMemo, useState } from "react";
import { useDespesasFixas, CATEGORIAS_PADRAO } from "@/hooks/useDespesasFixas";
import { useVendas } from "@/hooks/useVendas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lightbulb,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
  Pencil,
  Save,
  X,
} from "lucide-react";

export function GrossProfitCalculator() {
  const { toast } = useToast();
  const { despesas, isLoading: loadingDespesas, addDespesa, updateDespesa, deleteDespesa, totalMensal } = useDespesasFixas();
  const { vendas, isLoading: loadingVendas } = useVendas();

  const [expanded, setExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoria, setNewCategoria] = useState("");
  const [newValor, setNewValor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  const isLoading = loadingDespesas || loadingVendas;

  // Calculate monthly revenue from vendas history
  const revenueAnalysis = useMemo(() => {
    if (vendas.length === 0) return null;

    // Group vendas by month
    const monthlyRevenue = new Map<string, number>();
    vendas.forEach((v) => {
      const month = v.data_venda.substring(0, 7); // "YYYY-MM"
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + Number(v.valor_venda));
    });

    const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const totalMonths = sortedMonths.length;

    if (totalMonths < 3) {
      return { totalMonths, hasMinimum: false, scenarios: [] };
    }

    // Build scenarios
    const scenarios: { label: string; months: number; avgRevenue: number; minMargin: number; status: string }[] = [];

    const buildScenario = (label: string, n: number) => {
      const recent = sortedMonths.slice(-n);
      const totalRev = recent.reduce((sum, [, rev]) => sum + rev, 0);
      const avgRevenue = totalRev / recent.length;
      const minMargin = avgRevenue > 0 ? (totalMensal / avgRevenue) * 100 : 0;
      const status =
        minMargin >= 85 ? "danger" :
        minMargin >= 75 ? "attention" :
        minMargin >= 60 ? "good" :
        "excellent";
      scenarios.push({ label, months: recent.length, avgRevenue, minMargin, status });
    };

    // Always show 3 months if available
    if (totalMonths >= 3) buildScenario("3 meses", 3);
    if (totalMonths >= 6) buildScenario("6 meses", 6);
    if (totalMonths >= 12) buildScenario("12 meses", 12);

    return { totalMonths, hasMinimum: true, scenarios };
  }, [vendas, totalMensal]);

  const handleAddDespesa = async () => {
    if (!newCategoria.trim() || !newValor) {
      toast({ title: "Preencha categoria e valor", variant: "destructive" });
      return;
    }
    try {
      await addDespesa({ categoria: newCategoria, valor: Number(newValor), descricao: null });
      setNewCategoria("");
      setNewValor("");
      setShowAddForm(false);
      toast({ title: "Despesa adicionada!" });
    } catch {
      toast({ title: "Erro ao adicionar", variant: "destructive" });
    }
  };

  const handleQuickAdd = async (categoria: string) => {
    if (despesas.some((d) => d.categoria === categoria)) {
      toast({ title: "Já cadastrada", description: `"${categoria}" já existe.`, variant: "destructive" });
      return;
    }
    try {
      await addDespesa({ categoria, valor: 0, descricao: null });
      toast({ title: `"${categoria}" adicionada! Defina o valor.` });
    } catch {
      toast({ title: "Erro ao adicionar", variant: "destructive" });
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateDespesa(id, { valor: Number(editValor) });
      setEditingId(null);
      toast({ title: "Valor atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDespesa(id);
      toast({ title: "Despesa removida" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const getEmoji = (cat: string) => {
    return CATEGORIAS_PADRAO.find((c) => c.categoria === cat)?.emoji || "📌";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-card border border-border rounded-xl p-4 text-left flex items-start gap-3"
      >
        <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Qual o lucro bruto mínimo ideal?
            </h3>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          {!expanded && totalMensal > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Despesas fixas: R$ {totalMensal.toFixed(2)}/mês
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="bg-accent/30 border border-border rounded-xl p-4 space-y-4">
          {/* Explanation */}
          <p className="text-sm text-foreground leading-relaxed">
            O <strong>Lucro Bruto</strong> não é o lucro final — ele ainda precisa cobrir os{" "}
            <strong>custos administrativos</strong> da empresa:
          </p>

          {/* Quick add buttons for common categories */}
          {CATEGORIAS_PADRAO.filter((c) => !despesas.some((d) => d.categoria === c.categoria)).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS_PADRAO.filter((c) => !despesas.some((d) => d.categoria === c.categoria)).map((item) => (
                <button
                  key={item.categoria}
                  onClick={() => handleQuickAdd(item.categoria)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-left"
                >
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-xs text-foreground">{item.categoria}</span>
                  <Plus className="w-3 h-3 text-primary ml-auto" />
                </button>
              ))}
            </div>
          )}

          {/* Registered fixed expenses */}
          {despesas.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <h4 className="text-xs font-semibold text-foreground">
                  Despesas Fixas Mensais
                </h4>
              </div>
              <div className="divide-y divide-border">
                {despesas.map((d) => (
                  <div key={d.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getEmoji(d.categoria)}</span>
                      <span className="text-xs text-foreground">{d.categoria}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === d.id ? (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValor}
                            onChange={(e) => setEditValor(e.target.value)}
                            className="h-7 w-24 text-xs"
                            autoFocus
                          />
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleSaveEdit(d.id)}>
                            <Save className="w-3 h-3 text-primary" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className={`text-xs font-medium ${Number(d.valor) === 0 ? "text-destructive" : "text-foreground"}`}>
                            {Number(d.valor) === 0 ? "Definir valor" : `R$ ${Number(d.valor).toFixed(2)}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => { setEditingId(d.id); setEditValor(String(d.valor)); }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(d.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-secondary/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Total Mensal</span>
                <span className="text-sm font-bold text-primary">R$ {totalMensal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Custom expense form */}
          {showAddForm ? (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground">Categoria</Label>
                <Input
                  className="h-8 text-xs"
                  value={newCategoria}
                  onChange={(e) => setNewCategoria(e.target.value)}
                  placeholder="Ex: Seguro"
                />
              </div>
              <div className="w-24">
                <Label className="text-[10px] text-muted-foreground">Valor (R$)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  step="0.01"
                  value={newValor}
                  onChange={(e) => setNewValor(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <Button size="sm" className="h-8 px-2" onClick={handleAddDespesa}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => setShowAddForm(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar outra despesa
            </Button>
          )}

          {/* ===== SCENARIOS ===== */}
          {totalMensal > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Lucro Bruto Mínimo por Cenário
              </h4>

              {!revenueAnalysis || !revenueAnalysis.hasMinimum ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Histórico insuficiente</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      É necessário pelo menos <strong>3 meses</strong> de vendas registradas para calcular os cenários.
                      {revenueAnalysis && (
                        <> Você tem <strong>{revenueAnalysis.totalMonths} {revenueAnalysis.totalMonths === 1 ? "mês" : "meses"}</strong> de histórico.</>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Baseado no seu faturamento histórico ({revenueAnalysis.totalMonths} meses de dados):
                  </p>

                  {revenueAnalysis.scenarios.map((scenario) => {
                    const idealMin = scenario.minMargin;
                    const idealWithProfit = idealMin + 10; // +10% de margem de lucro desejada

                    return (
                      <div key={scenario.label} className="bg-secondary/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">
                              Últimos {scenario.label}
                            </span>
                          </div>
                          <ScenarioBadge status={scenario.status} margin={idealWithProfit} />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 bg-card rounded-lg border border-border">
                            <p className="text-[10px] text-muted-foreground">Receita Média/Mês</p>
                            <p className="text-sm font-bold text-foreground">
                              R$ {scenario.avgRevenue.toFixed(0)}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-card rounded-lg border border-border">
                            <p className="text-[10px] text-muted-foreground">Custo Fixo / Receita</p>
                            <p className="text-sm font-bold text-foreground">
                              {scenario.minMargin.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Margem mínima para cobrir custos fixos</span>
                            <span className="font-semibold text-foreground">{scenario.minMargin.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">+ Margem de lucro (10%)</span>
                            <span className="font-semibold text-primary">{idealWithProfit.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${
                                scenario.status === "danger"
                                  ? "bg-destructive"
                                  : scenario.status === "attention"
                                  ? "bg-warning"
                                  : scenario.status === "good"
                                  ? "bg-primary/70"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${Math.min(100, idealWithProfit)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Margin reference */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">📏 Referência de Margem Bruta</h4>
            <div className="space-y-1.5">
              <MarginRef label="Abaixo de 15%" level="danger" desc="Prejuízo quase certo. Os custos fixos vão consumir tudo." />
              <MarginRef label="15% a 25%" level="attention" desc="Zona de atenção. Sobra pouco para custos fixos." />
              <MarginRef label="25% a 40%" level="good" desc="Saudável. Consegue cobrir custos fixos e ter lucro." />
              <MarginRef label="Acima de 40%" level="excellent" desc="Excelente! Margem confortável para crescer." />
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            💡 Dica: some todos os custos fixos mensais e divida pelo faturamento. Se o resultado
            for 20%, seu lucro bruto mínimo precisa ser pelo menos 20% + a margem de lucro desejada.
          </p>
        </div>
      )}
    </div>
  );
}

/* ===== Sub-components ===== */

function ScenarioBadge({ status, margin }: { status: string; margin: number }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    excellent: { bg: "bg-primary/20", text: "text-primary", label: "Confortável" },
    good: { bg: "bg-primary/15", text: "text-primary", label: "Saudável" },
    attention: { bg: "bg-warning/20", text: "text-warning", label: "Apertado" },
    danger: { bg: "bg-destructive/20", text: "text-destructive", label: "Crítico" },
  };
  const c = config[status] || config.danger;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label} — mín. {margin.toFixed(0)}%
    </span>
  );
}

function MarginRef({
  label,
  level,
  desc,
}: {
  label: string;
  level: "danger" | "attention" | "good" | "excellent";
  desc: string;
}) {
  const colors: Record<string, string> = {
    danger: "bg-destructive",
    attention: "bg-warning",
    good: "bg-primary/70",
    excellent: "bg-primary",
  };
  return (
    <div className="flex items-start gap-2">
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${colors[level]}`} />
      <div>
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground ml-1">— {desc}</span>
      </div>
    </div>
  );
}
