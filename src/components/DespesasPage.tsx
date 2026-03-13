import { useState } from "react";
import { useDespesasFixas, CATEGORIAS_PADRAO } from "@/hooks/useDespesasFixas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";

export function DespesasPage() {
  const { despesas, isLoading, addDespesa, updateDespesa, deleteDespesa, totalMensal } = useDespesasFixas();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [categoriaCustom, setCategoriaCustom] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  const handleAdd = async () => {
    const cat = categoria === "__custom" ? categoriaCustom.trim() : categoria;
    if (!cat || !valor) {
      toast({ title: "Preencha categoria e valor", variant: "destructive" });
      return;
    }
    try {
      await addDespesa({ categoria: cat, valor: Number(valor), descricao: descricao || null });
      toast({ title: "Despesa adicionada!" });
      setCategoria("");
      setCategoriaCustom("");
      setDescricao("");
      setValor("");
      setShowForm(false);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    await updateDespesa(id, { ativo: !ativo });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValor) return;
    await updateDespesa(id, { valor: Number(editValor) });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDespesa(id);
      toast({ title: "Despesa removida" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent">
            <Wallet className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Gastos Fixos Mensais</h2>
            <p className="text-sm text-muted-foreground">Tudo que você paga todo mês (aluguel, luz, etc.)</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showForm ? "Cancelar" : "Adicionar"}
        </Button>
      </div>

      {/* Total card */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Quanto gasto por mês</span>
        <span className="text-xl font-display font-bold text-primary">R$ {totalMensal.toFixed(2)}</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS_PADRAO.map((c) => (
                  <SelectItem key={c.categoria} value={c.categoria}>
                    {c.emoji} {c.categoria}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">✏️ Outra...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {categoria === "__custom" && (
            <div>
              <Label className="text-xs">Nome da categoria</Label>
              <Input value={categoriaCustom} onChange={(e) => setCategoriaCustom(e.target.value)} placeholder="Ex: Seguro" className="h-9" />
            </div>
          )}
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhe" className="h-9" />
          </div>
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" className="h-9" />
          </div>
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Salvar Despesa
          </Button>
        </div>
      )}

      {/* List */}
      {despesas.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhuma despesa cadastrada</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {despesas.map((d) => (
            <div key={d.id} className={`px-4 py-3 flex items-center gap-3 ${!d.ativo ? "opacity-50" : ""}`}>
              <Switch checked={d.ativo} onCheckedChange={() => handleToggle(d.id, d.ativo)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{d.categoria}</div>
                {d.descricao && <div className="text-xs text-muted-foreground truncate">{d.descricao}</div>}
              </div>
              {editingId === d.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    className="h-8 w-24"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(d.id)}>
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">R$ {Number(d.valor).toFixed(2)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => { setEditingId(d.id); setEditValor(String(d.valor)); }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
