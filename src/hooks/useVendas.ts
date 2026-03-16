import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 50;

export interface Venda {
  id: string;
  cliente: string;
  telefone_cliente: string | null;
  produto: string;
  tamanho: string | null;
  embalagem: string | null;
  valor_frete: number | null;
  forma_pagamento: string | null;
  valor_venda: number;
  data_venda: string;
  cliente_id: string | null;
  created_at: string;
}

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchVendas = useCallback(async (reset = true) => {
    try {
      setIsLoading(true);
      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("vendas")
        .select("*")
        .order("data_venda", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (reset) {
        setVendas(data || []);
        setPage(1);
      } else {
        setVendas((prev) => [...prev, ...(data || [])]);
        setPage((p) => p + 1);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const fetchMore = useCallback(() => {
    if (!isLoading && hasMore) fetchVendas(false);
  }, [isLoading, hasMore, fetchVendas]);

  useEffect(() => {
    fetchVendas(true);
  }, []);

  const addVenda = async (venda: Omit<Venda, "id" | "created_at">) => {
    const { error } = await supabase.from("vendas").insert(venda);
    if (error) throw error;
    await fetchVendas(true);
  };

  return { vendas, isLoading, addVenda, refetch: fetchVendas, hasMore, fetchMore };
}
