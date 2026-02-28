import { useMemo, useState } from "react";
import { useReceitas } from "@/hooks/useReceitas";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  FileText,
  Calendar,
  Percent,
} from "lucide-react";

export function AdminDashboard() {
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { compras, custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { produtos, isLoading: loadingProdutos } = useProdutos();

  const isLoading = loadingReceitas || loadingCompras || loadingVendas || loadingProdutos;

  // Date filter
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

  // Recipe cost using avg purchase cost
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

  // Daily sales chart data
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

  // Products sold summary
  const produtosVendidos = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; valor: number }>();
    vendasFiltradas.forEach((v) => {
      const key = v.produto;
      const existing = map.get(key) || { nome: key, qtd: 0, valor: 0 };
      existing.qtd += 1;
      existing.valor += Number(v.valor_venda);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.valor - a.valor);
  }, [vendasFiltradas]);

  // Revenue by product (receita por produto)
  const receitaPorProduto = useMemo(() => {
    return produtos.map((p) => {
      const vendasP = vendasFiltradas.filter(
        (v) => v.produto.toLowerCase().includes(p.nome.toLowerCase()) || p.nome.toLowerCase().includes(v.produto.toLowerCase())
      );
      const totalVendido = vendasP.reduce((s, v) => s + Number(v.valor_venda), 0);
      const qtd = vendasP.length;
      return { ...p, totalVendido, qtdVendas: qtd };
    }).filter((p) => p.qtdVendas > 0).sort((a, b) => b.totalVendido - a.totalVendido);
  }, [produtos, vendasFiltradas]);

  // Margin by product (margem absoluta)
  const margemPorProduto = useMemo(() => {
    return produtos.map((p) => {
      const receita = receitasComCustoMedio.find((r) => r.id === p.receita_id);
      const custoPorUn = receita
        ? receita.rendimento && receita.rendimento > 0
          ? receita.custo_calculado / receita.rendimento
          : receita.custo_calculado
        : 0;

      // Get variations avg price or product base price
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

      return {
        ...p,
        receita,
        custoPorUn,
        precoVenda,
        margemUnitaria,
        margemTotal,
        margemPercent,
        qtdVendas,
        totalVendido,
      };
    }).sort((a, b) => b.margemTotal - a.margemTotal);
  }, [produtos, receitasComCustoMedio, vendasFiltradas]);

  const stats = useMemo(() => {
    const totalVendas = vendasFiltradas.reduce((s, v) => s + Number(v.valor_venda), 0);
    const qtdVendas = vendasFiltradas.length;
    // Estimate profit: total sold - estimated cost
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
    return { totalVendas, qtdVendas, lucro, custoEstimado };
  }, [vendasFiltradas, produtos, receitasComCustoMedio]);

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
          <BarChart3 className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Painel Administrativo</h2>
          <p className="text-sm text-muted-foreground">Relatórios e gestão financeira</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Receipt} label="Faturamento" value={`R$ ${stats.totalVendas.toFixed(2)}`} accent />
        <StatCard icon={ShoppingCart} label="Vendas" value={String(stats.qtdVendas)} />
        <StatCard icon={DollarSign} label="Custo Estimado" value={`R$ ${stats.custoEstimado.toFixed(2)}`} />
        <StatCard
          icon={TrendingUp}
          label="Lucro Estimado"
          value={`R$ ${stats.lucro.toFixed(2)}`}
          accent={stats.lucro >= 0}
        />
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="vendas" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="vendas" className="text-[10px] sm:text-xs">
            <Receipt className="w-3.5 h-3.5 mr-0.5 hidden sm:inline" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="receita-prod" className="text-[10px] sm:text-xs">
            <Package className="w-3.5 h-3.5 mr-0.5 hidden sm:inline" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="margem" className="text-[10px] sm:text-xs">
            <Percent className="w-3.5 h-3.5 mr-0.5 hidden sm:inline" />
            Margem
          </TabsTrigger>
          <TabsTrigger value="custos" className="text-[10px] sm:text-xs">
            <DollarSign className="w-3.5 h-3.5 mr-0.5 hidden sm:inline" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="compras" className="text-[10px] sm:text-xs">
            <ShoppingCart className="w-3.5 h-3.5 mr-0.5 hidden sm:inline" />
            Compras
          </TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="vendas" className="space-y-4">
          {/* Daily chart */}
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

          {/* Products sold */}
          <ReportCard title="Produtos Vendidos no Período">
            {produtosVendidos.length === 0 ? (
              <EmptyState text="Nenhum produto vendido no período" />
            ) : (
              <div className="divide-y divide-border">
                {produtosVendidos.map((p) => (
                  <div key={p.nome} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">{p.nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {p.qtd} un
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      R$ {p.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* Revenue by Product */}
        <TabsContent value="receita-prod">
          <ReportCard title="Receita (Faturamento) por Produto">
            {receitaPorProduto.length === 0 ? (
              <EmptyState text="Cadastre produtos e registre vendas para ver a receita" />
            ) : (
              <>
                <div className="px-2 pt-4 pb-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={receitaPorProduto.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                      <YAxis dataKey="nome" type="category" tick={{ fontSize: 10 }} width={100} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Faturamento"]}
                      />
                      <Bar dataKey="totalVendido" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="divide-y divide-border">
                  {receitaPorProduto.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">{p.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.qtdVendas} vendas</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">R$ {p.totalVendido.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ReportCard>
        </TabsContent>

        {/* Margin Report */}
        <TabsContent value="margem">
          <ReportCard title="Margem Absoluta por Produto">
            {margemPorProduto.length === 0 ? (
              <EmptyState text="Cadastre produtos com receita vinculada para ver margens" />
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
                        <div className="font-medium text-foreground">
                          {p.custoPorUn > 0 ? `R$ ${p.custoPorUn.toFixed(2)}` : "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preço</span>
                        <div className="font-medium text-foreground">
                          {p.precoVenda > 0 ? `R$ ${p.precoVenda.toFixed(2)}` : "—"}
                        </div>
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

        {/* Cost Report */}
        <TabsContent value="custos">
          <ReportCard title="Custo de Produção por Receita">
            {receitasComCustoMedio.length === 0 ? (
              <EmptyState text="Cadastre receitas e registre compras para calcular custos" />
            ) : (
              <div className="divide-y divide-border">
                {receitasComCustoMedio.map((r) => {
                  const custoPorUn =
                    r.rendimento && r.rendimento > 0 ? r.custo_calculado / r.rendimento : r.custo_calculado;
                  return (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{r.nome}</span>
                        <span className="text-sm font-semibold text-foreground">
                          R$ {r.custo_calculado.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {r.ingredientes?.length || 0} ingredientes
                        </span>
                        <span className="text-xs text-primary">
                          R$ {custoPorUn.toFixed(2)} / {r.unidade_rendimento}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ReportCard>
        </TabsContent>

        {/* Purchase Report */}
        <TabsContent value="compras">
          <ReportCard title="Custo Médio por Ingrediente">
            {custoMedioPorInsumo.length === 0 ? (
              <EmptyState text="Registre compras para ver o custo médio" />
            ) : (
              <div className="divide-y divide-border">
                {custoMedioPorInsumo.map((c) => (
                  <div key={c.insumo_nome} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">{c.insumo_nome}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({c.num_compras} compra{c.num_compras > 1 ? "s" : ""})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">
                        R$ {c.custo_medio.toFixed(2)} / un
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total: R$ {c.total_gasto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-display font-bold ${accent ? "text-primary" : "text-foreground"}`}>
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
