import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePedidos, Pedido } from "@/hooks/usePedidos";
import { useClientesDB } from "@/hooks/useClientesDB";
import { useProdutos } from "@/hooks/useProdutos";
import {
  CalendarDays, Plus, Loader2, Trash2, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, Package, Truck, XCircle, Filter,
} from "lucide-react";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20", icon: Clock },
  em_producao: { label: "Em Produção", color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: Package },
  pronto: { label: "Pronto", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  entregue: { label: "Entregue", color: "bg-primary/15 text-primary border-primary/20", icon: Truck },
  cancelado: { label: "Cancelado", color: "bg-destructive/15 text-destructive border-destructive/20", icon: XCircle },
};

const STATUS_ORDER: Pedido["status"][] = ["pendente", "em_producao", "pronto", "entregue", "cancelado"];

export function PedidosPage() {
  const { toast } = useToast();
  const { pedidos, isLoading, addPedido, updatePedido, deletePedido } = usePedidos();
  const { clientes } = useClientesDB();
  const { produtos } = useProdutos();

  const [showForm, setShowForm] = useState(false);
  const [clienteNome, setClienteNome] = useState("");
  const [produto, setProduto] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [valor, setValor] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Pedido["status"] | "todos">("todos");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const resetForm = () => {
    setClienteNome(""); setProduto(""); setQuantidade("1"); setValor("");
    setDataEntrega(""); setObservacoes(""); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome.trim() || !produto.trim() || !dataEntrega) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      const cliente = clientes.find(c => c.nome.toLowerCase() === clienteNome.toLowerCase());
      await addPedido({
        cliente_id: cliente?.id || null,
        cliente_nome: clienteNome,
        produto,
        descricao: null,
        quantidade: Number(quantidade) || 1,
        valor: Number(valor) || 0,
        data_pedido: new Date().toISOString().split("T")[0],
        data_entrega: dataEntrega,
        status: "pendente",
        observacoes: observacoes || null,
      });
      toast({ title: "Pedido criado!" });
      resetForm();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: Pedido["status"]) => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex < 3) {
      const nextStatus = STATUS_ORDER[currentIndex + 1];
      await updatePedido(id, { status: nextStatus });
      toast({ title: `Status: ${STATUS_CONFIG[nextStatus].label}` });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este pedido?")) return;
    await deletePedido(id);
    toast({ title: "Pedido excluído" });
  };

  const filtered = useMemo(() => {
    return pedidos.filter(p => statusFilter === "todos" || p.status === statusFilter);
  }, [pedidos, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { pendente: 0, em_producao: 0, pronto: 0, entregue: 0, cancelado: 0 };
    pedidos.forEach(p => counts[p.status]++);
    return counts;
  }, [pedidos]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarMonth]);

  const getPedidosForDay = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filtered.filter(p => p.data_entrega === dateStr);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent"><CalendarDays className="w-5 h-5 text-accent-foreground" /></div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Agenda de Pedidos</h2>
            <p className="text-sm text-muted-foreground">Gerencie encomendas e entregas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}>
            {viewMode === "list" ? <CalendarDays className="w-4 h-4" /> : <Package className="w-4 h-4" />}
          </Button>
          {!showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Novo</Button>}
        </div>
      </div>

      {/* Status cards */}
      {pedidos.length > 0 && !showForm && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(Object.entries(STATUS_CONFIG) as [Pedido["status"], typeof STATUS_CONFIG.pendente][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = statusFilter === key;
            return (
              <button key={key} onClick={() => setStatusFilter(isActive ? "todos" : key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left ${isActive ? cfg.color + " border-current shadow-sm" : "bg-card border-border hover:border-muted-foreground/30"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-lg font-bold leading-none">{statusCounts[key]}</div>
                  <div className="text-[10px] leading-tight mt-0.5 opacity-80">{cfg.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Cliente *</Label>
              <Input list="clientes-list" value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
              <datalist id="clientes-list">{clientes.map(c => <option key={c.id} value={c.nome} />)}</datalist>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Produto *</Label>
              <Input list="produtos-list" value={produto} onChange={e => setProduto(e.target.value)} placeholder="Produto" />
              <datalist id="produtos-list">{produtos.map(p => <option key={p.id} value={p.nome} />)}</datalist>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Quantidade</Label>
              <Input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
              <Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data Entrega *</Label>
              <Input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Input value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes do pedido..." />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Pedido"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && !showForm && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground capitalize">
              {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
              <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dayPedidos = getPedidosForDay(day);
              const today = new Date();
              const isToday = day === today.getDate() && calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear();
              return (
                <div key={day} className={`min-h-[60px] p-1 rounded-lg border text-left ${isToday ? "border-primary bg-primary/5" : "border-transparent hover:border-border"}`}>
                  <div className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</div>
                  {dayPedidos.slice(0, 2).map(p => {
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <div key={p.id} className={`text-[9px] px-1 py-0.5 rounded mt-0.5 truncate ${cfg.color}`}>
                        {p.cliente_nome}
                      </div>
                    );
                  })}
                  {dayPedidos.length > 2 && <div className="text-[9px] text-muted-foreground mt-0.5">+{dayPedidos.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && !showForm && (
        filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
            {pedidos.length === 0 ? 'Nenhum pedido cadastrado. Clique em "Novo" para começar.' : "Nenhum pedido com esse filtro."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => {
              const cfg = STATUS_CONFIG[p.status];
              const Icon = cfg.icon;
              const isOverdue = p.status !== "entregue" && p.status !== "cancelado" && new Date(p.data_entrega + "T23:59:59") < new Date();
              return (
                <div key={p.id} className={`bg-card border rounded-xl p-4 ${isOverdue ? "border-destructive/40" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{p.cliente_nome}</span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          <Icon className="w-2.5 h-2.5" />{cfg.label}
                        </span>
                        {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">Atrasado</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">{p.produto}</span>
                        {p.quantidade > 1 && <span> × {p.quantidade}</span>}
                        {p.valor > 0 && <span> · R$ {Number(p.valor).toFixed(2)}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                        <span>📅 Entrega: {new Date(p.data_entrega + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                        {p.observacoes && <span className="truncate">· {p.observacoes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.status !== "entregue" && p.status !== "cancelado" && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleStatusChange(p.id, p.status)}>
                          Avançar
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
