import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Ingrediente {
  id?: string;
  insumo_nome: string;
  quantidade: number;
  unidade: string;
  custo_unitario: number;
}

export interface Receita {
  id: string;
  nome: string;
  descricao: string | null;
  modo_preparo: string | null;
  foto_url: string | null;
  rendimento: number;
  unidade_rendimento: string;
  produto_id: string | null;
  created_at: string;
  updated_at: string;
  ingredientes?: Ingrediente[];
  custo_total?: number;
}

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceitas = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: receitasData, error: receitasError } = await supabase
        .from("receitas")
        .select("*")
        .order("created_at", { ascending: false });

      if (receitasError) throw receitasError;

      const { data: ingredientesData, error: ingError } = await supabase
        .from("receita_ingredientes")
        .select("*");

      if (ingError) throw ingError;

      const receitasComIngredientes = (receitasData || []).map((r) => {
        const ingredientes = (ingredientesData || []).filter(
          (i) => i.receita_id === r.id
        );
        const custo_total = ingredientes.reduce(
          (sum, i) => sum + (i.quantidade || 0) * (i.custo_unitario || 0),
          0
        );
        return { ...r, ingredientes, custo_total };
      });

      setReceitas(receitasComIngredientes);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar receitas:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceitas();
  }, [fetchReceitas]);

  const addReceita = async (
    receita: Omit<Receita, "id" | "created_at" | "updated_at" | "custo_total">,
    ingredientes: Ingrediente[]
  ) => {
    const { data, error } = await supabase
      .from("receitas")
      .insert({
        nome: receita.nome,
        descricao: receita.descricao,
        modo_preparo: receita.modo_preparo,
        foto_url: receita.foto_url,
        rendimento: receita.rendimento,
        unidade_rendimento: receita.unidade_rendimento,
        produto_id: receita.produto_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (ingredientes.length > 0) {
      const { error: ingError } = await supabase
        .from("receita_ingredientes")
        .insert(
          ingredientes.map((i) => ({
            receita_id: data.id,
            insumo_nome: i.insumo_nome,
            quantidade: i.quantidade,
            unidade: i.unidade,
            custo_unitario: i.custo_unitario,
          }))
        );
      if (ingError) throw ingError;
    }

    await fetchReceitas();
    return data;
  };

  const deleteReceita = async (id: string) => {
    const { error } = await supabase.from("receitas").delete().eq("id", id);
    if (error) throw error;
    await fetchReceitas();
  };

  return { receitas, isLoading, error, addReceita, deleteReceita, refetch: fetchReceitas };
}
