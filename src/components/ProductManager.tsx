import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProdutos } from "@/hooks/useProdutos";
import { useReceitas } from "@/hooks/useReceitas";
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  DollarSign,
  Loader2,
  ChefHat,
  Check,
  X,
} from "lucide-react";

export function ProductManager() {
  const { toast } = useToast();
  const { produtos, isLoading, addProduto, updateProduto, deleteProduto } = useProdutos();
  const { receitas } = useReceitas();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [unidade, setUnidade] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [receitaId, setReceitaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTamanho("");
    setUnidade("");
    setPrecoVenda("");
    setReceitaId("");
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: typeof produtos[0]) => {
    setNome(p.nome);
    setDescricao(p.descricao || "");
    setTamanho(p.tamanho || "");
    setUnidade(p.unidade || "");
    setPrecoVenda(String(p.preco_venda));
    setReceitaId(p.receita_id || "");
    setEditingId(p.id);
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
        descricao: descricao || null,
        tamanho: tamanho || null,
        unidade: unidade || null,
        preco_venda: Number(precoVenda) || 0,
        receita_id: receitaId || null,
        ativo: true,
      };

      if (editingId) {
        await updateProduto(editingId, data);
        toast({ title: "Produto atualizado!" });
      } else {
        await addProduto(data);
        toast({ title: "Produto cadastrado!" });
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
      await deleteProduto(id);
      toast({ title: "Produto excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent">
            <Package className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Produtos</h2>
            <p className="text-sm text-muted-foreground">Gerencie seus produtos e vincule a receitas</p>
          </div>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bolo de Chocolate P" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Breve descrição" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tamanho</Label>
              <Input value={tamanho} onChange={(e) => setTamanho(e.target.value)} placeholder="P, M, G, 500ml..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unidade</Label>
              <Input value={unidade} onChange={(e) => setUnidade(e.target.value)} placeholder="un, kg, L..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5 inline mr-0.5" />
                Preço de Venda (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                <ChefHat className="w-3.5 h-3.5 inline mr-0.5" />
                Receita Vinculada
              </Label>
              <Select value={receitaId} onValueChange={setReceitaId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {receitas.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

      {/* Product list */}
      {produtos.length === 0 && !showForm ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
          Nenhum produto cadastrado. Clique em "Novo" para começar.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {produtos.map((p) => {
            const receita = receitas.find((r) => r.id === p.receita_id);
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{p.nome}</span>
                    {p.tamanho && (
                      <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{p.tamanho}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {receita ? (
                      <span className="text-primary">
                        <ChefHat className="w-3 h-3 inline mr-0.5" />
                        {receita.nome}
                      </span>
                    ) : (
                      "Sem receita vinculada"
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    R$ {Number(p.preco_venda).toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(p)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id, p.nome)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
