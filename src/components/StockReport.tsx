import { useMemo, useState } from "react";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import { useReceitas } from "@/hooks/useReceitas";
import { useProdutos } from "@/hooks/useProdutos";
import { useProducao } from "@/hooks/useProducao";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Warehouse,
  ShoppingCart,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Save,
  Package,
  Factory,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EstoqueItem {
  insumo_nome: string;
  totalComprado: number;
  totalConsumido: number;
  estoqueVirtual: number;
  unidade: string;
  consumoDiario: number;
  diasEstoque: number;
}

interface InventoryRow {
  insumo_nome: string;
  qtdSistema: number;
  qtdContada: string;
  observacao: string;
}

export function StockReport() {
  const { compras, custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { produtos, isLoading: loadingProdutos } = useProdutos();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { producoes, addProducao, deleteProducao, estoqueProdutos, produzido, vendido, isLoading: loadingProducao } = useProducao();

  const [diasSugestao, setDiasSugestao] = useState(30);
  const [savingReview, setSavingReview] = useState(false);
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([]);

  // Production form state
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [qtdProducao, setQtdProducao] = useState("");
  const [dataProducao, setDataProducao] = useState(() => new Date().toISOString().split("T")[0]);
  const [obsProducao, setObsProducao] = useState("");
  const [savingProducao, setSavingProducao] = useState(false);

  // Adjust stock dialog state
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProduto, setAdjustProduto] = useState<{ nome: string; deficit: number } | null>(null);
  const [adjustQtd, setAdjustQtd] = useState("");
  const [adjustMotivo, setAdjustMotivo] = useState("");
  const [adjustObs, setAdjustObs] = useState("");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const isLoading = loadingCompras || loadingVendas || loadingReceitas || loadingProdutos || loadingProducao;

  // Fetch past reviews
  const { data: revisoes = [] } = useQuery({
    queryKey: ["inventario_revisoes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventario_revisoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Calculate consumed ingredients from sales × recipes
  const estoque = useMemo<EstoqueItem[]>(() => {
    // Map product name → receita
    const prodToReceita = new Map<string, typeof receitas[0]>();
    produtos.forEach((p) => {
      if (p.receita_id) {
        const r = receitas.find((rec) => rec.id === p.receita_id);
        if (r) prodToReceita.set(p.nome.toLowerCase(), r);
      }
    });

    // Total consumed per ingredient
    const consumido = new Map<string, number>();
    vendas.forEach((v) => {
      // Find recipe for this product
      const receita = prodToReceita.get(v.produto.toLowerCase()) ||
        Array.from(prodToReceita.entries()).find(
          ([name]) => v.produto.toLowerCase().includes(name) || name.includes(v.produto.toLowerCase())
        )?.[1];

      if (!receita || !receita.ingredientes) return;

      const rendimento = receita.rendimento && receita.rendimento > 0 ? receita.rendimento : 1;
      receita.ingredientes.forEach((ing) => {
        const perUnit = ing.quantidade / rendimento;
        const prev = consumido.get(ing.insumo_nome) || 0;
        consumido.set(ing.insumo_nome, prev + perUnit);
      });
    });

    // Calculate daily consumption (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentVendas = vendas.filter((v) => new Date(v.data_venda) >= thirtyDaysAgo);

    const consumidoRecente = new Map<string, number>();
    recentVendas.forEach((v) => {
      const receita = prodToReceita.get(v.produto.toLowerCase()) ||
        Array.from(prodToReceita.entries()).find(
          ([name]) => v.produto.toLowerCase().includes(name) || name.includes(v.produto.toLowerCase())
        )?.[1];

      if (!receita || !receita.ingredientes) return;
      const rendimento = receita.rendimento && receita.rendimento > 0 ? receita.rendimento : 1;
      receita.ingredientes.forEach((ing) => {
        const perUnit = ing.quantidade / rendimento;
        const prev = consumidoRecente.get(ing.insumo_nome) || 0;
        consumidoRecente.set(ing.insumo_nome, prev + perUnit);
      });
    });

    // Build stock items
    const allInsumos = new Set<string>();
    custoMedioPorInsumo.forEach((c) => allInsumos.add(c.insumo_nome));
    consumido.forEach((_, k) => allInsumos.add(k));

    return Array.from(allInsumos)
      .map((nome) => {
        const compraInfo = custoMedioPorInsumo.find((c) => c.insumo_nome === nome);
        const totalComprado = compraInfo?.total_comprado || 0;
        const totalConsumido = consumido.get(nome) || 0;

        // Get latest review adjustment
        const lastReview = revisoes.find((r: any) => r.insumo_nome === nome);
        const estoqueVirtual = lastReview
          ? Number(lastReview.quantidade_contada) - (totalConsumido - Number(lastReview.quantidade_sistema) + totalConsumido)
          : totalComprado - totalConsumido;

        // Use simple calculation: purchased - consumed
        const estoque = totalComprado - totalConsumido;

        const consumoDiario30 = (consumidoRecente.get(nome) || 0) / 30;
        const diasEstoque = consumoDiario30 > 0 ? estoque / consumoDiario30 : estoque > 0 ? 999 : 0;

        const unidadeCompra = compras.find((c) => c.insumo_nome === nome)?.unidade || "un";

        return {
          insumo_nome: nome,
          totalComprado,
          totalConsumido,
          estoqueVirtual: estoque,
          unidade: unidadeCompra,
          consumoDiario: consumoDiario30,
          diasEstoque,
        };
      })
      .sort((a, b) => a.diasEstoque - b.diasEstoque);
  }, [compras, vendas, receitas, produtos, custoMedioPorInsumo, revisoes]);

  // Order suggestion
  const sugestoesPedido = useMemo(() => {
    return estoque
      .filter((item) => item.consumoDiario > 0)
      .map((item) => {
        const necessarioParaPeriodo = item.consumoDiario * diasSugestao;
        const aComprar = Math.max(0, necessarioParaPeriodo - item.estoqueVirtual);
        const custoInfo = custoMedioPorInsumo.find((c) => c.insumo_nome === item.insumo_nome);
        const custoEstimado = aComprar * (custoInfo?.custo_medio || 0);
        return { ...item, necessarioParaPeriodo, aComprar, custoEstimado };
      })
      .filter((s) => s.aComprar > 0)
      .sort((a, b) => a.diasEstoque - b.diasEstoque);
  }, [estoque, diasSugestao, custoMedioPorInsumo]);

  // Inventory review
  const initReview = () => {
    setInventoryRows(
      estoque.map((item) => ({
        insumo_nome: item.insumo_nome,
        qtdSistema: item.estoqueVirtual,
        qtdContada: "",
        observacao: "",
      }))
    );
  };

  const updateRow = (idx: number, field: "qtdContada" | "observacao", value: string) => {
    setInventoryRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const saveReview = async () => {
    const filledRows = inventoryRows.filter((r) => r.qtdContada !== "");
    if (filledRows.length === 0) {
      toast({ title: "Nenhum item preenchido", variant: "destructive" });
      return;
    }

    setSavingReview(true);
    try {
      const inserts = filledRows.map((r) => ({
        insumo_nome: r.insumo_nome,
        quantidade_contada: Number(r.qtdContada),
        quantidade_sistema: r.qtdSistema,
        diferenca: Number(r.qtdContada) - r.qtdSistema,
        observacao: r.observacao || null,
      }));

      const { error } = await supabase.from("inventario_revisoes").insert(inserts);
      if (error) throw error;

      toast({ title: "Revisão salva!", description: `${filledRows.length} itens revisados.` });
      setInventoryRows([]);
      queryClient.invalidateQueries({ queryKey: ["inventario_revisoes"] });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao salvar revisão", variant: "destructive" });
    } finally {
      setSavingReview(false);
    }
  };

  const openAdjustDialog = (nome: string, saldo: number) => {
    const prod = produtos.find((p) => p.nome === nome);
    if (!prod) {
      toast({ title: "Produto não encontrado no cadastro", variant: "destructive" });
      return;
    }
    setAdjustProduto({ nome, deficit: Math.abs(saldo) });
    setAdjustQtd(String(Math.abs(saldo)));
    setAdjustMotivo("");
    setAdjustObs("");
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!adjustProduto) return;
    const prod = produtos.find((p) => p.nome === adjustProduto.nome);
    if (!prod) return;
    setSavingAdjust(true);
    try {
      await addProducao({
        produto_id: prod.id,
        produto_nome: prod.nome,
        quantidade: Number(adjustQtd),
        data_producao: new Date().toISOString().split("T")[0],
        observacao: `Ajuste: ${adjustMotivo || "não identificado"}${adjustObs ? ` – ${adjustObs}` : ""}`,
      });
      toast({ title: "Ajuste registrado!", description: `${adjustQtd}x ${prod.nome}` });
      setAdjustOpen(false);
      setAdjustProduto(null);
    } catch {
      toast({ title: "Erro ao registrar ajuste", variant: "destructive" });
    } finally {
      setSavingAdjust(false);
    }
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
          <Warehouse className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Controle de Estoque</h2>
          <p className="text-sm text-muted-foreground">Veja o que tem disponível e o que precisa comprar</p>
        </div>
      </div>

      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="estoque" className="text-[10px] sm:text-xs">
            <Package className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            O que tenho
          </TabsTrigger>
          <TabsTrigger value="producao" className="text-[10px] sm:text-xs">
            <Factory className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Produzir
          </TabsTrigger>
          <TabsTrigger value="pedido" className="text-[10px] sm:text-xs">
            <ShoppingCart className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Preciso comprar
          </TabsTrigger>
          <TabsTrigger value="revisao" className="text-[10px] sm:text-xs">
            <ClipboardCheck className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Conferir
          </TabsTrigger>
        </TabsList>

        {/* Stock Report */}
        <TabsContent value="estoque" className="space-y-3">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Quanto tenho de cada ingrediente</h3>
              <p className="text-[11px] text-muted-foreground">Calculado automaticamente: o que comprou menos o que usou</p>
            </div>
            {estoque.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Registre compras e cadastre receitas com ingredientes para ver seu estoque aqui
              </p>
            ) : (
              <div className="divide-y divide-border">
                {estoque.map((item) => (
                  <div key={item.insumo_nome} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.diasEstoque < 7 ? (
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        ) : item.diasEstoque < 15 ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">{item.insumo_nome}</span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          item.estoqueVirtual <= 0
                            ? "text-destructive"
                            : item.diasEstoque < 7
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-foreground"
                        }`}
                      >
                        {item.estoqueVirtual.toFixed(2)} {item.unidade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>
                        Entrou: {item.totalComprado.toFixed(2)} | Saiu: {item.totalConsumido.toFixed(2)}
                      </span>
                      <span>
                        {item.consumoDiario > 0
                          ? `~${item.diasEstoque === 999 ? "∞" : Math.round(item.diasEstoque)} dias de estoque`
                          : "Sem uso recente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="producao" className="space-y-3">
          {/* Production form */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-display font-semibold text-sm text-foreground">Registrar o que produziu</h3>
            <div>
              <Label className="text-xs text-muted-foreground">Produto</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione o produto..." /></SelectTrigger>
                <SelectContent>
                  {produtos.filter((p) => p.ativo).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Quantidade</Label>
                <Input type="number" step="1" min="1" value={qtdProducao} onChange={(e) => setQtdProducao(e.target.value)} placeholder="0" className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input type="date" value={dataProducao} onChange={(e) => setDataProducao(e.target.value)} className="h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Observação (opcional)</Label>
              <Input value={obsProducao} onChange={(e) => setObsProducao(e.target.value)} placeholder="Ex: Lote 23" className="h-9" />
            </div>
            <Button
              className="w-full"
              disabled={savingProducao || !produtoSelecionado || !qtdProducao}
              onClick={async () => {
                const prod = produtos.find((p) => p.id === produtoSelecionado);
                if (!prod) return;
                setSavingProducao(true);
                try {
                  await addProducao({
                    produto_id: prod.id,
                    produto_nome: prod.nome,
                    quantidade: Number(qtdProducao),
                    data_producao: dataProducao,
                    observacao: obsProducao || null,
                  });
                  toast({ title: "Produção registrada!", description: `${qtdProducao}x ${prod.nome}` });
                  setProdutoSelecionado("");
                  setQtdProducao("");
                  setObsProducao("");
                } catch {
                  toast({ title: "Erro ao registrar", variant: "destructive" });
                } finally {
                  setSavingProducao(false);
                }
              }}
            >
              {savingProducao ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Registrar Produção
            </Button>
          </div>

          {/* Stock summary with negative stock alert */}
          {Object.keys(estoqueProdutos).length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-display font-semibold text-sm text-foreground">Produtos prontos em estoque</h3>
                <p className="text-[11px] text-muted-foreground">Produzido − Vendido = Saldo</p>
              </div>
              
              {/* Alert for negative stock */}
              {Object.entries(estoqueProdutos).some(([,saldo]) => saldo < 0) && (
                <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-destructive">Atenção: Estoque negativo detectado</p>
                      <p className="text-[11px] text-destructive/80 mt-0.5">
                        Os itens destacados em vermelho indicam possíveis roubos, perdas ou erro/falta de registro de produção.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="divide-y divide-border">
                <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-muted/50 text-[11px] font-medium text-muted-foreground">
                  <span>Produto</span>
                  <span className="text-right">Produzido</span>
                  <span className="text-right">Vendido</span>
                  <span className="text-right">Saldo</span>
                  <span className="text-right">Ação</span>
                </div>
                {Object.entries(estoqueProdutos).sort(([,a], [,b]) => b - a).map(([nome, saldo]) => {
                  const qtdProduzido = produzido[nome] || 0;
                  const qtdVendido = vendido[nome] || 0;
                  const isNegative = saldo < 0;
                  return (
                    <div key={nome} className={`grid grid-cols-5 gap-2 px-4 py-3 items-center ${isNegative ? 'bg-destructive/5' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        {isNegative && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                        <span className={`text-sm font-medium truncate ${isNegative ? 'text-destructive' : 'text-foreground'}`}>{nome}</span>
                      </div>
                      <span className={`text-sm text-right ${isNegative ? 'text-destructive/70' : 'text-muted-foreground'}`}>{qtdProduzido}</span>
                      <span className={`text-sm text-right ${isNegative ? 'text-destructive/70' : 'text-muted-foreground'}`}>{qtdVendido}</span>
                      <span className={`text-sm font-bold text-right ${isNegative ? 'text-destructive' : saldo < 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                        {saldo}
                      </span>
                      <div className="flex justify-end">
                        {isNegative && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => openAdjustDialog(nome, saldo)}
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            Ajustar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent production entries */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Últimas produções</h3>
            </div>
            {producoes.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum lançamento registrado</p>
            ) : (
              <div className="divide-y divide-border max-h-[40vh] overflow-y-auto">
                {producoes.slice(0, 30).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">{p.produto_nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(p.data_producao).toLocaleDateString("pt-BR")} · {Number(p.quantidade)} un
                      </span>
                      {p.observacao && <span className="text-xs text-muted-foreground ml-1">({p.observacao})</span>}
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteProducao(p.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Order Suggestion */}
        <TabsContent value="pedido" className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <Label className="text-xs text-muted-foreground">Dias de estoque desejado</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={diasSugestao}
              onChange={(e) => setDiasSugestao(Number(e.target.value) || 30)}
              className="h-9 mt-1"
            />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">
                Sugestão de Pedido para {diasSugestao} dias
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Baseado no consumo médio dos últimos 30 dias
              </p>
            </div>
            {sugestoesPedido.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Estoque suficiente para o período ou sem dados de consumo
              </p>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {sugestoesPedido.map((item) => (
                    <div key={item.insumo_nome} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.insumo_nome}</span>
                        <span className="text-sm font-bold text-primary">
                          {item.aComprar.toFixed(2)} {item.unidade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>
                          Estoque: {item.estoqueVirtual.toFixed(2)} | Necessário: {item.necessarioParaPeriodo.toFixed(2)}
                        </span>
                        <span>~R$ {item.custoEstimado.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Estimado</span>
                    <span className="text-sm font-bold text-primary">
                      R$ {sugestoesPedido.reduce((s, i) => s + i.custoEstimado, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Inventory Review */}
        <TabsContent value="revisao" className="space-y-3">
          {inventoryRows.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
              <ClipboardCheck className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Inicie uma revisão de inventário para comparar o estoque físico com o virtual e identificar divergências.
              </p>
              <Button onClick={initReview} className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Iniciar Revisão
              </Button>

              {/* Past reviews */}
              {revisoes.length > 0 && (
                <div className="mt-4 text-left">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Últimas Revisões</h4>
                  <div className="divide-y divide-border bg-muted/30 rounded-lg overflow-hidden">
                    {revisoes.slice(0, 10).map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2 text-xs">
                        <div>
                          <span className="font-medium text-foreground">{r.insumo_nome}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(r.data_revisao).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Sistema: {Number(r.quantidade_sistema).toFixed(2)}</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium text-foreground">Contado: {Number(r.quantidade_contada).toFixed(2)}</span>
                          <span
                            className={`ml-2 font-semibold ${
                              Number(r.diferenca) >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                            }`}
                          >
                            ({Number(r.diferenca) >= 0 ? "+" : ""}
                            {Number(r.diferenca).toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm text-foreground">Revisão de Inventário</h3>
                <Button size="sm" onClick={saveReview} disabled={savingReview} className="gap-1.5">
                  {savingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salvar
                </Button>
              </div>
              <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {inventoryRows.map((row, idx) => (
                  <div key={row.insumo_nome} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{row.insumo_nome}</span>
                      <span className="text-xs text-muted-foreground">
                        Sistema: {row.qtdSistema.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Qtd Contada</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={row.qtdContada}
                          onChange={(e) => updateRow(idx, "qtdContada", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Obs.</Label>
                        <Input
                          placeholder="..."
                          value={row.observacao}
                          onChange={(e) => updateRow(idx, "observacao", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    {row.qtdContada !== "" && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Diferença: </span>
                        <span
                          className={`font-semibold ${
                            Number(row.qtdContada) - row.qtdSistema >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-destructive"
                          }`}
                        >
                          {Number(row.qtdContada) - row.qtdSistema >= 0 ? "+" : ""}
                          {(Number(row.qtdContada) - row.qtdSistema).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setInventoryRows([])} className="w-full">
                  Cancelar Revisão
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-destructive" />
              Ajuste de Estoque
            </DialogTitle>
            <DialogDescription>
              Registre uma produção para corrigir o saldo negativo de <strong>{adjustProduto?.nome}</strong>.
              Déficit atual: <strong className="text-destructive">{adjustProduto?.deficit} un</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Motivo do ajuste</Label>
              <Select value={adjustMotivo} onValueChange={setAdjustMotivo}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o motivo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perda">Perda</SelectItem>
                  <SelectItem value="roubo">Roubo</SelectItem>
                  <SelectItem value="erro_registro">Erro de registro</SelectItem>
                  <SelectItem value="doacao">Doação</SelectItem>
                  <SelectItem value="nao_identificado">Não identificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quantidade a ajustar</Label>
              <Input
                type="number"
                min="1"
                value={adjustQtd}
                onChange={(e) => setAdjustQtd(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Observação adicional (opcional)</Label>
              <Input
                value={adjustObs}
                onChange={(e) => setAdjustObs(e.target.value)}
                placeholder="Detalhes extras..."
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAdjustOpen(false)}>Cancelar</Button>
            <Button
              size="sm"
              disabled={savingAdjust || !adjustQtd || Number(adjustQtd) <= 0}
              onClick={handleAdjust}
            >
              {savingAdjust ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              Registrar Ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
