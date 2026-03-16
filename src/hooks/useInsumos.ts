import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsumos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("insumos")
        .select("*")
        .eq("ativo", true)
        .order("nome", { ascending: true });

      if (fetchError) throw fetchError;
      setInsumos(data || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar insumos:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  const addInsumo = async (insumo: Pick<Insumo, "nome" | "unidade">) => {
    const { error } = await supabase.from("insumos").insert(insumo);
    if (error) throw error;
    await fetchInsumos();
  };

  const updateInsumo = async (id: string, updates: Partial<Insumo>) => {
    const { error } = await supabase.from("insumos").update(updates).eq("id", id);
    if (error) throw error;
    await fetchInsumos();
  };

  const deleteInsumo = async (id: string) => {
    const { error } = await supabase.from("insumos").delete().eq("id", id);
    if (error) throw error;
    await fetchInsumos();
  };

  return { insumos, isLoading, error, addInsumo, updateInsumo, deleteInsumo, refetch: fetchInsumos };
}
