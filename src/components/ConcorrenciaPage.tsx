import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";
import { useReceitas } from "@/hooks/useReceitas";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Plus, Trash2, TrendingUp, BarChart3, Lightbulb, Loader2,
  ArrowUp, ArrowDown, Minus, AlertTriangle, Package, DollarSign, Scale,
  X, ChevronRight, Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Concorrente {
  id: string;
  nome: string;
  observacoes: string | null;
  created_at: string;
}

interface ConcorrentePreco {
  id: string;
  concorrente_id: string;
  produto_nome: string;
  preco: number;
  peso_quantidade: number;
  unidade: string;
  created_at: string;
}

interface TopProduct {
  nome: string;
  totalVendido: number;
  qtdVendas: number;
  precoMedio: number;
}

export function ConcorrenciaPage() {
  const { toast } = useToast();
  const { vendas } = useVendas();
  const { produtos } = useProdutos();
  const { receitas } = useReceitas();
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>([]);
  const [precos, setPrecos] = useState<ConcorrentePreco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddConcorrente, setShowAddConcorrente] = useState(false);
  const [novoConcorrente, setNovoConcorrente] = useState("");
  const [insights, setInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Price form state
  const [addingPriceFor, setAddingPriceFor] = useState<{ concorrenteId: string; produtoNome: string } | null>(null);
  const [novoPreco, setNovoPreco] = useState("");
  const [novoPeso, setNovoPeso] = useState("1");
  const [novaUnidade, setNovaUnidade] = useState("un");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("concorrentes").select("*").order("created_at"),
      supabase.from("concorrente_precos").select("*").order("created_at"),
    ]);
    setConcorrentes(c || []);
    setPrecos(p || []);
    setIsLoading(false);
  };

  // Top 20% products by revenue
  const topProducts: TopProduct[] = useMemo(() => {
    const map = new Map<string, { total: number; count: number; prices: number[] }>();
    vendas.forEach((v) => {
      const curr = map.get(v.produto) || { total: 0, count: 0, prices: [] };
      curr.total += v.valor_venda;
      curr.count += 1;
      curr.prices.push(v.valor_venda);
      map.set(v.produto, curr);
    });

    const sorted = Array.from(map.entries())
      .map(([nome, d]) => ({
        nome,
        totalVendido: d.total,
        qtdVendas: d.count,
        precoMedio: d.total / d.count,
      }))
      .sort((a, b) => b.totalVendido - a.totalVendido);

    const top20Count = Math.max(1, Math.ceil(sorted.length * 0.2));
    return sorted.slice(0, top20Count);
  }, [vendas]);

  const handleAddConcorrente = async () => {
    if (!novoConcorrente.trim()) return;
    if (concorrentes.length >= 5) {
      toast({ title: "Limite atingido", description: "Você pode cadastrar no máximo 5 concorrentes.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("concorrentes").insert({ nome: novoConcorrente.trim() });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar.", variant: "destructive" });
      return;
    }
    setNovoConcorrente("");
    setShowAddConcorrente(false);
    fetchData();
    toast({ title: "Concorrente adicionado!" });
  };

  const handleDeleteConcorrente = async (id: string) => {
    await supabase.from("concorrentes").delete().eq("id", id);
    fetchData();
  };

  const handleAddPreco = async () => {
    if (!addingPriceFor || !novoPreco) return;
    const { error } = await supabase.from("concorrente_precos").insert({
      concorrente_id: addingPriceFor.concorrenteId,
      produto_nome: addingPriceFor.produtoNome,
      preco: Number(novoPreco),
      peso_quantidade: Number(novoPeso) || 1,
      unidade: novaUnidade,
    });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o preço.", variant: "destructive" });
      return;
    }
    setAddingPriceFor(null);
    setNovoPreco("");
    setNovoPeso("1");
    setNovaUnidade("un");
    fetchData();
  };

  const handleDeletePreco = async (id: string) => {
    await supabase.from("concorrente_precos").delete().eq("id", id);
    fetchData();
  };

  // Normalize price to per-unit for comparison
  const normalizePrice = (preco: number, peso: number) => {
    if (!peso || peso === 0) return preco;
    return preco / peso;
  };

  // Build comparison data
  const comparisonData = useMemo(() => {
    return topProducts.map((prod) => {
      const myPricePerUnit = prod.precoMedio;
      const competitorPrices = concorrentes.map((c) => {
        const pricEntries = precos.filter(
          (p) => p.concorrente_id === c.id && p.produto_nome === prod.nome
        );
        if (pricEntries.length === 0) return null;
        const entry = pricEntries[0];
        const normalizedPrice = normalizePrice(entry.preco, entry.peso_quantidade);
        return {
          concorrente: c.nome,
          precoOriginal: entry.preco,
          peso: entry.peso_quantidade,
          unidade: entry.unidade,
          precoNormalizado: normalizedPrice,
          precoId: entry.id,
        };
      }).filter(Boolean) as {
        concorrente: string;
        precoOriginal: number;
        peso: number;
        unidade: string;
        precoNormalizado: number;
        precoId: string;
      }[];

      const avgCompetitor = competitorPrices.length
        ? competitorPrices.reduce((s, p) => s + p.precoNormalizado, 0) / competitorPrices.length
        : null;

      const diffPercent = avgCompetitor ? ((myPricePerUnit - avgCompetitor) / avgCompetitor) * 100 : null;

      return {
        produto: prod.nome,
        meuPreco: myPricePerUnit,
        qtdVendas: prod.qtdVendas,
        faturamento: prod.totalVendido,
        concorrentes: competitorPrices,
        mediaConc: avgCompetitor,
        diffPercent,
      };
    });
  }, [topProducts, concorrentes, precos]);

  const handleGenerateInsights = async () => {
    if (comparisonData.every((d) => d.concorrentes.length === 0)) {
      toast({ title: "Sem dados", description: "Cadastre preços dos concorrentes antes de gerar insights.", variant: "destructive" });
      return;
    }
    setIsGeneratingInsights(true);
    setInsights(null);
    try {
      const { data, error } = await supabase.functions.invoke("competitor-insights", {
        body: { products: comparisonData },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Não foi possível gerar os insights.", variant: "destructive" });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-accent">
          <Scale className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Análise de Concorrentes
          </h2>
          <p className="text-sm text-muted-foreground">
            Compare seus preços com a concorrência e descubra oportunidades
          </p>
        </div>
      </div>

      <Tabs defaultValue="concorrentes" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="concorrentes" className="text-[10px] sm:text-xs flex-1">
            <Users className="w-3.5 h-3.5 mr-1 hidden sm:inline" /> Concorrentes
          </TabsTrigger>
          <TabsTrigger value="comparacao" className="text-[10px] sm:text-xs flex-1">
            <BarChart3 className="w-3.5 h-3.5 mr-1 hidden sm:inline" /> Comparar
          </TabsTrigger>
          <TabsTrigger value="preco-ideal" className="text-[10px] sm:text-xs flex-1">
            <Target className="w-3.5 h-3.5 mr-1 hidden sm:inline" /> Preço Ideal
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-[10px] sm:text-xs flex-1">
            <Lightbulb className="w-3.5 h-3.5 mr-1 hidden sm:inline" /> Insights
          </TabsTrigger>
        </TabsList>

        {/* === TAB: Concorrentes === */}
        <TabsContent value="concorrentes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quem são seus concorrentes?</CardTitle>
              <CardDescription className="text-xs">
                Cadastre de 2 a 5 concorrentes para comparar preços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {concorrentes.length === 0 && !showAddConcorrente && (
                <div className="text-center py-8 border border-dashed rounded-xl">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Nenhum concorrente cadastrado</p>
                  <Button size="sm" onClick={() => setShowAddConcorrente(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Concorrente
                  </Button>
                </div>
              )}

              {concorrentes.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {c.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.nome}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {precos.filter((p) => p.concorrente_id === c.id).length} preço(s) cadastrado(s)
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleDeleteConcorrente(c.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              {showAddConcorrente && (
                <div className="flex gap-2">
                  <Input
                    value={novoConcorrente}
                    onChange={(e) => setNovoConcorrente(e.target.value)}
                    placeholder="Nome do concorrente..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddConcorrente()}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddConcorrente}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowAddConcorrente(false); setNovoConcorrente(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {concorrentes.length > 0 && concorrentes.length < 5 && !showAddConcorrente && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddConcorrente(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar Concorrente ({concorrentes.length}/5)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Seus produtos mais vendidos (Top 20%)
              </CardTitle>
              <CardDescription className="text-xs">
                Esses são os produtos que mais geram receita — ideal para comparar com a concorrência
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Registre vendas para identificar seus produtos mais vendidos
                </p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={p.nome} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-border">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.nome}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.qtdVendas} vendas • R$ {p.totalVendido.toFixed(2)} total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          ~R$ {p.precoMedio.toFixed(2)}/un
                        </Badge>
                        {(() => {
                          const produtoData = produtos.find((pr) => pr.nome === p.nome);
                          if (produtoData && (produtoData.peso_quantidade !== 1 || produtoData.unidade !== "un")) {
                            return (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {produtoData.peso_quantidade} {produtoData.unidade || "un"}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB: Comparação === */}
        <TabsContent value="comparacao" className="space-y-4">
          {topProducts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Registre vendas primeiro para ter produtos para comparar</p>
              </CardContent>
            </Card>
          )}

          {concorrentes.length < 2 && topProducts.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10">
              <CardContent className="py-4 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Cadastre pelo menos 2 concorrentes</p>
                  <p className="text-xs text-yellow-600/80 dark:text-yellow-500/70">Vá na aba "Concorrentes" e adicione quem vende produtos parecidos com os seus.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {topProducts.map((prod) => {
            const comparison = comparisonData.find((d) => d.produto === prod.nome);
            return (
              <Card key={prod.nome}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{prod.nome}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Seu preço: R$ {prod.precoMedio.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {concorrentes.map((c) => {
                    const entry = comparison?.concorrentes.find((cp) => cp.concorrente === c.nome);
                    const isAddingThis = addingPriceFor?.concorrenteId === c.id && addingPriceFor?.produtoNome === prod.nome;

                    return (
                      <div key={c.id}>
                        {entry ? (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20 border border-border">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground truncate">{c.nome}</span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                R$ {entry.precoOriginal.toFixed(2)} ({entry.peso}{entry.unidade})
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                = R$ {entry.precoNormalizado.toFixed(2)}/un
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {(() => {
                                const diff = ((prod.precoMedio - entry.precoNormalizado) / entry.precoNormalizado) * 100;
                                if (Math.abs(diff) < 5) return <Badge variant="secondary" className="text-[10px]"><Minus className="w-3 h-3 mr-0.5" /> Similar</Badge>;
                                if (diff > 0) return <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><ArrowUp className="w-3 h-3 mr-0.5" /> +{diff.toFixed(0)}%</Badge>;
                                return <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><ArrowDown className="w-3 h-3 mr-0.5" /> {diff.toFixed(0)}%</Badge>;
                              })()}
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeletePreco(entry.precoId)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : isAddingThis ? (
                          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                            <p className="text-xs font-medium text-foreground">
                              Preço de <strong>{c.nome}</strong> para <strong>{prod.nome}</strong>
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Preço (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={novoPreco}
                                  onChange={(e) => setNovoPreco(e.target.value)}
                                  placeholder="25.00"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Quantidade/Peso</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={novoPeso}
                                  onChange={(e) => setNovoPeso(e.target.value)}
                                  placeholder="1"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground">Medida</Label>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  value={novaUnidade}
                                  onChange={(e) => setNovaUnidade(e.target.value)}
                                >
                                  <option value="un">Unidade</option>
                                  <option value="kg">Kg</option>
                                  <option value="g">Gramas</option>
                                  <option value="L">Litros</option>
                                  <option value="ml">mL</option>
                                  <option value="fatia">Fatia</option>
                                  <option value="porcao">Porção</option>
                                  <option value="caixa">Caixa</option>
                                  <option value="pacote">Pacote</option>
                                </select>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              💡 Seu produto está cadastrado como {(() => {
                                const produtoData = produtos.find((p) => p.nome === prod.nome);
                                return produtoData ? `${produtoData.peso_quantidade} ${produtoData.unidade || "un"}` : "1 un";
                              })()}. Se o concorrente vende em tamanho diferente, ajuste para calcular o preço equivalente.
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleAddPreco}>Salvar</Button>
                              <Button size="sm" variant="ghost" onClick={() => setAddingPriceFor(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-muted-foreground h-8"
                            onClick={() => {
                              const produtoData = produtos.find((p) => p.nome === prod.nome);
                              setAddingPriceFor({ concorrenteId: c.id, produtoNome: prod.nome });
                              setNovoPreco("");
                              setNovoPeso(produtoData?.peso_quantidade ? String(produtoData.peso_quantidade) : "1");
                              setNovaUnidade(produtoData?.unidade || "un");
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar preço de {c.nome}
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {/* Summary */}
                  {comparison && comparison.mediaConc !== null && (
                    <div className="mt-2 p-2.5 rounded-lg bg-accent/40 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Média dos concorrentes</span>
                        <span className="text-xs font-semibold">R$ {comparison.mediaConc!.toFixed(2)}/un</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Seu preço</span>
                        <span className="text-xs font-semibold">R$ {comparison.meuPreco.toFixed(2)}/un</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-border">
                        <span className="text-xs font-medium text-foreground">Diferença</span>
                        <span className={`text-xs font-bold ${comparison.diffPercent! > 5 ? "text-red-600" : comparison.diffPercent! < -5 ? "text-emerald-600" : "text-foreground"}`}>
                          {comparison.diffPercent! > 0 ? "+" : ""}{comparison.diffPercent!.toFixed(1)}%
                          {Math.abs(comparison.diffPercent!) < 5 ? " (similar)" : comparison.diffPercent! > 0 ? " (mais caro)" : " (mais barato)"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* === TAB: Preço Ideal === */}
        <TabsContent value="preco-ideal" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" />
                Sugestão de Preço Ideal
              </CardTitle>
              <CardDescription className="text-xs">
                Preço sugerido com base no custo da receita (margem) e posicionamento de mercado (concorrência)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Registre vendas para ver sugestões de preço</p>
                </div>
              ) : (
                topProducts.map((prod) => {
                  const produto = produtos.find((p) => p.nome === prod.nome);
                  const receita = produto?.receita_id
                    ? receitas.find((r) => r.id === produto.receita_id)
                    : receitas.find((r) => r.nome === prod.nome || r.produto_id === produto?.id);

                  const custoReceita = receita?.custo_total || 0;
                  const rendimento = receita?.rendimento || 1;
                  const custoUnitario = rendimento > 0 ? custoReceita / rendimento : 0;

                  // Margin-based prices (different targets)
                  const margemMinima = custoUnitario > 0 ? custoUnitario / (1 - 0.3) : null; // 30% margin
                  const margemIdeal = custoUnitario > 0 ? custoUnitario / (1 - 0.5) : null; // 50% margin
                  const margemPremium = custoUnitario > 0 ? custoUnitario / (1 - 0.65) : null; // 65% margin

                  // Competitor average
                  const comparison = comparisonData.find((d) => d.produto === prod.nome);
                  const mediaConc = comparison?.mediaConc || null;

                  // Suggested price: weighted blend (60% margin-ideal + 40% competitor avg)
                  let precoSugerido: number | null = null;
                  if (margemIdeal && mediaConc) {
                    precoSugerido = margemIdeal * 0.6 + mediaConc * 0.4;
                  } else if (margemIdeal) {
                    precoSugerido = margemIdeal;
                  } else if (mediaConc) {
                    precoSugerido = mediaConc;
                  }

                  const diffAtual = precoSugerido
                    ? ((prod.precoMedio - precoSugerido) / precoSugerido) * 100
                    : null;

                  const hasCost = custoUnitario > 0;
                  const hasComp = mediaConc !== null;

                  return (
                    <div key={prod.nome} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">{prod.nome}</h4>
                        <Badge variant="outline" className="text-xs">
                          Atual: R$ {prod.precoMedio.toFixed(2)}
                        </Badge>
                      </div>

                      {/* Data sources indicators */}
                      <div className="flex gap-2">
                        <Badge variant={hasCost ? "default" : "secondary"} className="text-[10px]">
                          {hasCost ? "✓" : "✗"} Custo receita
                        </Badge>
                        <Badge variant={hasComp ? "default" : "secondary"} className="text-[10px]">
                          {hasComp ? "✓" : "✗"} Dados concorrência
                        </Badge>
                      </div>

                      {/* Cost breakdown */}
                      {hasCost && (
                        <div className="p-2.5 rounded-lg bg-accent/20 border border-border space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Análise de Margem</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Custo unitário</span>
                            <span className="font-medium text-foreground">R$ {custoUnitario.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Margem mínima (30%)</span>
                            <span className="text-foreground">R$ {margemMinima!.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Margem ideal (50%)</span>
                            <span className="font-semibold text-primary">R$ {margemIdeal!.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Margem premium (65%)</span>
                            <span className="text-foreground">R$ {margemPremium!.toFixed(2)}</span>
                          </div>
                          {prod.precoMedio < custoUnitario && (
                            <div className="flex items-center gap-1 mt-1 text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-[10px] font-medium">Você está vendendo abaixo do custo!</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Competitor positioning */}
                      {hasComp && (
                        <div className="p-2.5 rounded-lg bg-accent/20 border border-border space-y-1">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Posicionamento de Mercado</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Média concorrentes</span>
                            <span className="font-medium text-foreground">R$ {mediaConc!.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Seu preço</span>
                            <span className="font-medium text-foreground">R$ {prod.precoMedio.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {/* Suggested price */}
                      {precoSugerido && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold text-foreground">Preço Ideal Sugerido</span>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            R$ {precoSugerido.toFixed(2)}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {hasCost && hasComp
                              ? "Baseado em 60% margem ideal + 40% média de mercado"
                              : hasCost
                              ? "Baseado na margem ideal de 50% sobre o custo"
                              : "Baseado na média dos concorrentes"}
                          </p>
                          {diffAtual !== null && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                              Math.abs(diffAtual) < 5 ? "text-muted-foreground" :
                              diffAtual > 0 ? "text-destructive" : "text-emerald-600"
                            }`}>
                              {diffAtual > 5 ? (
                                <><ArrowDown className="w-3 h-3" /> Considere reduzir {Math.abs(diffAtual).toFixed(0)}%</>
                              ) : diffAtual < -5 ? (
                                <><ArrowUp className="w-3 h-3" /> Pode aumentar até {Math.abs(diffAtual).toFixed(0)}%</>
                              ) : (
                                <><Minus className="w-3 h-3" /> Seu preço está alinhado</>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!hasCost && !hasComp && (
                        <div className="text-center py-3 border border-dashed rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            Cadastre a receita do produto ou preços dos concorrentes para gerar sugestões
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB: Insights === */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Insights de Posicionamento
              </CardTitle>
              <CardDescription className="text-xs">
                A IA vai analisar seus preços em relação aos concorrentes e sugerir ações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights}
                className="w-full"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando concorrência...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Gerar Insights com IA
                  </>
                )}
              </Button>

              {insights && (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-accent/20 border border-border">
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
              )}

              {!insights && !isGeneratingInsights && (
                <div className="text-center py-8 border border-dashed rounded-xl">
                  <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Cadastre concorrentes e seus preços, depois clique para gerar os insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
