import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conta {
  id: string;
  tipo: "pagar" | "receber";
  descricao: string;
  valor: number;
  categoria: string | null;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pendente" | "pago" | "atrasado";
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export function useContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContas = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .order("data_vencimento", { ascending: true });
      if (error) throw error;
      setContas((data as unknown as Conta[]) || []);
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchContas(); }, [fetchContas]);

  const addConta = async (conta: Omit<Conta, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("contas").insert(conta as any);
    if (error) throw error;
    await fetchContas();
  };

  const updateConta = async (id: string, updates: Partial<Conta>) => {
    const { error } = await supabase.from("contas").update(updates as any).eq("id", id);
    if (error) throw error;
    await fetchContas();
  };

  const deleteConta = async (id: string) => {
    const { error } = await supabase.from("contas").delete().eq("id", id);
    if (error) throw error;
    await fetchContas();
  };

  return { contas, isLoading, addConta, updateConta, deleteConta, refetch: fetchContas };
}
