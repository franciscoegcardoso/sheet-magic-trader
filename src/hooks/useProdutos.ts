import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  tamanho: string | null;
  unidade: string | null;
  preco_venda: number;
  receita_id: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setProdutos(data || []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = async (produto: Omit<Produto, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("produtos").insert(produto);
    if (error) throw error;
    await fetchProdutos();
  };

  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    const { error } = await supabase.from("produtos").update(updates).eq("id", id);
    if (error) throw error;
    await fetchProdutos();
  };

  const deleteProduto = async (id: string) => {
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) throw error;
    await fetchProdutos();
  };

  return { produtos, isLoading, addProduto, updateProduto, deleteProduto, refetch: fetchProdutos };
}
