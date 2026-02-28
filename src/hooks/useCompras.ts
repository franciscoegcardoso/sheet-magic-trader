import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const fetchCompras = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("compras")
        .select("*")
        .order("data_compra", { ascending: false });

      if (error) throw error;
      setCompras(data || []);
    } catch (err) {
      console.error("Erro ao carregar compras:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const addCompra = async (compra: Omit<Compra, "id" | "created_at">) => {
    const { error } = await supabase.from("compras").insert(compra);
    if (error) throw error;
    await fetchCompras();
  };

  const custoMedioPorInsumo: CustoMedioInsumo[] = (() => {
    const map = new Map<string, { total_qty: number; total_val: number; ultima: string; count: number }>();
    compras.forEach((c) => {
      const existing = map.get(c.insumo_nome) || { total_qty: 0, total_val: 0, ultima: "", count: 0 };
      existing.total_qty += Number(c.quantidade);
      existing.total_val += Number(c.valor_compra);
      existing.count += 1;
      if (!existing.ultima || c.data_compra > existing.ultima) existing.ultima = c.data_compra;
      map.set(c.insumo_nome, existing);
    });
    return Array.from(map.entries()).map(([nome, d]) => ({
      insumo_nome: nome,
      total_comprado: d.total_qty,
      total_gasto: d.total_val,
      custo_medio: d.total_qty > 0 ? d.total_val / d.total_qty : 0,
      ultima_compra: d.ultima,
      num_compras: d.count,
    })).sort((a, b) => a.insumo_nome.localeCompare(b.insumo_nome));
  })();

  return { compras, isLoading, addCompra, custoMedioPorInsumo, refetch: fetchCompras };
}
