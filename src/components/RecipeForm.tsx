import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useInsumos } from "@/hooks/useInsumos";
import { useReceitas, Ingrediente } from "@/hooks/useReceitas";
import { useProdutos } from "@/hooks/useProdutos";
import {
  ChefHat,
  Plus,
  Trash2,
  Hash,
  Loader2,
  BookOpen,
  UtensilsCrossed,
  Package,
} from "lucide-react";

export function RecipeForm() {
  const { toast } = useToast();
  const { insumos, isLoading: loadingInsumos } = useInsumos();
  const { addReceita } = useReceitas();
  const { produtos } = useProdutos();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modoPreparo, setModoPreparo] = useState("");
  const [rendimento, setRendimento] = useState("1");
  const [unidadeRendimento, setUnidadeRendimento] = useState("un");
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngrediente = () => {
    setIngredientes([
      ...ingredientes,
      { insumo_nome: "", quantidade: 0, unidade: "", custo_unitario: 0 },
    ]);
  };

  const updateIngrediente = (index: number, field: keyof Ingrediente, value: string | number) => {
    const updated = [...ingredientes];
    (updated[index] as any)[field] = value;
    setIngredientes(updated);
  };

  const handleInsumoSelect = (index: number, nome: string) => {
    const insumo = insumos.find((i) => i.nome === nome);
    const updated = [...ingredientes];
    updated[index] = {
      ...updated[index],
      insumo_nome: nome,
      unidade: insumo?.unidade || updated[index].unidade,
    };
    setIngredientes(updated);
  };

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }

    if (ingredientes.length === 0) {
      toast({
        title: "Adicione ingredientes",
        description: "Uma receita precisa de pelo menos um ingrediente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addReceita(
        {
          nome,
          descricao: descricao || null,
          modo_preparo: modoPreparo || null,
          foto_url: null,
          rendimento: Number(rendimento) || 1,
          unidade_rendimento: unidadeRendimento,
          ingredientes: [],
          produto_id: produtoId && produtoId !== "none" ? produtoId : null,
        },
        ingredientes
      );

      toast({
        title: "Receita cadastrada!",
        description: `"${nome}" salva com sucesso.`,
      });

      // Reset
      setNome("");
      setDescricao("");
      setModoPreparo("");
      setRendimento("1");
      setUnidadeRendimento("un");
      setIngredientes([]);
      setProdutoId("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível cadastrar a receita.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-section animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-accent">
          <ChefHat className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            Cadastro de Receita
          </h2>
          <p className="text-sm text-muted-foreground">
            Monte receitas e calcule custos automaticamente
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="input-label">Nome da Receita</Label>
          <Input
            placeholder="Ex: Bolo de Chocolate"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <Label className="input-label">Descrição (opcional)</Label>
          <Input
            placeholder="Breve descrição da receita"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div>
          <Label className="input-label">
            <Package className="w-4 h-4 inline mr-1" />
            Produto Vinculado
          </Label>
          <Select value={produtoId} onValueChange={setProdutoId}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {produtos.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="input-label">
              <Hash className="w-4 h-4 inline mr-1" />
              Rendimento
            </Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={rendimento}
              onChange={(e) => setRendimento(e.target.value)}
            />
          </div>
          <div>
            <Label className="input-label">Unidade</Label>
            <Select value={unidadeRendimento} onValueChange={setUnidadeRendimento}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RENDIMENTO_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ingredientes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="input-label mb-0">
              <UtensilsCrossed className="w-4 h-4 inline mr-1" />
              Ingredientes
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngrediente}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {ingredientes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
              Clique em "Adicionar" para incluir ingredientes
            </p>
          )}

          <div className="space-y-3">
            {ingredientes.map((ing, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/50 rounded-lg"

              >
                <div className="col-span-12 sm:col-span-5">
                  <Label className="text-xs text-muted-foreground">Insumo</Label>
                  {loadingInsumos ? (
                    <div className="flex items-center gap-1 h-10 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  ) : (
                    <Select
                      value={ing.insumo_nome}
                      onValueChange={(v) => handleInsumoSelect(index, v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {insumos.map((i) => (
                          <SelectItem key={i.codigo} value={i.nome}>
                            {i.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-9 text-sm"
                    value={ing.quantidade || ""}
                    onChange={(e) =>
                      updateIngrediente(index, "quantidade", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Unid.</Label>
                  <Select
                    value={ing.unidade}
                    onValueChange={(v) => updateIngrediente(index, "unidade", v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g (gramas)</SelectItem>
                      <SelectItem value="kg">kg (quilos)</SelectItem>
                      <SelectItem value="mg">mg (miligramas)</SelectItem>
                      <SelectItem value="ml">ml (mililitros)</SelectItem>
                      <SelectItem value="L">L (litros)</SelectItem>
                      <SelectItem value="un">un (unidades)</SelectItem>
                      <SelectItem value="m">m (metros)</SelectItem>
                      <SelectItem value="cm">cm (centímetros)</SelectItem>
                      <SelectItem value="colher_sopa">colher de sopa</SelectItem>
                      <SelectItem value="colher_cha">colher de chá</SelectItem>
                      <SelectItem value="xicara">xícara</SelectItem>
                      <SelectItem value="fatia">fatia</SelectItem>
                      <SelectItem value="pct">pacote</SelectItem>
                      <SelectItem value="cx">caixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeIngrediente(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Modo de preparo */}
        <div>
          <Label className="input-label">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Modo de Preparo (opcional)
          </Label>
          <Textarea
            placeholder="Descreva o passo a passo..."
            rows={4}
            value={modoPreparo}
            onChange={(e) => setModoPreparo(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Cadastrar Receita
        </Button>
      </div>
    </form>
  );
}
