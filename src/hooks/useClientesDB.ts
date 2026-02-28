import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClienteDB {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useClientesDB() {
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const addCliente = async (cliente: Omit<ClienteDB, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("clientes").insert(cliente).select().single();
    if (error) throw error;
    await fetchClientes();
    return data;
  };

  const updateCliente = async (id: string, updates: Partial<ClienteDB>) => {
    const { error } = await supabase.from("clientes").update(updates).eq("id", id);
    if (error) throw error;
    await fetchClientes();
  };

  const deleteCliente = async (id: string) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;
    await fetchClientes();
  };

  return { clientes, isLoading, addCliente, updateCliente, deleteCliente, refetch: fetchClientes };
}
