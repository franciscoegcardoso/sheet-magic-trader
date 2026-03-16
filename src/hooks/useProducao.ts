import { useState, useEffect, useCallback, useMemo } from "react";
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

interface VendaResumida {
  produto: string;
  quantidade: number;
}

export function useProducao() {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [vendas, setVendas] = useState<VendaResumida[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducoes = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prodRes, vendaRes] = await Promise.all([
        supabase.from("producao").select("*").order("data_producao", { ascending: false }),
        supabase.from("vendas").select("produto"),
      ]);
      if (prodRes.error) throw prodRes.error;
      if (vendaRes.error) throw vendaRes.error;
      setProducoes(prodRes.data || []);
      // Each venda row = 1 unit sold (quantity field doesn't exist on vendas)
      setVendas((vendaRes.data || []).map((v: any) => ({ produto: v.produto, quantidade: 1 })));
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

  // Produced per product
  const produzido = useMemo(() =>
    producoes.reduce((acc, p) => {
      acc[p.produto_nome] = (acc[p.produto_nome] || 0) + Number(p.quantidade);
      return acc;
    }, {} as Record<string, number>),
  [producoes]);

  // Sold per product
  const vendido = useMemo(() =>
    vendas.reduce((acc, v) => {
      acc[v.produto] = (acc[v.produto] || 0) + v.quantidade;
      return acc;
    }, {} as Record<string, number>),
  [vendas]);

  // Real stock = produced - sold
  const estoqueProdutos = useMemo(() => {
    const all = new Set([...Object.keys(produzido), ...Object.keys(vendido)]);
    const result: Record<string, number> = {};
    all.forEach((key) => {
      result[key] = (produzido[key] || 0) - (vendido[key] || 0);
    });
    return result;
  }, [produzido, vendido]);

  return { producoes, isLoading, addProducao, deleteProducao, estoqueProdutos, produzido, vendido, refetch: fetchProducoes };
}
