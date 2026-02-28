import { useState } from "react";
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
  X,
  User,
  MessageCircle,
} from "lucide-react";

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
      const data = {
        nome,
        telefone: telefone || null,
        email: email || null,
        observacoes: observacoes || null,
        ativo: true,
      };
      if (editingId) {
        await updateCliente(editingId, data);
        toast({ title: "Cliente atualizado!" });
      } else {
        await addCliente(data);
        toast({ title: "Cliente cadastrado!" });
      }
      resetForm();
    } catch (err) {
      console.error(err);
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
      .filter(
        (v) =>
          v.cliente_id === clienteId ||
          v.cliente.toLowerCase() === clienteNome.toLowerCase()
      )
      .sort((a, b) => b.data_venda.localeCompare(a.data_venda));
  };

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefone && c.telefone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
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

      {/* Search */}
      {!showForm && clientes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
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
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Input
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações sobre o cliente (opcional)"
            />
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
            : "Nenhum cliente encontrado."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const vendasCliente = getVendasCliente(c.nome, c.id);
            const totalGasto = vendasCliente.reduce((s, v) => s + Number(v.valor_venda), 0);
            const isExpanded = expandedId === c.id;

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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{c.nome}</span>
                      {vendasCliente.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {vendasCliente.length} compra{vendasCliente.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {totalGasto > 0 && (
                      <span className="text-xs font-semibold text-foreground">
                        R$ {totalGasto.toFixed(2)}
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
                    {vendasCliente.length === 0 ? (
                      <div className="px-4 py-4 text-center text-xs text-muted-foreground">
                        Nenhuma compra registrada
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {vendasCliente.map((v) => (
                          <div key={v.id} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                              <div className="text-xs font-medium text-foreground flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                                {v.produto}
                                {v.tamanho && (
                                  <span className="text-[10px] bg-secondary px-1 py-0.5 rounded text-muted-foreground">
                                    {v.tamanho}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(v.data_venda + "T00:00:00").toLocaleDateString("pt-BR")}
                                {v.forma_pagamento && ` · ${v.forma_pagamento}`}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              R$ {Number(v.valor_venda).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-4 py-2 bg-secondary/20">
                          <span className="text-xs font-medium text-muted-foreground">Total</span>
                          <span className="text-xs font-bold text-primary">
                            R$ {totalGasto.toFixed(2)}
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
