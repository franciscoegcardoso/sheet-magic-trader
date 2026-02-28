import { useMemo, useState } from "react";
import { useReceitas } from "@/hooks/useReceitas";
import { useCompras } from "@/hooks/useCompras";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "lucide-react";

export function AdminDashboard() {
  const { receitas, isLoading: loadingReceitas } = useReceitas();
  const { compras, custoMedioPorInsumo, isLoading: loadingCompras } = useCompras();
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { produtos, isLoading: loadingProdutos } = useProdutos();

  const isLoading = loadingReceitas || loadingCompras || loadingVendas || loadingProdutos;

  // Compute recipe cost using average purchase cost
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

  const stats = useMemo(() => {
    const totalReceitas = receitas.length;
    const totalCompras = compras.reduce((s, c) => s + Number(c.valor_compra), 0);
    const totalVendas = vendas.reduce((s, v) => s + Number(v.valor_venda), 0);
    const custoProducao = receitasComCustoMedio.reduce((s, r) => s + r.custo_calculado, 0);
    return { totalReceitas, totalCompras, totalVendas, custoProducao };
  }, [receitas, compras, vendas, receitasComCustoMedio]);

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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ChefHat} label="Receitas" value={String(stats.totalReceitas)} />
        <StatCard icon={ShoppingCart} label="Total Compras" value={`R$ ${stats.totalCompras.toFixed(2)}`} />
        <StatCard icon={Receipt} label="Total Vendas" value={`R$ ${stats.totalVendas.toFixed(2)}`} accent />
        <StatCard
          icon={TrendingUp}
          label="Resultado"
          value={`R$ ${(stats.totalVendas - stats.totalCompras).toFixed(2)}`}
          accent={stats.totalVendas - stats.totalCompras >= 0}
        />
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="compras" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="compras" className="text-xs">
            <ShoppingCart className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Compras
          </TabsTrigger>
          <TabsTrigger value="receitas" className="text-xs">
            <ChefHat className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="custos" className="text-xs">
            <DollarSign className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="consolidado" className="text-xs">
            <FileText className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
            Consolidado
          </TabsTrigger>
        </TabsList>

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

        {/* Recipe Report */}
        <TabsContent value="receitas">
          <ReportCard title="Receitas Cadastradas">
            {receitas.length === 0 ? (
              <EmptyState text="Cadastre receitas para ver o relatório" />
            ) : (
              <div className="divide-y divide-border">
                {receitas.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{r.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        Rend: {r.rendimento} {r.unidade_rendimento}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.ingredientes?.length || 0} ingredientes
                      {r.descricao && ` · ${r.descricao}`}
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

        {/* Consolidated Report */}
        <TabsContent value="consolidado">
          <ReportCard title="Produto · Receita · Custo · Margem">
            {produtos.length === 0 ? (
              <EmptyState text="Cadastre produtos para ver o consolidado" />
            ) : (
              <div className="divide-y divide-border">
                {produtos.map((p) => {
                  const receita = receitasComCustoMedio.find((r) => r.id === p.receita_id);
                  const custoPorUn = receita
                    ? receita.rendimento && receita.rendimento > 0
                      ? receita.custo_calculado / receita.rendimento
                      : receita.custo_calculado
                    : 0;
                  const precoVenda = Number(p.preco_venda);
                  const margem = precoVenda > 0 ? ((precoVenda - custoPorUn) / precoVenda) * 100 : 0;

                  // Count sales for this product
                  const vendasProduto = vendas.filter(
                    (v) => v.produto.toLowerCase().includes(p.nome.toLowerCase()) ||
                           p.nome.toLowerCase().includes(v.produto.toLowerCase())
                  );
                  const qtdVendas = vendasProduto.length;
                  const totalVendido = vendasProduto.reduce((s, v) => s + Number(v.valor_venda), 0);

                  return (
                    <div key={p.id} className="px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground">{p.nome}</span>
                          {p.tamanho && (
                            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground ml-2">{p.tamanho}</span>
                          )}
                        </div>
                        {precoVenda > 0 && custoPorUn > 0 && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              margem >= 30
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : margem >= 0
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {margem.toFixed(1)}% margem
                          </span>
                        )}
                      </div>
                      {receita && (
                        <div className="text-xs text-primary">
                          <ChefHat className="w-3 h-3 inline mr-0.5" />
                          {receita.nome}
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Custo</span>
                          <div className="font-medium text-foreground">
                            {custoPorUn > 0 ? `R$ ${custoPorUn.toFixed(2)}` : "—"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preço</span>
                          <div className="font-medium text-foreground">
                            {precoVenda > 0 ? `R$ ${precoVenda.toFixed(2)}` : "—"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vendas</span>
                          <div className="font-medium text-foreground">{qtdVendas}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Faturado</span>
                          <div className="font-medium text-foreground">
                            {totalVendido > 0 ? `R$ ${totalVendido.toFixed(2)}` : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
