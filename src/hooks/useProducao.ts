import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Producao {
  id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  data_producao: string;
  observacao: string | null;
  created_at: string;
}

export function useProducao() {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducoes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("producao")
        .select("*")
        .order("data_producao", { ascending: false });
      if (error) throw error;
      setProducoes(data || []);
    } catch (err) {
      console.error("Erro ao carregar produções:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducoes();
  }, [fetchProducoes]);

  const addProducao = async (producao: Omit<Producao, "id" | "created_at">) => {
    const { error } = await supabase.from("producao").insert(producao);
    if (error) throw error;
    await fetchProducoes();
  };

  const deleteProducao = async (id: string) => {
    const { error } = await supabase.from("producao").delete().eq("id", id);
    if (error) throw error;
    await fetchProducoes();
  };

  // Stock summary per product
  const estoqueProdutos = producoes.reduce((acc, p) => {
    const key = p.produto_nome;
    acc[key] = (acc[key] || 0) + Number(p.quantidade);
    return acc;
  }, {} as Record<string, number>);

  return { producoes, isLoading, addProducao, deleteProducao, estoqueProdutos, refetch: fetchProducoes };
}
