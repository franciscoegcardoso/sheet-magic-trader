import { useMemo, useState } from "react";
import { useReceitas } from "@/hooks/useReceitas";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";
import { useDespesasFixas } from "@/hooks/useDespesasFixas";
import { exportToCSV } from "@/lib/exportUtils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ChefHat,
  Loader2,
  Package,
  ShoppingCart,
  Receipt,
  Calendar,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  History,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.3)",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

export function ReportsPage() {
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { compras, custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { produtos, isLoading: loadingProdutos } = useProdutos();
  const { despesas, totalMensal, isLoading: loadingDespesas } = useDespesasFixas();

  const isLoading = loadingReceitas || loadingCompras || loadingVendas || loadingProdutos || loadingDespesas;

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split("T")[0]);

  const vendasFiltradas = useMemo(
    () => vendas.filter((v) => v.data_venda >= dataInicio && v.data_venda <= dataFim),
    [vendas, dataInicio, dataFim]
  );

  const receitasComCustoMedio = useMemo(() => {
    const custoMap = new Map(custoMedioPorInsumo.map((c) => [c.insumo_nome, c.custo_medio]));
    return receitas.map((r) => {
      const custoCalculado = (r.ingredientes || []).reduce((sum, ing) => {
        const custoMedio = custoMap.get(ing.insumo_nome) || ing.custo_unitario || 0;
        return sum + ing.quantidade * custoMedio;
      }, 0);
      return { ...r, custo_calculado: custoCalculado };
    });
  }, [receitas, custoMedioPorInsumo]);

  // Daily sales
  const vendasDiarias = useMemo(() => {
    const map = new Map<string, { date: string; valor: number; qtd: number }>();
    vendasFiltradas.forEach((v) => {
      const existing = map.get(v.data_venda) || { date: v.data_venda, valor: 0, qtd: 0 };
      existing.valor += Number(v.valor_venda);
      existing.qtd += 1;
      map.set(v.data_venda, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        label: new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      }));
  }, [vendasFiltradas]);

  // Products sold
  const produtosVendidos = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; valor: number }>();
    vendasFiltradas.forEach((v) => {
      const existing = map.get(v.produto) || { nome: v.produto, qtd: 0, valor: 0 };
      existing.qtd += 1;
      existing.valor += Number(v.valor_venda);
      map.set(v.produto, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.valor - a.valor);
  }, [vendasFiltradas]);

  // Margin by product
  const margemPorProduto = useMemo(() => {
    return produtos.map((p) => {
      const receita = receitasComCustoMedio.find((r) => r.id === p.receita_id);
      const custoPorUn = receita
        ? receita.rendimento && receita.rendimento > 0
          ? receita.custo_calculado / receita.rendimento
          : receita.custo_calculado
        : 0;

      const variacoes = p.variacoes || [];
      const precoVenda = variacoes.length > 0
        ? variacoes.reduce((s, v) => s + Number(v.preco_venda), 0) / variacoes.length
        : Number(p.preco_venda);

      const vendasP = vendasFiltradas.filter(
        (v) => v.produto.toLowerCase().includes(p.nome.toLowerCase()) || p.nome.toLowerCase().includes(v.produto.toLowerCase())
      );
      const qtdVendas = vendasP.length;
      const totalVendido = vendasP.reduce((s, v) => s + Number(v.valor_venda), 0);
      const margemUnitaria = precoVenda - custoPorUn;
      const margemTotal = margemUnitaria * qtdVendas;
      const margemPercent = precoVenda > 0 ? (margemUnitaria / precoVenda) * 100 : 0;

      return { ...p, receita, custoPorUn, precoVenda, margemUnitaria, margemTotal, margemPercent, qtdVendas, totalVendido };
    }).sort((a, b) => b.margemTotal - a.margemTotal);
  }, [produtos, receitasComCustoMedio, vendasFiltradas]);

  // Stats
  const stats = useMemo(() => {
    const totalVendas = vendasFiltradas.reduce((s, v) => s + Number(v.valor_venda), 0);
    const qtdVendas = vendasFiltradas.length;
    const custoEstimado = vendasFiltradas.reduce((s, v) => {
      const prod = produtos.find(
        (p) => v.produto.toLowerCase().includes(p.nome.toLowerCase()) || p.nome.toLowerCase().includes(v.produto.toLowerCase())
      );
      if (!prod) return s;
      const receita = receitasComCustoMedio.find((r) => r.id === prod.receita_id);
      if (!receita) return s;
      const custoPorUn = receita.rendimento && receita.rendimento > 0
        ? receita.custo_calculado / receita.rendimento
        : receita.custo_calculado;
      return s + custoPorUn;
    }, 0);
    const lucro = totalVendas - custoEstimado;

    // Stock cost estimate
    const custoEstoque = custoMedioPorInsumo.reduce((s, c) => s + c.total_gasto, 0);

    return { totalVendas, qtdVendas, lucro, custoEstimado, custoEstoque };
  }, [vendasFiltradas, produtos, receitasComCustoMedio, custoMedioPorInsumo]);

  // Expense pie data
  const despesasPieData = useMemo(() => {
    return despesas
      .filter((d) => d.ativo)
      .map((d) => ({ name: d.categoria, value: Number(d.valor) }))
      .sort((a, b) => b.value - a.value);
  }, [despesas]);

  // Payment methods breakdown
  const pagamentosBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    vendasFiltradas.forEach((v) => {
      const key = v.forma_pagamento || "Não informado";
      map.set(key, (map.get(key) || 0) + Number(v.valor_venda));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [vendasFiltradas]);

  // Export functions
  const exportVendas = () => {
    exportToCSV(
      vendasFiltradas.map((v) => ({
        data: v.data_venda,
        produto: v.produto,
        cliente: v.cliente,
        valor: Number(v.valor_venda).toFixed(2),
        pagamento: v.forma_pagamento || "",
        tamanho: v.tamanho || "",
        frete: Number(v.valor_frete || 0).toFixed(2),
      })),
      `vendas_${dataInicio}_${dataFim}`,
      [
        { key: "data", label: "Data" },
        { key: "produto", label: "Produto" },
        { key: "cliente", label: "Cliente" },
        { key: "valor", label: "Valor (R$)" },
        { key: "pagamento", label: "Pagamento" },
        { key: "tamanho", label: "Tamanho" },
        { key: "frete", label: "Frete (R$)" },
      ]
    );
  };

  const exportMargem = () => {
    exportToCSV(
      margemPorProduto.map((p) => ({
        produto: p.nome,
        custo: p.custoPorUn.toFixed(2),
        preco: p.precoVenda.toFixed(2),
        margem_un: p.margemUnitaria.toFixed(2),
        margem_pct: p.margemPercent.toFixed(1),
        qtd_vendas: p.qtdVendas,
        lucro_total: p.margemTotal.toFixed(2),
      })),
      `margem_produtos_${dataInicio}_${dataFim}`,
      [
        { key: "produto", label: "Produto" },
        { key: "custo", label: "Custo (R$)" },
        { key: "preco", label: "Preço (R$)" },
        { key: "margem_un", label: "Margem/un (R$)" },
        { key: "margem_pct", label: "Margem (%)" },
        { key: "qtd_vendas", label: "Qtd Vendas" },
        { key: "lucro_total", label: "Lucro Total (R$)" },
      ]
    );
  };

  const exportCustos = () => {
    exportToCSV(
      custoMedioPorInsumo.map((c) => ({
        insumo: c.insumo_nome,
        custo_medio: c.custo_medio.toFixed(2),
        total_gasto: c.total_gasto.toFixed(2),
        num_compras: c.num_compras,
      })),
      `custos_insumos`,
      [
        { key: "insumo", label: "Insumo" },
        { key: "custo_medio", label: "Custo Médio (R$)" },
        { key: "total_gasto", label: "Total Gasto (R$)" },
        { key: "num_compras", label: "Nº Compras" },
      ]
    );
  };

  const exportDespesas = () => {
    exportToCSV(
      despesas.filter((d) => d.ativo).map((d) => ({
        categoria: d.categoria,
        descricao: d.descricao || "",
        valor: Number(d.valor).toFixed(2),
      })),
      `despesas_fixas`,
      [
        { key: "categoria", label: "Categoria" },
        { key: "descricao", label: "Descrição" },
        { key: "valor", label: "Valor (R$)" },
      ]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const lucroPeriodo = stats.totalVendas - stats.custoEstimado - totalMensal;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-accent">
          <BarChart3 className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Resultados do Negócio</h2>
          <p className="text-sm text-muted-foreground">Veja como está indo seu negócio</p>
        </div>
      </div>

      {/* Date filter */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 inline mr-0.5" /> De
          </Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-9" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 inline mr-0.5" /> Até
          </Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-9" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Receipt} label="Quanto faturei" value={`R$ ${stats.totalVendas.toFixed(2)}`} accent />
        <StatCard icon={ShoppingCart} label="Nº de vendas" value={String(stats.qtdVendas)} />
        <StatCard icon={DollarSign} label="Custo dos produtos" value={`R$ ${stats.custoEstimado.toFixed(2)}`} />
        <StatCard icon={Wallet} label="Gastos fixos" value={`R$ ${totalMensal.toFixed(2)}`} />
        <StatCard icon={Package} label="Gasto com estoque" value={`R$ ${stats.custoEstoque.toFixed(2)}`} />
        <StatCard
          icon={TrendingUp}
          label="Quanto sobrou"
          value={`R$ ${lucroPeriodo.toFixed(2)}`}
          accent={lucroPeriodo >= 0}
          negative={lucroPeriodo < 0}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="vendas" className="text-[10px] sm:text-xs">Vendas</TabsTrigger>
          <TabsTrigger value="margem" className="text-[10px] sm:text-xs">Lucro</TabsTrigger>
          <TabsTrigger value="custos" className="text-[10px] sm:text-xs">Ingredientes</TabsTrigger>
          <TabsTrigger value="despesas" className="text-[10px] sm:text-xs">Gastos Fixos</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="vendas" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportVendas} disabled={vendasFiltradas.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>
          <ReportCard title="Vendas Diárias">
            {vendasDiarias.length === 0 ? (
              <EmptyState text="Nenhuma venda no período selecionado" />
            ) : (
              <div className="px-2 pt-4 pb-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={vendasDiarias}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(value: number, name: string) => [
                        name === "valor" ? `R$ ${value.toFixed(2)}` : value,
                        name === "valor" ? "Valor" : "Qtd",
                      ]}
                    />
                    <Legend formatter={(v) => (v === "valor" ? "Valor (R$)" : "Quantidade")} />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="qtd" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportCard>

          <ReportCard title="Por Forma de Pagamento">
            {pagamentosBreakdown.length === 0 ? (
              <EmptyState text="Nenhuma venda registrada" />
            ) : (
              <div className="divide-y divide-border">
                {pagamentosBreakdown.map((p) => (
                  <div key={p.name} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-sm font-semibold text-foreground">R$ {p.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>

          <ReportCard title="Produtos Vendidos">
            {produtosVendidos.length === 0 ? (
              <EmptyState text="Nenhum produto vendido no período" />
            ) : (
              <div className="divide-y divide-border">
                {produtosVendidos.map((p) => (
                  <div key={p.nome} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">{p.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">{p.qtd} un</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">R$ {p.valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* Margin Tab */}
        <TabsContent value="margem">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={exportMargem} disabled={margemPorProduto.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>
          <ReportCard title="Lucro por Produto">
            {margemPorProduto.length === 0 ? (
              <EmptyState text="Cadastre produtos com receita vinculada" />
            ) : (
              <div className="divide-y divide-border">
                {margemPorProduto.map((p) => (
                  <div key={p.id} className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{p.nome}</span>
                        {p.receita && (
                          <span className="text-[10px] text-primary">
                            <ChefHat className="w-3 h-3 inline" /> {p.receita.nome}
                          </span>
                        )}
                      </div>
                      {p.precoVenda > 0 && p.custoPorUn > 0 && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            p.margemPercent >= 30
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : p.margemPercent >= 0
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {p.margemPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Custo</span>
                        <div className="font-medium text-foreground">{p.custoPorUn > 0 ? `R$ ${p.custoPorUn.toFixed(2)}` : "—"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço</span>
                        <div className="font-medium text-foreground">{p.precoVenda > 0 ? `R$ ${p.precoVenda.toFixed(2)}` : "—"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margem/un</span>
                        <div className={`font-medium ${p.margemUnitaria >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          R$ {p.margemUnitaria.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lucro Total</span>
                        <div className={`font-medium ${p.margemTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {p.qtdVendas > 0 ? `R$ ${p.margemTotal.toFixed(2)}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="custos" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportCustos} disabled={custoMedioPorInsumo.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>
          <ReportCard title="Custo de Produção por Receita">
            {receitasComCustoMedio.length === 0 ? (
              <EmptyState text="Cadastre receitas e registre compras" />
            ) : (
              <div className="divide-y divide-border">
                {receitasComCustoMedio.map((r) => {
                  const custoPorUn = r.rendimento && r.rendimento > 0 ? r.custo_calculado / r.rendimento : r.custo_calculado;
                  return (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{r.nome}</span>
                        <span className="text-sm font-semibold text-foreground">R$ {r.custo_calculado.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{r.ingredientes?.length || 0} ingredientes</span>
                        <span className="text-xs text-primary">R$ {custoPorUn.toFixed(2)} / {r.unidade_rendimento}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ReportCard>

          <ReportCard title="Custo Médio por Ingrediente">
            {custoMedioPorInsumo.length === 0 ? (
              <EmptyState text="Registre compras para ver o custo médio" />
            ) : (
              <div className="divide-y divide-border">
                {custoMedioPorInsumo.map((c) => (
                  <div key={c.insumo_nome} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">{c.insumo_nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">({c.num_compras} compra{c.num_compras > 1 ? "s" : ""})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">R$ {c.custo_medio.toFixed(2)} / un</div>
                      <div className="text-xs text-muted-foreground">Total: R$ {c.total_gasto.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="despesas" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportDespesas} disabled={despesas.filter(d => d.ativo).length === 0}>
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>
          <ReportCard title="Despesas Fixas Mensais">
            {despesasPieData.length === 0 ? (
              <EmptyState text="Cadastre despesas fixas para ver o relatório" />
            ) : (
              <>
                <div className="px-2 pt-4 pb-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={despesasPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                        fontSize={10}
                      >
                        {despesasPieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Mensal</span>
                  <span className="text-sm font-bold text-primary">R$ {totalMensal.toFixed(2)}</span>
                </div>
                <div className="divide-y divide-border">
                  {despesas.filter((d) => d.ativo).map((d) => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">{d.categoria}</span>
                        {d.descricao && <span className="text-xs text-muted-foreground ml-2">{d.descricao}</span>}
                      </div>
                      <span className="text-sm font-semibold text-foreground">R$ {Number(d.valor).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ReportCard>

          {/* Resultado geral */}
          <ReportCard title="Resultado do Período">
            <div className="px-4 py-3 space-y-3">
              <ResultRow label="Faturamento" value={stats.totalVendas} positive />
              <ResultRow label="(-) Custo de Produção" value={stats.custoEstimado} />
              <ResultRow label="(-) Despesas Fixas" value={totalMensal} />
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Resultado Líquido</span>
                  <div className="flex items-center gap-1">
                    {lucroPeriodo >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-base font-bold ${lucroPeriodo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      R$ {lucroPeriodo.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, negative }: { icon: any; label: string; value: string; accent?: boolean; negative?: boolean }) {
  return (
    <div className="p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : negative ? "text-destructive" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-display font-bold ${accent ? "text-primary" : negative ? "text-destructive" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

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

function ResultRow({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${positive ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
        R$ {value.toFixed(2)}
      </span>
    </div>
  );
}
