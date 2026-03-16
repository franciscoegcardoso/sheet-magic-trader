import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 50;

export interface Compra {
  id: string;
  insumo_nome: string;
  quantidade: number;
  unidade: string | null;
  data_compra: string;
  valor_compra: number;
  created_at: string;
}

export interface CustoMedioInsumo {
  insumo_nome: string;
  total_comprado: number;
  total_gasto: number;
  custo_medio: number;
  ultima_compra: string;
  num_compras: number;
}

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [custoMedioPorInsumo, setCustoMedioPorInsumo] = useState<CustoMedioInsumo[]>([]);

  const fetchCompras = useCallback(async (reset = true) => {
    try {
      setIsLoading(true);
      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("compras")
        .select("*")
        .order("data_compra", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (reset) {
        setCompras(data || []);
        setPage(1);
      } else {
        setCompras((prev) => [...prev, ...(data || [])]);
        setPage((p) => p + 1);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (err) {
      console.error("Erro ao carregar compras:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const fetchMore = useCallback(() => {
    if (!isLoading && hasMore) fetchCompras(false);
  }, [isLoading, hasMore, fetchCompras]);

  // Server-side aggregation
  const fetchCustoMedio = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_custo_medio_insumos");
      if (error) throw error;
      setCustoMedioPorInsumo(
        (data || []).map((d: any) => ({
          insumo_nome: d.insumo_nome,
          total_comprado: Number(d.total_comprado),
          total_gasto: Number(d.total_gasto),
          custo_medio: Number(d.custo_medio),
          ultima_compra: d.ultima_compra,
          num_compras: Number(d.num_compras),
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar custo médio:", err);
    }
  }, []);

  useEffect(() => {
    fetchCompras(true);
    fetchCustoMedio();
  }, []);

  const addCompra = async (compra: Omit<Compra, "id" | "created_at">) => {
    const { error } = await supabase.from("compras").insert(compra);
    if (error) throw error;
    await fetchCompras(true);
    await fetchCustoMedio();
  };

  return { compras, isLoading, addCompra, custoMedioPorInsumo, refetch: fetchCompras, hasMore, fetchMore };
}
