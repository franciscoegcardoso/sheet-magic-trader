import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DespesaFixa {
  id: string;
  categoria: string;
  descricao: string | null;
  valor: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIAS_PADRAO = [
  { categoria: "Aluguel", emoji: "🏠" },
  { categoria: "Energia / Água", emoji: "💡" },
  { categoria: "Internet / Tel.", emoji: "📱" },
  { categoria: "Contador", emoji: "📋" },
  { categoria: "Manutenção", emoji: "🔧" },
  { categoria: "Marketing", emoji: "📢" },
  { categoria: "Pró-labore", emoji: "👤" },
  { categoria: "Reserva", emoji: "🏦" },
];

export { CATEGORIAS_PADRAO };

export function useDespesasFixas() {
  const [despesas, setDespesas] = useState<DespesaFixa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDespesas = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("despesas_fixas")
        .select("*")
        .order("categoria", { ascending: true });
      if (error) throw error;
      setDespesas(data || []);
    } catch (err) {
      console.error("Erro ao carregar despesas fixas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDespesas();
  }, [fetchDespesas]);

  const addDespesa = async (despesa: Pick<DespesaFixa, "categoria" | "valor" | "descricao">) => {
    const { error } = await supabase.from("despesas_fixas").insert(despesa);
    if (error) throw error;
    await fetchDespesas();
  };

  const updateDespesa = async (id: string, updates: Partial<DespesaFixa>) => {
    const { error } = await supabase.from("despesas_fixas").update(updates).eq("id", id);
    if (error) throw error;
    await fetchDespesas();
  };

  const deleteDespesa = async (id: string) => {
    const { error } = await supabase.from("despesas_fixas").delete().eq("id", id);
    if (error) throw error;
    await fetchDespesas();
  };

  const totalMensal = despesas.filter((d) => d.ativo).reduce((sum, d) => sum + Number(d.valor), 0);

  return { despesas, isLoading, addDespesa, updateDespesa, deleteDespesa, totalMensal, refetch: fetchDespesas };
}
