import { useMemo, useState } from "react";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";
import { useReceitas } from "@/hooks/useReceitas";
import { useCompras } from "@/hooks/useCompras";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Calculator,
  Target,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

interface Competitor {
  nome: string;
  preco: string;
}

export function SalesPlanning() {
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { produtos, isLoading: loadingProdutos } = useProdutos();
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();

  const isLoading = loadingVendas || loadingProdutos || loadingReceitas || loadingCompras;

  // Elasticity simulator state
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { nome: "Concorrente 1", preco: "" },
    { nome: "Concorrente 2", preco: "" },
  ]);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [elasticity, setElasticity] = useState(1.5); // default elasticity coefficient

  // Products with CMV calculation
  const productsWithCMV = useMemo(() => {
    const custoMap = new Map(custoMedioPorInsumo.map((c) => [c.insumo_nome, c.custo_medio]));

    return produtos.map((p) => {
      const receita = receitas.find((r) => r.id === p.receita_id);
      let cmv = 0;
      if (receita && receita.ingredientes) {
        const rendimento = receita.rendimento && receita.rendimento > 0 ? receita.rendimento : 1;
        cmv = receita.ingredientes.reduce((sum, ing) => {
          const custoMedio = custoMap.get(ing.insumo_nome) || ing.custo_unitario || 0;
          return sum + (ing.quantidade * custoMedio) / rendimento;
        }, 0);
      }

      // Sales history for this product
      const prodVendas = vendas.filter(
        (v) =>
          v.produto.toLowerCase().includes(p.nome.toLowerCase()) ||
          p.nome.toLowerCase().includes(v.produto.toLowerCase())
      );
      const totalVendas = prodVendas.length;
      const totalFaturamento = prodVendas.reduce((s, v) => s + Number(v.valor_venda), 0);
      const precoMedioVenda =
        totalVendas > 0 ? totalFaturamento / totalVendas : Number(p.preco_venda);

      return {
        ...p,
        cmv,
        hasCMV: cmv > 0,
        totalVendas,
        totalFaturamento,
        precoMedioVenda,
        margemPercent: precoMedioVenda > 0 ? ((precoMedioVenda - cmv) / precoMedioVenda) * 100 : 0,
      };
    });
  }, [produtos, receitas, custoMedioPorInsumo, vendas]);

  // Monthly sales history
  const salesByMonth = useMemo(() => {
    const map = new Map<string, { month: string; valor: number; qtd: number }>();
    vendas.forEach((v) => {
      const month = v.data_venda.substring(0, 7); // YYYY-MM
      const existing = map.get(month) || { month, valor: 0, qtd: 0 };
      existing.valor += Number(v.valor_venda);
      existing.qtd += 1;
      map.set(month, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((d) => ({
        ...d,
        label: new Date(d.month + "-01T00:00:00").toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
      }));
  }, [vendas]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    return [...productsWithCMV]
      .filter((p) => p.totalVendas > 0)
      .sort((a, b) => b.totalFaturamento - a.totalFaturamento)
      .slice(0, 10);
  }, [productsWithCMV]);

  // Projection (simple linear avg)
  const projections = useMemo(() => {
    if (salesByMonth.length < 2) return [];
    const last3 = salesByMonth.slice(-3);
    const avgValor = last3.reduce((s, m) => s + m.valor, 0) / last3.length;
    const avgQtd = last3.reduce((s, m) => s + m.qtd, 0) / last3.length;

    const lastDate = new Date(salesByMonth[salesByMonth.length - 1].month + "-01");
    const result = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i);
      result.push({
        month: d.toISOString().substring(0, 7),
        label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        valor: Math.round(avgValor),
        qtd: Math.round(avgQtd),
        projected: true,
      });
    }
    return result;
  }, [salesByMonth]);

  // Elasticity simulator data
  const selectedProd = productsWithCMV.find((p) => p.id === selectedProduct);
  const competitorAvg = useMemo(() => {
    const prices = competitors.map((c) => Number(c.preco)).filter((p) => p > 0);
    return prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
  }, [competitors]);

  const elasticityData = useMemo(() => {
    if (!selectedProd) return [];
    const basePrice = selectedProd.precoMedioVenda;
    const baseQty = selectedProd.totalVendas || 100; // use 100 as default if no sales
    const cmv = selectedProd.cmv;
    const points = [];

    for (let pct = -30; pct <= 50; pct += 5) {
      const newPrice = basePrice * (1 + pct / 100);
      const qtyChange = -pct * (elasticity / 100);
      const newQty = baseQty * (1 + qtyChange);
      const revenue = newPrice * Math.max(0, newQty);
      const profit = (newPrice - cmv) * Math.max(0, newQty);
      const isAboveCMV = newPrice > cmv;

      points.push({
        pct,
        label: `${pct >= 0 ? "+" : ""}${pct}%`,
        preco: Number(newPrice.toFixed(2)),
        qtdEstimada: Math.max(0, Math.round(newQty)),
        faturamento: Number(revenue.toFixed(2)),
        lucro: Number(profit.toFixed(2)),
        isAboveCMV,
        isSelected: pct === Math.round(priceChangePercent / 5) * 5,
      });
    }
    return points;
  }, [selectedProd, elasticity, priceChangePercent]);

  const simulatedPrice = selectedProd
    ? selectedProd.precoMedioVenda * (1 + priceChangePercent / 100)
    : 0;
  const simulatedQtyChange = -priceChangePercent * (elasticity / 100);
  const simulatedQty = selectedProd
    ? (selectedProd.totalVendas || 100) * (1 + simulatedQtyChange)
    : 0;

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([
        ...competitors,
        { nome: `Concorrente ${competitors.length + 1}`, preco: "" },
      ]);
    }
  };

  const removeCompetitor = (idx: number) => {
    setCompetitors(competitors.filter((_, i) => i !== idx));
  };

  const updateCompetitor = (idx: number, field: "nome" | "preco", value: string) => {
    setCompetitors((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

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
          <Target className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Metas e Planejamento
          </h2>
          <p className="text-sm text-muted-foreground">
            Analise seu desempenho e teste novos preços
          </p>
        </div>
      </div>

      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="historico" className="text-xs">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />
            Como foi
          </TabsTrigger>
          <TabsTrigger value="projecao" className="text-xs">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Previsão
          </TabsTrigger>
          <TabsTrigger value="elasticidade" className="text-xs">
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Teste de Preço
          </TabsTrigger>
        </TabsList>

        {/* ===== HISTORY ===== */}
        <TabsContent value="historico" className="space-y-4">
          <ReportCard title="Vendas Mensais">
            {salesByMonth.length === 0 ? (
              <EmptyState text="Registre vendas para ver o histórico" />
            ) : (
              <div className="px-2 pt-4 pb-2">
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number, name: string) => [
                        name === "valor" ? `R$ ${v.toFixed(2)}` : v,
                        name === "valor" ? "Faturamento" : "Vendas",
                      ]}
                    />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Line dataKey="qtd" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportCard>

          <ReportCard title="Top Produtos por Faturamento">
            {topProducts.length === 0 ? (
              <EmptyState text="Nenhum produto vendido ainda" />
            ) : (
              <div className="divide-y divide-border">
                {topProducts.map((p) => (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">{p.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.totalVendas} vendas</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        R$ {p.totalFaturamento.toFixed(2)}
                      </div>
                      {p.hasCMV && (
                        <div className="text-[10px] text-muted-foreground">
                          Margem: {p.margemPercent.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* ===== PROJECTION ===== */}
        <TabsContent value="projecao" className="space-y-4">
          <ReportCard title="Projeção de Vendas (próximos 3 meses)">
            {salesByMonth.length < 2 ? (
              <EmptyState text="São necessários pelo menos 2 meses de histórico para projetar" />
            ) : (
              <div className="px-2 pt-4 pb-2">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart
                    data={[
                      ...salesByMonth.slice(-6).map((d) => ({ ...d, projected: false })),
                      ...projections,
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number, name: string) => [
                        name === "valor" ? `R$ ${v.toFixed(2)}` : v,
                        name === "valor" ? "Faturamento" : "Quantidade",
                      ]}
                    />
                    <Bar
                      dataKey="valor"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.8}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 justify-center mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Realizado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-primary/50 inline-block" /> Projetado
                  </span>
                </div>
              </div>
            )}
          </ReportCard>

          {projections.length > 0 && (
            <ReportCard title="Resumo da Projeção">
              <div className="divide-y divide-border">
                {projections.map((p) => (
                  <div key={p.month} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">{p.label}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        R$ {p.valor.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">~{p.qtd} vendas</div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportCard>
          )}
        </TabsContent>

        {/* ===== PRICE ELASTICITY ===== */}
        <TabsContent value="elasticidade" className="space-y-4">
          {/* Product selector */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Label className="text-xs font-semibold text-foreground">Selecionar Produto</Label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm"
            >
              <option value="">Escolha um produto...</option>
              {productsWithCMV.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.hasCMV ? `(CMV: R$${p.cmv.toFixed(2)})` : "(sem CMV)"}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && selectedProd && !selectedProd.hasCMV && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">CMV não definido</p>
                <p className="text-xs text-destructive/80 mt-1">
                  Para simular elasticidade de preço, é necessário ter o Custo de Mercadoria Vendida
                  (CMV) definido. Vincule uma receita com ingredientes e registre compras para
                  calcular automaticamente.
                </p>
              </div>
            </div>
          )}

          {selectedProduct && selectedProd && selectedProd.hasCMV && (
            <>
              {/* Current product info */}
              <div className="grid grid-cols-3 gap-2">
                <MiniCard label="Preço Médio" value={`R$ ${selectedProd.precoMedioVenda.toFixed(2)}`} />
                <MiniCard label="CMV" value={`R$ ${selectedProd.cmv.toFixed(2)}`} />
                <MiniCard
                  label="Margem"
                  value={`${selectedProd.margemPercent.toFixed(0)}%`}
                  accent={selectedProd.margemPercent > 0}
                />
              </div>

              {/* Competitors */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Preços Concorrentes
                  </Label>
                  {competitors.length < 5 && (
                    <Button variant="ghost" size="sm" onClick={addCompetitor} className="h-7 text-xs gap-1">
                      <Plus className="w-3 h-3" /> Adicionar
                    </Button>
                  )}
                </div>
                {competitors.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={c.nome}
                      onChange={(e) => updateCompetitor(idx, "nome", e.target.value)}
                      className="h-8 text-xs flex-1"
                      placeholder="Nome"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={c.preco}
                        onChange={(e) => updateCompetitor(idx, "preco", e.target.value)}
                        className="h-8 text-xs pl-7"
                        placeholder="0,00"
                      />
                    </div>
                    {competitors.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeCompetitor(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
                {competitorAvg > 0 && (
                  <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                    Média concorrentes:{" "}
                    <span className="font-semibold text-foreground">R$ {competitorAvg.toFixed(2)}</span>
                    {selectedProd.precoMedioVenda > competitorAvg ? (
                      <span className="ml-2 text-warning">
                        (seu preço é {((selectedProd.precoMedioVenda / competitorAvg - 1) * 100).toFixed(0)}% acima)
                      </span>
                    ) : (
                      <span className="ml-2 text-primary">
                        (seu preço é {((1 - selectedProd.precoMedioVenda / competitorAvg) * 100).toFixed(0)}% abaixo)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Elasticity controls */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Variação de Preço: {priceChangePercent >= 0 ? "+" : ""}
                    {priceChangePercent}%
                  </Label>
                  <Slider
                    value={[priceChangePercent]}
                    onValueChange={([v]) => setPriceChangePercent(v)}
                    min={-30}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>-30%</span>
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Coeficiente de Elasticidade: {elasticity.toFixed(1)}
                  </Label>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Para cada 1% de aumento no preço, a demanda cai {elasticity.toFixed(1)}%
                  </p>
                  <Slider
                    value={[elasticity * 10]}
                    onValueChange={([v]) => setElasticity(v / 10)}
                    min={5}
                    max={30}
                    step={1}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0.5 (inelástico)</span>
                    <span>3.0 (elástico)</span>
                  </div>
                </div>
              </div>

              {/* Simulation result */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Resultado da Simulação
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <SimCard
                      label="Novo Preço"
                      value={`R$ ${simulatedPrice.toFixed(2)}`}
                      isWarning={simulatedPrice <= selectedProd.cmv}
                    />
                    <SimCard
                      label="Qtd Estimada"
                      value={`${Math.max(0, Math.round(simulatedQty))} un`}
                      isWarning={simulatedQty <= 0}
                    />
                    <SimCard
                      label="Faturamento"
                      value={`R$ ${(simulatedPrice * Math.max(0, simulatedQty)).toFixed(2)}`}
                    />
                    <SimCard
                      label="Lucro Estimado"
                      value={`R$ ${((simulatedPrice - selectedProd.cmv) * Math.max(0, simulatedQty)).toFixed(2)}`}
                      isWarning={(simulatedPrice - selectedProd.cmv) * simulatedQty < 0}
                      accent={(simulatedPrice - selectedProd.cmv) * simulatedQty > 0}
                    />
                  </div>

                  {/* Visual warning when below CMV */}
                  {simulatedPrice <= selectedProd.cmv ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        Preço abaixo do CMV (R$ {selectedProd.cmv.toFixed(2)}). Venda com prejuízo!
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs text-foreground">
                        Margem unitária: R$ {(simulatedPrice - selectedProd.cmv).toFixed(2)} (
                        {(((simulatedPrice - selectedProd.cmv) / simulatedPrice) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Elasticity chart */}
              <ReportCard title="Curva de Elasticidade">
                <div className="px-2 pt-4 pb-2">
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={elasticityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis yAxisId="left" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        formatter={(v: number, name: string) => {
                          if (name === "lucro") return [`R$ ${v.toFixed(2)}`, "Lucro"];
                          if (name === "faturamento") return [`R$ ${v.toFixed(2)}`, "Faturamento"];
                          if (name === "qtdEstimada") return [v, "Qtd Estimada"];
                          return [v, name];
                        }}
                      />
                      <ReferenceLine
                        yAxisId="left"
                        y={0}
                        stroke="hsl(var(--destructive))"
                        strokeDasharray="3 3"
                        label={{ value: "Prejuízo", fontSize: 9, fill: "hsl(var(--destructive))" }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="lucro"
                        fill="hsl(var(--primary))"
                        radius={[3, 3, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        dataKey="qtdEstimada"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 justify-center mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Lucro (R$)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-warning inline-block rounded" /> Qtd Estimada
                    </span>
                  </div>
                </div>
              </ReportCard>

              {/* Competitor comparison visual */}
              {competitorAvg > 0 && (
                <ReportCard title="Posicionamento vs Concorrência">
                  <div className="p-4 space-y-3">
                    <PriceBar
                      label="CMV"
                      value={selectedProd.cmv}
                      max={Math.max(simulatedPrice, competitorAvg, selectedProd.cmv) * 1.2}
                      color="bg-destructive"
                    />
                    <PriceBar
                      label="Seu preço"
                      value={simulatedPrice}
                      max={Math.max(simulatedPrice, competitorAvg, selectedProd.cmv) * 1.2}
                      color={simulatedPrice > selectedProd.cmv ? "bg-primary" : "bg-destructive"}
                    />
                    {competitors
                      .filter((c) => Number(c.preco) > 0)
                      .map((c, i) => (
                        <PriceBar
                          key={i}
                          label={c.nome}
                          value={Number(c.preco)}
                          max={Math.max(simulatedPrice, competitorAvg, selectedProd.cmv) * 1.2}
                          color="bg-muted-foreground/40"
                        />
                      ))}
                  </div>
                </ReportCard>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===== Sub-components ===== */

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-sm text-muted-foreground py-8">{text}</p>;
}

function MiniCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function SimCard({
  label,
  value,
  isWarning,
  accent,
}: {
  label: string;
  value: string;
  isWarning?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border text-center ${
        isWarning
          ? "bg-destructive/10 border-destructive/30"
          : "bg-card border-border"
      }`}
    >
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={`text-sm font-bold ${
          isWarning ? "text-destructive" : accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PriceBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">R$ {value.toFixed(2)}</span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
