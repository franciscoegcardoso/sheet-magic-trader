import { useReceitas } from "@/hooks/useReceitas";
import { useProdutos } from "@/hooks/useProdutos";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ChefHat, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RecipeList() {
  const { receitas, isLoading, deleteReceita } = useReceitas();
  const { produtos } = useProdutos();
  const { toast } = useToast();

  const handleDelete = async (id: string, nome: string) => {
    try {
      await deleteReceita(id);
      toast({ title: "Receita removida", description: `"${nome}" foi excluída.` });
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

  if (receitas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Nenhuma receita cadastrada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {receitas.map((r) => {
        const produto = produtos.find((p) => p.id === r.produto_id);
        return (
          <div
            key={r.id}
            className="p-4 bg-card border border-border rounded-xl shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground truncate">
                  {r.nome}
                </h3>
                {r.descricao && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {r.descricao}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {r.ingredientes?.length || 0} ingredientes
                  </span>
                  <span className="text-muted-foreground">
                    Rend: {r.rendimento} {r.unidade_rendimento}
                  </span>
                  {produto && (
                    <span className="flex items-center gap-1 text-primary">
                      <Package className="w-3.5 h-3.5" />
                      {produto.nome}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => handleDelete(r.id, r.nome)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
