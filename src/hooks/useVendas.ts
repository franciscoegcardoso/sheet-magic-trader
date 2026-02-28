import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Venda {
  id: string;
  cliente: string;
  telefone_cliente: string | null;
  produto: string;
  tamanho: string | null;
  embalagem: string | null;
  valor_frete: number;
  forma_pagamento: string | null;
  valor_venda: number;
  data_venda: string;
  cliente_id: string | null;
  created_at: string;
}

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendas = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .order("data_venda", { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  const addVenda = async (venda: Omit<Venda, "id" | "created_at">) => {
    const { error } = await supabase.from("vendas").insert(venda);
    if (error) throw error;
    await fetchVendas();
  };

  return { vendas, isLoading, addVenda, refetch: fetchVendas };
}
