import { useMemo } from "react";
import { useVendas } from "@/hooks/useVendas";
import { useCompras } from "@/hooks/useCompras";
import { useDespesasFixas } from "@/hooks/useDespesasFixas";
import { useClientesDB } from "@/hooks/useClientesDB";
import { usePedidos } from "@/hooks/usePedidos";
import {
  BarChart3, TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign,
  Package, ArrowUp, ArrowDown, Loader2,
} from "lucide-react";

export function DashboardPage() {
  const { vendas, isLoading: loadingVendas } = useVendas();
  const { compras } = useCompras();
  const { despesas } = useDespesasFixas();
  const { clientes } = useClientesDB();
  const { pedidos } = usePedidos();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const metrics = useMemo(() => {
    const vendasMes = vendas.filter(v => {
      const d = new Date(v.data_venda + "T00:00:00");
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const vendasMesAnterior = vendas.filter(v => {
      const d = new Date(v.data_venda + "T00:00:00");
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    // MTD: same day range in previous month
    const dayOfMonth = now.getDate();
    const vendasMTDAnterior = vendasMesAnterior.filter(v => {
      const d = new Date(v.data_venda + "T00:00:00");
      return d.getDate() <= dayOfMonth;
    });

    const faturamentoMes = vendasMes.reduce((s, v) => s + Number(v.valor_venda), 0);
    const faturamentoAnterior = vendasMesAnterior.reduce((s, v) => s + Number(v.valor_venda), 0);
    const faturamentoMTDAnterior = vendasMTDAnterior.reduce((s, v) => s + Number(v.valor_venda), 0);
    const ticketMedio = vendasMes.length > 0 ? faturamentoMes / vendasMes.length : 0;
    const ticketAnterior = vendasMesAnterior.length > 0 ? faturamentoAnterior / vendasMesAnterior.length : 0;
    const ticketMTDAnterior = vendasMTDAnterior.length > 0 ? faturamentoMTDAnterior / vendasMTDAnterior.length : 0;

    const comprasMes = compras.filter(c => {
      const d = new Date(c.data_compra + "T00:00:00");
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const custosMes = comprasMes.reduce((s, c) => s + Number(c.valor_compra), 0);
    const despesasMes = despesas.filter(d => d.ativo).reduce((s, d) => s + Number(d.valor), 0);
    const cmvPct = faturamentoMes > 0 ? ((custosMes + despesasMes) / faturamentoMes) * 100 : 0;
    const lucroMes = faturamentoMes - custosMes - despesasMes;
    const margemLucro = faturamentoMes > 0 ? (lucroMes / faturamentoMes) * 100 : 0;

    // Previous month lucro
    const comprasAnterior = compras.filter(c => {
      const d = new Date(c.data_compra + "T00:00:00");
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    const custosAnterior = comprasAnterior.reduce((s, c) => s + Number(c.valor_compra), 0);
    const lucroAnterior = faturamentoAnterior - custosAnterior - despesasMes;

    const pedidosPendentes = pedidos.filter(p => p.status !== "entregue" && p.status !== "cancelado").length;

    // Top products
    const produtoMap: Record<string, { qtd: number; valor: number }> = {};
    vendasMes.forEach(v => {
      if (!produtoMap[v.produto]) produtoMap[v.produto] = { qtd: 0, valor: 0 };
      produtoMap[v.produto].qtd++;
      produtoMap[v.produto].valor += Number(v.valor_venda);
    });
    const topProdutos = Object.entries(produtoMap).sort((a, b) => b[1].valor - a[1].valor).slice(0, 5);

    // Daily revenue for chart (last 30 days)
    const dailyRevenue: { date: string; valor: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTotal = vendas
        .filter(v => v.data_venda === dateStr)
        .reduce((s, v) => s + Number(v.valor_venda), 0);
      dailyRevenue.push({ date: dateStr, valor: dayTotal });
    }
    const maxRevenue = Math.max(...dailyRevenue.map(d => d.valor), 1);

    return {
      faturamentoMes, faturamentoAnterior, faturamentoMTDAnterior,
      ticketMedio, ticketAnterior, ticketMTDAnterior,
      vendasMes: vendasMes.length, vendasAnterior: vendasMesAnterior.length,
      vendasMTDAnterior: vendasMTDAnterior.length,
      custosMes, despesasMes, lucroMes, lucroAnterior,
      cmvPct, margemLucro, pedidosPendentes,
      totalClientes: clientes.length, topProdutos, dailyRevenue, maxRevenue,
    };
  }, [vendas, compras, despesas, clientes, pedidos, currentMonth, currentYear]);

  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loadingVendas) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const faturamentoPct = pctChange(metrics.faturamentoMes, metrics.faturamentoAnterior);
  const vendasPct = pctChange(metrics.vendasMes, metrics.vendasAnterior);
  const ticketPct = pctChange(metrics.ticketMedio, metrics.ticketAnterior);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-accent"><BarChart3 className="w-5 h-5 text-accent-foreground" /></div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Faturamento" value={`R$ ${metrics.faturamentoMes.toFixed(2)}`} change={faturamentoPct} icon={DollarSign} />
        <KPICard title="Vendas" value={String(metrics.vendasMes)} change={vendasPct} icon={ShoppingBag} />
        <KPICard title="Ticket Médio" value={`R$ ${metrics.ticketMedio.toFixed(2)}`} change={ticketPct} icon={TrendingUp} />
        <KPICard title="Lucro Estimado" value={`R$ ${metrics.lucroMes.toFixed(2)}`} positive={metrics.lucroMes >= 0} icon={metrics.lucroMes >= 0 ? TrendingUp : TrendingDown} />
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{metrics.totalClientes}</div>
          <div className="text-[10px] text-muted-foreground">Clientes</div>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <Package className="w-4 h-4 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{metrics.pedidosPendentes}</div>
          <div className="text-[10px] text-muted-foreground">Pedidos Ativos</div>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <DollarSign className="w-4 h-4 text-destructive mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">R$ {(metrics.custosMes + metrics.despesasMes).toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground">Custos Totais</div>
        </div>
      </div>

      {/* Revenue Chart (CSS bars) */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Faturamento Diário (30 dias)</h3>
        <div className="flex items-end gap-[2px] h-32">
          {metrics.dailyRevenue.map((d, i) => {
            const height = metrics.maxRevenue > 0 ? (d.valor / metrics.maxRevenue) * 100 : 0;
            const isToday = i === metrics.dailyRevenue.length - 1;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {new Date(d.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · R$ {d.valor.toFixed(0)}
                </div>
                <div
                  className={`w-full rounded-t-sm transition-all ${isToday ? "bg-primary" : "bg-primary/40 hover:bg-primary/70"}`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>{new Date(metrics.dailyRevenue[0]?.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* Top Products */}
      {metrics.topProdutos.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top Produtos do Mês</h3>
          <div className="space-y-2">
            {metrics.topProdutos.map(([nome, data], i) => {
              const pct = metrics.faturamentoMes > 0 ? (data.valor / metrics.faturamentoMes) * 100 : 0;
              return (
                <div key={nome} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground truncate">{nome}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{data.qtd}x · R$ {data.valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                      <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, change, positive, icon: Icon }: {
  title: string; value: string; change?: number; positive?: boolean; icon: any;
}) {
  const isPositive = positive ?? (change !== undefined && change >= 0);
  return (
    <div className="p-3.5 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted-foreground">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${isPositive ? "text-emerald-600" : "text-destructive"}`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(1)}% vs mês anterior
        </div>
      )}
    </div>
  );
}
