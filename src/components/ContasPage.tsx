import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useContas, Conta } from "@/hooks/useContas";
import {
  Wallet, Plus, Loader2, Trash2, ArrowDownCircle, ArrowUpCircle,
  CheckCircle2, AlertTriangle, Clock, Filter,
} from "lucide-react";

export function ContasPage() {
  const { toast } = useToast();
  const { contas, isLoading, addConta, updateConta, deleteConta } = useContas();

  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<Conta["tipo"]>("pagar");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoFilter, setTipoFilter] = useState<"todos" | "pagar" | "receber">("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "pendente" | "pago" | "atrasado">("todos");

  const resetForm = () => {
    setDescricao(""); setValor(""); setCategoria(""); setDataVencimento("");
    setObservacoes(""); setShowForm(false); setTipo("pagar");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !valor || !dataVencimento) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      await addConta({
        tipo,
        descricao,
        valor: Number(valor),
        categoria: categoria || null,
        data_vencimento: dataVencimento,
        data_pagamento: null,
        status: "pendente",
        observacoes: observacoes || null,
      });
      toast({ title: `Conta a ${tipo} cadastrada!` });
      resetForm();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePagar = async (id: string) => {
    await updateConta(id, { status: "pago", data_pagamento: new Date().toISOString().split("T")[0] });
    toast({ title: "Conta marcada como paga!" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta conta?")) return;
    await deleteConta(id);
    toast({ title: "Conta excluída" });
  };

  // Auto-mark overdue
  const contasProcessed = useMemo(() => {
    return contas.map(c => {
      if (c.status === "pendente" && new Date(c.data_vencimento + "T23:59:59") < new Date()) {
        return { ...c, status: "atrasado" as const };
      }
      return c;
    });
  }, [contas]);

  const filtered = contasProcessed.filter(c => {
    if (tipoFilter !== "todos" && c.tipo !== tipoFilter) return false;
    if (statusFilter !== "todos" && c.status !== statusFilter) return false;
    return true;
  });

  const summary = useMemo(() => {
    const aReceber = contasProcessed.filter(c => c.tipo === "receber" && c.status !== "pago").reduce((s, c) => s + Number(c.valor), 0);
    const aPagar = contasProcessed.filter(c => c.tipo === "pagar" && c.status !== "pago").reduce((s, c) => s + Number(c.valor), 0);
    const atrasadas = contasProcessed.filter(c => c.status === "atrasado").length;
    return { aReceber, aPagar, saldo: aReceber - aPagar, atrasadas };
  }, [contasProcessed]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent"><Wallet className="w-5 h-5 text-accent-foreground" /></div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Contas a Pagar e Receber</h2>
            <p className="text-sm text-muted-foreground">Controle o que entra e sai do seu caixa</p>
          </div>
        </div>
        {!showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> Nova</Button>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 text-emerald-600"><ArrowDownCircle className="w-4 h-4" /><span className="text-[10px] font-medium">Vou Receber</span></div>
          <div className="text-lg font-bold text-emerald-600 mt-1">R$ {summary.aReceber.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 text-destructive"><ArrowUpCircle className="w-4 h-4" /><span className="text-[10px] font-medium">Tenho que Pagar</span></div>
          <div className="text-lg font-bold text-destructive mt-1">R$ {summary.aPagar.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 text-primary"><Wallet className="w-4 h-4" /><span className="text-[10px] font-medium">Sobra/Falta</span></div>
          <div className={`text-lg font-bold mt-1 ${summary.saldo >= 0 ? "text-emerald-600" : "text-destructive"}`}>R$ {summary.saldo.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1.5 text-yellow-600"><AlertTriangle className="w-4 h-4" /><span className="text-[10px] font-medium">Atrasadas</span></div>
          <div className="text-lg font-bold text-yellow-600 mt-1">{summary.atrasadas}</div>
        </div>
      </div>

      {/* Filters */}
      {contas.length > 0 && !showForm && (
        <div className="flex gap-2 flex-wrap">
          {(["todos", "pagar", "receber"] as const).map(t => (
            <Button key={t} variant={tipoFilter === t ? "default" : "outline"} size="sm" className="h-7 text-[11px]" onClick={() => setTipoFilter(t)}>
              {t === "todos" ? "Todas" : t === "pagar" ? "A Pagar" : "A Receber"}
            </Button>
          ))}
          <span className="border-l border-border mx-1" />
          {(["todos", "pendente", "pago", "atrasado"] as const).map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" className="h-7 text-[11px]" onClick={() => setStatusFilter(s)}>
              {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <Button type="button" variant={tipo === "pagar" ? "default" : "outline"} size="sm" onClick={() => setTipo("pagar")} className="flex-1">
              <ArrowUpCircle className="w-4 h-4 mr-1" /> A Pagar
            </Button>
            <Button type="button" variant={tipo === "receber" ? "default" : "outline"} size="sm" onClick={() => setTipo("receber")} className="flex-1">
              <ArrowDownCircle className="w-4 h-4 mr-1" /> A Receber
            </Button>
          </div>
          <div><Label className="text-xs text-muted-foreground">Descrição *</Label>
            <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Fornecedor de farinha" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs text-muted-foreground">Valor (R$) *</Label>
              <Input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground">Categoria</Label>
              <Input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Insumos" /></div>
            <div><Label className="text-xs text-muted-foreground">Vencimento *</Label>
              <Input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} /></div>
          </div>
          <div><Label className="text-xs text-muted-foreground">Observações</Label>
            <Input value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Opcional..." /></div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {/* List */}
      {!showForm && (
        filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
            {contas.length === 0 ? 'Nenhuma conta cadastrada.' : "Nenhuma conta com esse filtro."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const isOverdue = c.status === "atrasado";
              return (
                <div key={c.id} className={`bg-card border rounded-xl p-3.5 flex items-center gap-3 ${isOverdue ? "border-destructive/40" : "border-border"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.tipo === "receber" ? "bg-emerald-500/15" : "bg-destructive/15"}`}>
                    {c.tipo === "receber" ? <ArrowDownCircle className="w-4 h-4 text-emerald-600" /> : <ArrowUpCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{c.descricao}</span>
                      {c.categoria && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{c.categoria}</span>}
                      {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">Atrasado</span>}
                      {c.status === "pago" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Vence: {new Date(c.data_vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                      {c.data_pagamento && ` · Pago: ${new Date(c.data_pagamento + "T00:00:00").toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${c.tipo === "receber" ? "text-emerald-600" : "text-destructive"}`}>
                      {c.tipo === "receber" ? "+" : "-"} R$ {Number(c.valor).toFixed(2)}
                    </span>
                    {c.status !== "pago" && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handlePagar(c.id)}>Pagar</Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
