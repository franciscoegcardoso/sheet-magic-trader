import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Pedido {
  id: string;
  cliente_id: string | null;
  cliente_nome: string;
  produto: string;
  descricao: string | null;
  quantidade: number;
  valor: number;
  data_pedido: string;
  data_entrega: string;
  status: "pendente" | "em_producao" | "pronto" | "entregue" | "cancelado";
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("data_entrega", { ascending: true });
      if (error) throw error;
      setPedidos((data as unknown as Pedido[]) || []);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  const addPedido = async (pedido: Omit<Pedido, "id" | "created_at" | "updated_at">) => {
    const { error } = await supabase.from("pedidos").insert(pedido as any);
    if (error) throw error;
    await fetchPedidos();
  };

  const updatePedido = async (id: string, updates: Partial<Pedido>) => {
    const { error } = await supabase.from("pedidos").update(updates as any).eq("id", id);
    if (error) throw error;
    await fetchPedidos();
  };

  const deletePedido = async (id: string) => {
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (error) throw error;
    await fetchPedidos();
  };

  return { pedidos, isLoading, addPedido, updatePedido, deletePedido, refetch: fetchPedidos };
}
