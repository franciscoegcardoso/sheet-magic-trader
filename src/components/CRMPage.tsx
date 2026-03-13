import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useClientesDB, ClienteDB } from "@/hooks/useClientesDB";
import { useVendas } from "@/hooks/useVendas";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  User,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";

type ClienteCategory = "frequente" | "regular" | "novo" | "churn" | "todos";

const categoryConfig: Record<Exclude<ClienteCategory, "todos">, { label: string; color: string; icon: typeof Star }> = {
  frequente: { label: "Frequente", color: "bg-primary/15 text-primary border-primary/20", icon: Star },
  regular: { label: "Regular", color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: TrendingUp },
  novo: { label: "Novo", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: Clock },
  churn: { label: "Possível Churn", color: "bg-destructive/15 text-destructive border-destructive/20", icon: AlertTriangle },
};

function categorizeClient(
  vendasCount: number,
  lastPurchaseDate: string | null,
  firstPurchaseDate: string | null
): Exclude<ClienteCategory, "todos"> {
  const now = new Date();
  const daysSinceLast = lastPurchaseDate
    ? Math.floor((now.getTime() - new Date(lastPurchaseDate + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  const daysSinceFirst = firstPurchaseDate
    ? Math.floor((now.getTime() - new Date(firstPurchaseDate + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (vendasCount === 0) return "novo";
  if (vendasCount >= 1 && daysSinceFirst <= 30) return "novo";
  if (daysSinceLast > 60) return "churn";
  if (vendasCount >= 5) return "frequente";
  return "regular";
}

export function CRMPage() {
  const { toast } = useToast();
  const { clientes, isLoading, addCliente, updateCliente, deleteCliente } = useClientesDB();
  const { vendas } = useVendas();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ClienteCategory>("todos");

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setObservacoes("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (c: ClienteDB) => {
    setNome(c.nome);
    setTelefone(c.telefone || "");
    setEmail(c.email || "");
    setObservacoes(c.observacoes || "");
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      const data = { nome, telefone: telefone || null, email: email || null, observacoes: observacoes || null, ativo: true };
      if (editingId) {
        await updateCliente(editingId, data);
        toast({ title: "Cliente atualizado!" });
      } else {
        await addCliente(data);
        toast({ title: "Cliente cadastrado!" });
      }
      resetForm();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"?`)) return;
    try {
      await deleteCliente(id);
      toast({ title: "Cliente excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const getVendasCliente = (clienteNome: string, clienteId: string) => {
    return vendas
      .filter((v) => v.cliente_id === clienteId || v.cliente.toLowerCase() === clienteNome.toLowerCase())
      .sort((a, b) => b.data_venda.localeCompare(a.data_venda));
  };

  // Compute client data with categories
  const clienteData = useMemo(() => {
    return clientes.map((c) => {
      const vendasCliente = getVendasCliente(c.nome, c.id);
      const totalGasto = vendasCliente.reduce((s, v) => s + Number(v.valor_venda), 0);
      const lastDate = vendasCliente.length > 0 ? vendasCliente[0].data_venda : null;
      const firstDate = vendasCliente.length > 0 ? vendasCliente[vendasCliente.length - 1].data_venda : null;
      const category = categorizeClient(vendasCliente.length, lastDate, firstDate);
      return { ...c, vendasCliente, totalGasto, lastDate, category };
    });
  }, [clientes, vendas]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { frequente: 0, regular: 0, novo: 0, churn: 0 };
    clienteData.forEach((c) => counts[c.category]++);
    return counts;
  }, [clienteData]);

  // Filter
  const filtered = clienteData.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefone && c.telefone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === "todos" || c.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent">
            <Users className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">CRM</h2>
            <p className="text-sm text-muted-foreground">Clientes e histórico de compras</p>
          </div>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
      </div>

      {/* Category summary cards */}
      {clientes.length > 0 && !showForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.entries(categoryConfig) as [Exclude<ClienteCategory, "todos">, typeof categoryConfig.frequente][]).map(
            ([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = categoryFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(isActive ? "todos" : key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                    isActive
                      ? cfg.color + " border-current shadow-sm"
                      : "bg-card border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-lg font-bold leading-none">{categoryCounts[key]}</div>
                    <div className="text-[10px] leading-tight mt-0.5 opacity-80">{cfg.label}</div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Search */}
      {!showForm && clientes.length > 0 && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {categoryFilter !== "todos" && (
            <Button variant="outline" size="sm" onClick={() => setCategoryFilter("todos")} className="shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1" /> Limpar
            </Button>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5 inline mr-0.5" /> Nome
            </Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5 inline mr-0.5" /> Telefone
              </Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 inline mr-0.5" /> Email
              </Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações (opcional)" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Salvar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Client list */}
      {filtered.length === 0 && !showForm ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
          {clientes.length === 0
            ? 'Nenhum cliente cadastrado. Clique em "Novo" para começar.'
            : "Nenhum cliente encontrado com esse filtro."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const isExpanded = expandedId === c.id;
            const catCfg = categoryConfig[c.category];
            const CatIcon = catCfg.icon;

            return (
              <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Client header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {c.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{c.nome}</span>
                      <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${catCfg.color}`}>
                        <CatIcon className="w-2.5 h-2.5" />
                        {catCfg.label}
                      </span>
                      {c.vendasCliente.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                          {c.vendasCliente.length} compra{c.vendasCliente.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      {c.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {c.telefone}
                          <a
                            href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                            title="Abrir no WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-0.5">
                          <Mail className="w-3 h-3" /> {c.email}
                        </span>
                      )}
                      {c.lastDate && (
                        <span className="flex items-center gap-0.5 hidden md:flex">
                          <Clock className="w-3 h-3" />
                          Última: {new Date(c.lastDate + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.totalGasto > 0 && (
                      <span className="text-xs font-semibold text-foreground">
                        R$ {c.totalGasto.toFixed(2)}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.nome); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Purchase history */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {c.observacoes && (
                      <div className="px-4 py-2 bg-secondary/20 text-xs text-muted-foreground">
                        {c.observacoes}
                      </div>
                    )}

                    {/* Churn alert */}
                    {c.category === "churn" && c.vendasCliente.length > 0 && (
                      <div className="px-4 py-2.5 bg-destructive/5 border-b border-destructive/10 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span className="text-xs text-destructive">
                          Sem compras há mais de 60 dias. Considere entrar em contato para reativar.
                        </span>
                        {c.telefone && (
                          <a
                            href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}?text=Ol%C3%A1%20${encodeURIComponent(c.nome)}%2C%20sentimos%20sua%20falta!%20Temos%20novidades%20para%20voc%C3%AA.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto shrink-0"
                          >
                            <Button variant="outline" size="sm" className="h-6 text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10">
                              <MessageCircle className="w-3 h-3 mr-1" /> Reativar
                            </Button>
                          </a>
                        )}
                      </div>
                    )}

                    {c.vendasCliente.length === 0 ? (
                      <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                        Nenhuma compra registrada
                      </div>
                    ) : (
                      <div>
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-4 py-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>Produto</span>
                          <span className="text-right">Data</span>
                          <span className="text-right">Pagamento</span>
                          <span className="text-right">Valor</span>
                        </div>
                        <div className="divide-y divide-border">
                          {c.vendasCliente.map((v) => (
                            <div key={v.id} className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center px-4 py-2.5">
                              <div>
                                <div className="text-xs font-medium text-foreground flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3 text-muted-foreground shrink-0" />
                                  <span className="truncate">{v.produto}</span>
                                  {v.tamanho && (
                                    <span className="text-[10px] bg-secondary px-1 py-0.5 rounded text-muted-foreground shrink-0">
                                      {v.tamanho}
                                    </span>
                                  )}
                                </div>
                                {v.embalagem && (
                                  <div className="text-[10px] text-muted-foreground ml-4">{v.embalagem}</div>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground text-right">
                                {new Date(v.data_venda + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </span>
                              <span className="text-[10px] text-muted-foreground text-right truncate">
                                {v.forma_pagamento || "—"}
                              </span>
                              <span className="text-xs font-semibold text-foreground text-right">
                                R$ {Number(v.valor_venda).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-4 py-2 bg-secondary/20">
                          <span className="text-xs font-medium text-muted-foreground">
                            {c.vendasCliente.length} compra{c.vendasCliente.length > 1 ? "s" : ""}
                          </span>
                          <span />
                          <span />
                          <span className="text-xs font-bold text-primary text-right">
                            R$ {c.totalGasto.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
